import { scrapeAnchors } from '@function/anchor-finder'
import { truncate } from '@lib/util'
import { logger } from '@lib/log'

import {
  createResultWithArticles,
  findArticleFromResultId,
  getAvoidHostnames,
  getFirstUndoneKeyword,
  markSearchAsDone,
  markWordAsDone
} from 'helper/prisma'

import {
  closeBackgroundBrowserContext,
  closePersistentContext
} from '@lib/playwright'

import { getArticlesFromTopic, getRelatedTopicsOnGoogle } from 'helper/google'

const handleTopic = async (topic: string) => {
  const { searchTime, totalResults, links } = await getArticlesFromTopic(topic)
  const result = await createResultWithArticles(
    {
      searchTime,
      totalResults,
      text: topic,
      array: topic.split(/\s/)
    },
    links.map((url) => ({ where: { url }, create: { url } }))
  )

  const articles = await findArticleFromResultId(result.id)

  const avoids = await getAvoidHostnames()
  for (const article of articles) {
    const hostname = new URL(article.url).hostname
    if (avoids.includes(hostname)) {
      logger.warn(`[AVOID] | {${article.id}} ${truncate(hostname)}`)
      continue
    }
    await scrapeAnchors(article)
  }
}

const crawl = async () => {
  const word = await getFirstUndoneKeyword()
  if (word === null) {
    logger.error('No more word to crawl')
    return
  }
  const realteds = await getRelatedTopicsOnGoogle(word.word)
  for (const topic of realteds) {
    await handleTopic(topic)
  }
  await markWordAsDone(word.id)

  await closePersistentContext()
  await closeBackgroundBrowserContext()

  await crawl()
}

!(async () => {
  await crawl()
})()

// using Google's Official API which has the daily limit of 100

// !(async () => {
//   const searches = await get100search()

//   for (const { id: saerchId, q: query } of searches) {
//     const result = await createQuery(query)

//     const articles = await findArticleFromResultId(result.id)
//     logger.info(`Starting articles | ${articles.length} items`)
//     for (const article of articles) {
//       await scrapeAnchors(article)
//     }

//     await markSearchAsDone(saerchId)
//   }

//   // doing unfinished jobs
//   const jobs = await getUnfinishedJobs()
//   for (const job of jobs) {
//     await scrapeAnchors(job)
//   }

//   await closePersistentContext()
//   await closeBackgroundBrowserContext()
// })()
