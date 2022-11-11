import { Anchor, Prisma, PrismaClient, Variation } from '@prisma/client'
import {
  AnchorEssentials,
  DocEssentials,
  RouteEssentials,
  VariationEssential
} from '@c-types/index'

const prisma = new PrismaClient()

export const disconnectPrisma = async () => {
  await prisma.$disconnect()
}

export const createArticle = async (seo: Prisma.ArticleCreateInput) => {
  const exist = await prisma.article.findUnique({
    where: {
      url: seo.url
    }
  })
  if (exist !== null) return exist
  const done = await prisma.article.create({ data: seo })
  return done
}

export const createAnchorWithRoute = async (
  articleId: number,
  anchor: AnchorEssentials,
  route: RouteEssentials,
  docs: DocEssentials[]
) => {
  const existed = await prisma.anchor.findUnique({
    where: {
      href: anchor.href
    }
  })
  if (existed) return existed

  const paramed = docs.map((doc) => {
    const url = new URL(doc.url)
    const objs = [...url.searchParams.entries()].map((x) => ({
      key: x[0],
      value: x[1]
    }))
    return {
      ...doc,
      parameters: {
        create: objs
      }
    }
  })
  const created = await prisma.anchor.create({
    data: {
      ...anchor,
      article: {
        connect: {
          id: articleId
        }
      },
      route: {
        create: {
          ...route,
          docs: {
            create: paramed
          }
        }
      }
    }
  })

  return created
}

const knownDimension = async (
  anchorId: number,
  four: {
    x: number
    y: number
    width: number
    height: number
  }
) => {
  const meta = [four.width, four.height, four.x, four.y]
  const variations = await getVariantMetaData(anchorId)
  const exist = variations.some((a) =>
    Object.values(a).map((el, ix) => el === meta[ix])
  )
  return exist
}

export const getVariant = async (
  anchorId: number,
  dimension: {
    x: number
    y: number
    width: number
    height: number
  }
): Promise<Variation | null> => {
  const isKnownDimension = knownDimension(anchorId, dimension)
  if (!isKnownDimension) return null

  const exist = await prisma.variation.findFirst({
    where: {
      anchorId,
      ...dimension
    }
  })

  return exist
}

export const addAnchorVariant = async (
  anchorId: number,
  variant: VariationEssential
) => {
  const done = await prisma.variation.create({
    data: {
      anchor: {
        connect: {
          id: anchorId
        }
      },
      ...variant
    }
  })

  return done
}

export const findAnchorByHref = async (
  href: string
): Promise<Anchor | null> => {
  const exist = await prisma.anchor.findUnique({
    where: { href },
    include: { route: true }
  })
  return exist
}

export const getVariantMetaData = async (anchorId: number) => {
  const data = await prisma.variation.findMany({
    where: {
      anchorId
    },
    select: {
      width: true,
      height: true,
      x: true,
      y: true
    }
  })

  return data
}

export const findRouteAndDocs = async (anchorId: number) => {
  const exist = await prisma.route.findUnique({
    where: {
      anchorId
    },
    include: {
      docs: true
    }
  })
  return exist
}

export const findSearchResult = async (where: {
  cx: string
  q: string
  auth: string
}) => {
  const exist = await prisma.search.findFirst({
    where
  })

  return exist
}

export const saveSearchResult = async (data: Prisma.SearchCreateInput) => {
  const done = await prisma.search.create({
    data
  })
  return done
}

export const createResultIfNotExist = async (
  data: Prisma.ResultCreateInput
) => {
  const exist = await prisma.result.findFirst({
    where: {
      text: data.text,
      totalResults: data.totalResults,
      searchTime: data.searchTime
    }
  })

  if (exist) {
    return {
      result: exist,
      exist: true
    }
  }

  const done = await prisma.result.create({
    data
  })

  return {
    result: done,
    exist: true
  }
}
