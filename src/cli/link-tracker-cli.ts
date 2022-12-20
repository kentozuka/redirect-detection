import prompts from 'prompts'

import { closePersistentContext } from '@lib/playwright'
import { checkRedirects } from '@function/link-tracker'
import { disconnectPrisma } from 'helper/prisma'
import { breakdownURL } from '@lib/util'

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
    const redirectResponse = await checkRedirects(target)

    if (redirectResponse === null) {
      console.log('Failed to evaluate the link')
      continue
    }
    const { redirects, destination } = redirectResponse

    const sp = (x: string) => (x.length < 100 ? x : x.slice(0, 100) + '...')
    const tb = {
      start: sp(target),
      destination: sp(destination),
      'document num': redirects.length || 1
    }
    const rtb = redirects.map((x) => ({ ...x, url: sp(x.url) }))

    // console.table(tb)
    console.table(rtb)
    console.timeEnd('Background Check')
  }

  await closePersistentContext()
})()
