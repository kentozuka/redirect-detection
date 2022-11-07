import { createResult } from '@components/prisma'
import { search } from '@lib/customSearch'

const query = '脱毛　おすすめ'

!(async () => {
  console.time('script')
  const res = await search(query)
  if (!(res.items && res.searchInformation))
    return console.log('lacking required parameters')

  const {
    items,
    searchInformation: { searchTime, totalResults }
  } = res

  const created = await createResult({
    text: query,
    array: query.split(/\s/),
    totalResults,
    searchTime
  })
  // if (!created) return console.log('already inside of the db')

  const articles = items.map((item) => {
    const image = item.pagemap.cse_image ? item.pagemap.cse_image[0].src : ''
    return {
      url: item.link,
      title: item.title,
      description: item.snippet,
      image
    }
  })

  console.log(articles)

  console.timeEnd('script')
})()
