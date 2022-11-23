import {
  Anchor,
  Article,
  Prisma,
  PrismaClient,
  Variation
} from '@prisma/client'
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
      articles: {
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

export const findSearchResult = async (where: { cx: string; q: string }) => {
  const exist = await prisma.search.findFirst({
    where
  })

  return exist
}

export const saveSearchResult = async (data: Prisma.SearchCreateInput) => {
  const exist = await findSearchResult({ cx: data.cx, q: data.cx })
  if (exist) {
    const done = await prisma.search.update({
      data,
      where: {
        id: exist.id
      }
    })

    return done
  }

  const done = await prisma.search.create({
    data
  })
  return done
}

export const createManySearchResult = async (queries: string[]) => {
  const entries = queries.map((q) => ({
    cx: '',
    q,
    auth: '',
    res: '',
    done: false
  }))
  const done = await prisma.search.createMany({
    data: entries
  })

  return done
}

export const findResult = async (data: Prisma.ResultCreateInput) => {
  const exist = await prisma.result.findFirst({
    where: {
      text: data.text,
      totalResults: data.totalResults,
      searchTime: data.searchTime
    }
  })
  return exist
}

export const createResultWithArticles = async (
  resultData: Prisma.ResultCreateInput,
  articles: Prisma.Enumerable<Prisma.ArticleCreateOrConnectWithoutResultsInput>
) => {
  const done = await prisma.result.create({
    data: {
      ...resultData,
      articles: {
        connectOrCreate: articles
      }
    }
  })

  return done
}

export const findArticleFromResultId = async (id: number) => {
  const exist = await prisma.result.findUnique({
    where: { id },
    select: {
      articles: {
        where: {
          endedAt: null
        }
      }
    }
  })

  return exist.articles
}

export const startArticle = async (aritcle: Article) => {
  const done = await prisma.article.update({
    where: {
      id: aritcle.id
    },
    data: {
      startedAt: new Date()
    }
  })

  return done
}

export const updateSEO = async (
  id: number,
  seo: { title: string; keywords: string; description: string; image: string }
) => {
  const done = await prisma.article.update({
    where: {
      id
    },
    data: seo
  })

  return done
}

export const endArticle = async (aritcle: Article) => {
  const done = await prisma.article.update({
    where: {
      id: aritcle.id
    },
    data: {
      endedAt: new Date()
    }
  })

  return done
}

export const updateArticleTime = async (article: Article, time: number) => {
  const done = await prisma.article.update({
    where: {
      id: article.id
    },
    data: {
      time
    }
  })

  return done
}

export const get100search = async () => {
  const hundreds = await prisma.search.findMany({
    where: {
      done: false
    },
    take: 100
  })

  return hundreds
}

export const getUnfinishedJobs = async () => {
  const exist = await prisma.article.findMany({
    where: {
      endedAt: null,
      NOT: [{ startedAt: null }]
    }
  })

  return exist
}

export const markSearchAsDone = async (id: number) => {
  const done = await prisma.search.update({
    where: {
      id
    },
    data: {
      done: true
    }
  })

  return done
}

export const addError = async (
  code: string,
  message: string,
  trace: string
) => {
  const done = await prisma.error.create({
    data: {
      code,
      message,
      trace
    }
  })

  return done
}

// for cli

export const createOrReadArticleForCli = async (url: string) => {
  const exist = await prisma.article.findFirst({
    where: {
      url
    }
  })
  if (exist) return exist

  const done = await prisma.article.create({
    data: {
      url
    }
  })

  return done
}

export const createManyWord = async (words: string[]) => {
  const done = await prisma.word.createMany({
    data: words.map((word) => ({ word })),
    skipDuplicates: true
  })

  return done
}

export const markWordAsDone = async (id: number) => {
  const done = await prisma.word.update({
    where: {
      id
    },
    data: {
      done: true
    }
  })

  return done
}

export const getFirstUndoneKeyword = async () => {
  const exist = await prisma.word.findFirst({
    where: {
      done: false
    }
  })

  return exist
}

export const getUndoneKeywords = async (take = 5) => {
  const exist = await prisma.word.findMany({
    where: {
      done: false
    },
    take
  })

  return exist
}
