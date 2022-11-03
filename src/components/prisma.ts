import { Anchor, Prisma, PrismaClient } from '@prisma/client'
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

export const createAnchorWithData = async (
  articleId: number,
  anchor: AnchorEssentials,
  initialVariant: VariationEssential,
  route: RouteEssentials,
  docs: DocEssentials[]
) => {
  const existed = await prisma.anchor.findUnique({
    where: {
      href: anchor.href
    },
    include: {
      route: true,
      variants: true
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
      },
      variants: {
        create: initialVariant
      }
    },
    include: {
      route: true
    }
  })

  return created
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
  const exist = await prisma.anchor.findUnique({ where: { href } })
  return exist
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

// export const createRouteWithDocs = async (
//   data: RouteEssentials,
//   docs: DocEssentials[],
//   anchorId: number
// ) => {
//   const paramed = docs.map((doc) => {
//     const url = new URL(doc.url)
//     const objs = [...url.searchParams.entries()].map((x) => ({
//       key: x[0],
//       value: x[1]
//     }))
//     return {
//       ...doc,
//       parameters: {
//         create: objs
//       }
//     }
//   })

//   const done = await prisma.route.create({
//     data: {
//       ...data,
//       anchor: {
//         connect: {
//           id: anchorId
//         }
//       },
//       docs: {
//         create: paramed
//       }
//     }
//   })
//   return done
// }
