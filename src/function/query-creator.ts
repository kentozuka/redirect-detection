import { createResultWithArticles, findResult } from 'helper/prisma'
import { search } from '@lib/customSearch'
import { logger } from '@lib/log'

export async function createQuery(query: string) {
  const res = await search(query)
  if (!(res.items && res.searchInformation)) {
    logger.warn(`lacking parameters | ${query}`)
    return null
  }

  const {
    items,
    searchInformation: { searchTime, totalResults }
  } = res

  const createResultInput = {
    text: query,
    array: query.split(/\s/),
    totalResults,
    searchTime
  }
  const exist = await findResult(createResultInput)
  if (exist) {
    logger.warn(`DB already has entry | ${query}`)
    return exist
  }

  const articles = items.map((item) => {
    const image = item.pagemap.cse_image ? item.pagemap.cse_image[0].src : ''
    return {
      where: {
        url: item.link
      },
      create: {
        url: item.link,
        title: item.title,
        description: item.snippet,
        image
      }
    }
  })

  const created = await createResultWithArticles(createResultInput, articles)
  return created
}
