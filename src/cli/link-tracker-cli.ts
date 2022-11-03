import prompts from 'prompts'

import { closePersistentContext } from '@lib/playwright'
import { checkRedirects } from '@function/link-tracker'
import { disconnectPrisma } from '@components/prisma'
import { breakdownURL } from '@components/url'
import { useEnvironmentVariable } from '@lib/dotenv'

process.on('exit', async () => disconnectPrisma())

!(async () => {
  let loop = true
  while (loop) {
    const res = await prompts({
      type: 'text',
      message: 'Type in first link address: ',
      name: 'target'
    })

    if (res.target === '') {
      loop = false
      continue
    }

    console.time('Background Check')

    const target = res.target as string
    const redirectResponse = await checkRedirects(target, {
      headless: useEnvironmentVariable('PLAYWRIGHT_HEADLESS') === 'true'
    })

    if (redirectResponse === null) {
      console.log('Failed to evaluate the link')
      continue
    }
    const { redirects, destination } = redirectResponse

    const sp = (x: string) => (x.length < 60 ? x : x.slice(0, 60) + '...')
    const tb = {
      start: sp(target),
      destination: sp(destination),
      'document num': redirects.length || 1
    }
    const rtb = redirects.map((x) => ({ ...x, url: sp(x.url) }))

    const startUrl = breakdownURL(target)
    const destiUrl = breakdownURL(destination)

    console.log('\n')

    console.log('start search params', startUrl.searchParams)
    console.log('destination search params', destiUrl.searchParams)

    console.table(tb)
    console.table(rtb)
    console.timeEnd('Background Check')
    console.log('\n\n')
  }

  await closePersistentContext()
})()
