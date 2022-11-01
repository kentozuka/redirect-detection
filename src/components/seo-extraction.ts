import { Page } from 'playwright'

interface Meta {
  name: string
  content: string
}
const filterContent = (metas: Meta[], target: string): string => {
  const filtered = metas.filter(({ name }) => name === target)

  const len = filtered.length
  if (len === 0) return ''
  if (len > 1) console.log(`There's more than one ${target} meta. (${len})`)

  return filtered[0].content
}

export default async function (page: Page) {
  const metas = await page.$$eval('meta', (metas) =>
    metas.map((meta) => ({
      name: meta.name || meta.getAttribute('property') || '',
      content: meta.content
    }))
  )

  return {
    title: await page.title(),
    keywords: filterContent(metas, 'keywords'),
    description: filterContent(metas, 'description'),
    image: filterContent(metas, 'og:image')
  }
}

// {
//   url String @unique
//   title String?
//   keywords String?
//   description String?
//   image String?
//   anchors Anchor[]
// }
