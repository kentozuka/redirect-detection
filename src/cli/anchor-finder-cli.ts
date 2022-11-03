import prompts from 'prompts'

import { closePersistentContext } from '@lib/playwright'
import { disconnectPrisma } from '@components/prisma'
import { queryAnchors } from '@function/anchor-finder'

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

    console.time('Anchor Finder')

    const target = res.target as string
    await queryAnchors(target, { headless: false })
    console.timeEnd('Anchor Finder')
    console.log('\n\n')
  }

  await closePersistentContext()
})()
