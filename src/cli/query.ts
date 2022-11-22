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
})

import { getRelatedTopicsOnGoogle } from '@components/google'
import { createManySearchResult } from '@components/prisma'
import { logger } from '@lib/log'

const registerFromJson = (async () => {
  const keywords = ['']
  for (const keyword of keywords) {
    const relateds = await getRelatedTopicsOnGoogle(keyword)
    if (!relateds) {
      logger.warn(`no related words ${keyword}`)
      continue
    }

    await createManySearchResult(relateds)
  }
})()

// TODO

// turn json into txt
// read line by line
// remove when done

// search createmany avoid duplicate

// implement getting result from related search
// but do the thing above first and while at it create saerch thing

// add memory uses manager
// process.memory().heap / 1024 / 1024
