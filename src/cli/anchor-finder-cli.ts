import prompts from 'prompts'
import { queryAnchors } from '../function/anchor-finder'
import { closePersistentContext } from '../lib/playwright'

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

  await closePersistentContext()
})()
