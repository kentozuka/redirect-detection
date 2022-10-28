import { Prisma } from '@prisma/client'

const anchorEssentials = Prisma.validator<Prisma.AnchorArgs>()({
  select: {
    href: true,
    outerHtml: true,
    relList: true,
    target: true,
    htmlId: true,
    dataset: true,
    onClick: true,
    classList: true,
    textContent: true,
    referrerPolicy: true,
    // first child
    firstChildElementCount: true,
    firstChildElementName: true,
    // style
    color: true,
    backgroundColor: true,
    fontSize: true,
    fontWeight: true,
    fontFamily: true,
    lineHeight: true,
    padding: true,
    margin: true,
    // calculated values
    animation: true,
    sponsored: true,
    screenshot: true, // screenshot takes time (1000ms~)
    // samePage Boolean  what was this for? hash link?
    hasAnimation: true,
    contrastScore: true,
    // url
    host: true,
    pathname: true,
    sameOrigin: true,
    // client bounding rect
    x: true,
    y: true,
    width: true,
    height: true
  }
})

const docEssentials = Prisma.validator<Prisma.DocArgs>()({
  select: {
    url: true,
    index: true,
    status: true,
    type: true,
    positive: true,
    ip: true,
    port: true,
    blacklisted: true
  }
})

const routeEssentials = Prisma.validator<Prisma.RouteArgs>()({
  select: {
    start: true,
    documentNum: true,
    destination: true,
    similarity: true,
    time: true
  }
})

export type RouteEssentials = Prisma.RouteGetPayload<typeof routeEssentials>
export type AnchorEssentials = Prisma.AnchorGetPayload<typeof anchorEssentials>
export type DocEssentials = Prisma.DocGetPayload<typeof docEssentials>
