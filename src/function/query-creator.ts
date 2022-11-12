import { createResultWithArticles, findResult } from '@components/prisma'
import { search } from '@lib/customSearch'

export async function createQuery(query: string) {
  const res = await search(query)
  if (!(res.items && res.searchInformation)) {
    console.log(`${query} is lacking required parameters`)
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
    console.log(`${query} is already inside of the db`)
    return null
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
