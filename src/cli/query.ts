import prompts from 'prompts'
import { createQuery } from '@function/query-creator'

const ask = async () => {
  const res = await prompts({
    type: 'text',
    message: 'Type in keyword: ',
    name: 'value'
  })

  const res2 = await prompts({
    type: 'confirm',
    message: `Can I create now? [${res.value}]`,
    name: 'value'
  })

  if (res2.value) {
    await createQuery(res.value)
  }
}

!(async () => {
  let con = true
  while (con) {
    await ask()
    const res = await prompts({
      type: 'confirm',
      message: 'wanna add another one?',
      name: 'value'
    })

    con = res.value
  }
})()

/**
 * TODO
 * figure out whats causing the memoru leak
 * - endedat null retry
 *
 */
