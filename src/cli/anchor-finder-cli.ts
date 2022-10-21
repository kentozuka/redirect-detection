import prompts from 'prompts'
import { closeBrowser, queryAnchors } from '../function/anchor-finder'

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

    console.time('Anchor Finder')

    const target = res.target as string
    await queryAnchors(target, { headless: false })
    console.timeEnd('Anchor Finder')
    console.log('\n\n')
  }

  await closeBrowser()
})()
