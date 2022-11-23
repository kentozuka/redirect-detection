import { scrapeAnchors } from '@function/anchor-finder'
import { createQuery } from '@function/query-creator'
import {
  createResultWithArticles,
  findArticleFromResultId,
  get100search,
  getFirstUndoneKeyword,
  getUndoneKeywords,
  getUnfinishedJobs,
  markSearchAsDone
} from '@components/prisma'
import {
  closeBackgroundBrowserContext,
  closePersistentContext
} from '@lib/playwright'
import { logger } from '@lib/log'
import {
  getArticlesFromTopic,
  getRelatedTopicsOnGoogle
} from '@components/google'

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

  for (const article of articles) {
    await scrapeAnchors(article)
  }
}

!(async () => {
  const word = await getFirstUndoneKeyword()
  if (word === null) {
    logger.error('No more word to crawl')
    return
  }
  const realteds = await getRelatedTopicsOnGoogle(word.word)
  for (const topic of realteds) {
    await handleTopic(topic)
  }
  await markSearchAsDone(word.id)

  await closePersistentContext()
  await closeBackgroundBrowserContext()
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
