import prompts from 'prompts'
import { useEnvironmentVariable } from '../lib/dotenv'

import { checkRedirects, closeBrowser } from '../function/link-tracker'
import { breakdownURL } from '../function/parameter'
import { queryAnchors } from '../function/anchor-finder'

!(async () => {
  let loop = true
  while (loop) {
    const res = await prompts({
      type: 'text',
      message: 'Type in first link address: ',
      name: 'target'
    })

    if (res.target === '') return (loop = false)

    console.time('Anchor Finder')

    const target = res.target as string
    await queryAnchors(target, { headless: false })
    console.timeEnd('Anchor Finder')
    console.log('\n\n')
  }

  await closeBrowser()
})()
