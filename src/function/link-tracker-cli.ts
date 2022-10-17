import prompts from 'prompts'

import { checkRedirects } from './link-tracker'

!(async () => {
  while (true) {
    const res = await prompts({
      type: 'text',
      message: 'Type in first link address: ',
      name: 'target'
    })

    console.time('Background Check')

    const target = res.target as string
    const { redirects, destination } = await checkRedirects(target, {
      headless: true
    })

    const sp = (x: string) => (x.length < 60 ? x : x.slice(0, 60) + '...')
    const tb = {
      start: sp(target),
      destination: sp(destination),
      'document num': redirects.length || 1
    }
    const rtb = redirects.map((x) => ({ ...x, url: sp(x.url) }))

    console.log('\n')
    console.table(tb)
    console.table(rtb)
    console.timeEnd('Background Check')
    console.log('\n\n')
  }
})()
