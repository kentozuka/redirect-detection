import { scrapeAnchors } from '@function/anchor-finder'
import { createQuery } from '@function/query-creator'
import {
  findArticleFromResultId,
  get100search,
  getUnfinishedJobs,
  markSearchAsDone
} from '@components/prisma'
import {
  closeBackgroundBrowserContext,
  closePersistentContext
} from '@lib/playwright'
import { logger } from '@lib/log'

!(async () => {
  const searches = await get100search()

  for (const { id: saerchId, q: query } of searches) {
    const result = await createQuery(query)

    const articles = await findArticleFromResultId(result.id)
    logger.info(`Starting articles | ${articles.length} items`)
    for (const article of articles) {
      await scrapeAnchors(article)
    }

    await markSearchAsDone(saerchId)
  }

  // doing unfinished jobs
  const jobs = await getUnfinishedJobs()
  for (const job of jobs) {
    await scrapeAnchors(job)
  }

  await closePersistentContext()
  await closeBackgroundBrowserContext()
})()
