import urlRegex from 'url-regex'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

/* = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = */
type UnknownTypes = 'unknown'
type ServerSideTypes = 'permanent' | 'temporary' | UnknownTypes
type ClientSideTypes = 'meta' | 'javascript' | UnknownTypes
type PossibleTypes = ServerSideTypes | ClientSideTypes

interface Doc {
  url: string
  status: number
  redirectType: 'client' | 'server' | 'unknown'
  headers: { [key: string]: string }
  body: string
  ip: string
  port: number
}

interface Node {
  url: string
  redirectTo: string
  redirectType: PossibleTypes
  ip: string
  port: number
  status: number
}

interface Parsed {
  url: string
  type: PossibleTypes
  cands: string[]
}

type JsonType = { docs: Doc[]; chain: Node[] }

/* = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = */
const isThreeHundres = (n: number) => /30\d/.test(String(n))

const serverSideRedirect = (status: number): PossibleTypes => {
  if ([301, 308].includes(status)) return 'permanent'
  if ([302, 303, 307]) return 'temporary'
  return 'unknown'
}

const clientSideRedirect = (body: string): PossibleTypes => {
  const metaRefreshRex = new RegExp('http-equiv="refresh"', 'i')
  if (metaRefreshRex.test(body)) return 'meta'
  const jsRefresh = 'location'
  if (body.includes(jsRefresh)) return 'javascript' // could be wrong

  return 'unknown'
}

const readJson = (fn: string) => {
  const abs = join(process.cwd(), 'test-data', fn)
  if (!existsSync(abs)) return null

  const raw = readFileSync(abs, 'utf-8')
  try {
    const json = JSON.parse(raw) as JsonType
    return json.docs
  } catch (e) {
    console.log(e)
  }

  return null
}

const parseData = (doc: Doc): Parsed => {
  const cands: string[] = []
  const isSS = isThreeHundres(doc.status)
  const type = isSS
    ? serverSideRedirect(doc.status)
    : clientSideRedirect(doc.body)

  if (doc.headers.hasOwnProperty('location')) {
    // @ts-ignore
    cands.push(doc.headers.location)
  }
  const links = doc.body.match(urlRegex())
  if (links !== null) {
    for (const cand of links) {
      cands.push(cand)
    }
  }

  return {
    url: doc.url,
    type,
    cands
  }
}

/* = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = */
!(async () => {
  const fn = 'datsumo.ameba.jp-official-ginza-calla-cv.html.json'
  const data = readJson(fn)
  if (data === null) return console.log(`${fn} not found.`)

  const parsedData = data.map((it) => parseData(it))
  console.log(parsedData)
})()
