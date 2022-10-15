import { readFileSync, readdirSync } from 'fs'
import urlRegex from 'url-regex'
const Diff = require('diff')

import prompts from 'prompts'

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

interface Parsed {
  url: string
  status: number
  redirectType: PossibleTypes
  redirectCandidates: string[]
  ip: string
  port: number
}

const isThreeHundres = (n: number) => /30\d/.test(String(n))

const serverSideRedirect = (status: number): PossibleTypes => {
  if ([301, 308].includes(status)) return 'permanent'
  if ([302, 303, 307]) return 'temporary'
  return 'unknown'
}

const clientSideRedirect = (body: string): PossibleTypes => {
  const metaRefreshRex = new RegExp('http-equiv="refresh"')
  if (metaRefreshRex.test(body)) return 'meta'
  const jsRefresh = 'location'
  if (body.includes(jsRefresh)) return 'javascript' // could be wrong

  return 'unknown'
}

function parseDocs(doc: Doc): Parsed {
  const isServerSideRedirected = isThreeHundres(doc.status)
  const redirectType = isServerSideRedirected
    ? serverSideRedirect(doc.status)
    : clientSideRedirect(doc.body)

  const result: Parsed = {
    url: doc.url,
    status: doc.status,
    redirectType,
    redirectCandidates: [],
    ip: doc.ip,
    port: doc.port
  }

  if (isServerSideRedirected && doc.headers.hasOwnProperty('location')) {
    result.redirectCandidates.push(doc.headers.location)
  }

  if (!isServerSideRedirected) {
    const urlMatches = doc.body.match(urlRegex())
    const replaceds = urlMatches?.map((ur) => ur.replace(/&amp;/g, '&'))
    replaceds?.forEach((item) => result.redirectCandidates.push(item))
  }

  return result
}

// const parseDataByPage = (dn: string) => {
//   const raw = readFileSync(`./test-data/${dn}`, 'utf-8')
//   const jsoned = JSON.parse(raw)
//   const testData = jsoned.docs as Doc[]
//   // @ts-ignore
//   const parsed = testData.map(parseDocs)

//   for (let i = 0; i < parsed.length; i++) {
//     if (i === 0) continue

//     const pre = parsed[i - 1]
//     const cur = parsed[i]
//     const sim = stringSimilarity.compareTwoStrings(
//       cur.url,
//       pre.redirectCandidates[0]
//     )
//     console.log({ i, sim, url: pre.redirectCandidates[0], cnd: cur.url })
//   }
// }

!(async () => {
  const dir = './test-data'
  const files = readdirSync(dir)

  for (const file of files) {
    await prompts({
      message: 'yay',
      type: 'confirm',
      name: 'yay'
    })
    const str = readFileSync(`${dir}/${file}`, 'utf-8')
    const json = JSON.parse(str)
    const done = json.docs.map(parseDocs) as Parsed[]

    for (let i = 0; i < done.length; i++) {
      if (i === 0) continue

      const pre = done[i - 1]
      const cur = done[i]

      const s = Diff.diffChars(pre.redirectCandidates[0], cur.url)
      console.log({ s, cur: cur.url, cand: pre.redirectCandidates[0] })
      console.log('\n')
    }

    // console.log(done)
    console.log('\n\n')
  }
})()
