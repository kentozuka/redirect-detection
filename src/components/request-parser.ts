import { Response } from 'playwright'
import urlRegex from 'url-regex'
import { load } from 'cheerio'
import axios from 'axios'

import {
  clientSideRedirect,
  isThreeHundres,
  serverSideRedirect
} from './request-classifier'
import { Doc, Ring, Redirect } from '../types'

export const extractDocFromResponse = async (
  res: Response
): Promise<Doc | null> => {
  const type = res.request().resourceType()
  if (type !== 'document') return null // non-document resource type: [stylesheet, image, media, font, script, texttrack, xhr, fetch, eventsource, websocket, manifest, other]
  if (res.frame().parentFrame() !== null) return null // "Parent frame, if any. Detached frames and main frames return null." thus prevent requests made from iframes

  const url = res.url()
  const status = res.status()
  const headers = res.headers()
  const serverAddr = await res.serverAddr()

  const doc: Doc = {
    url,
    status,
    redirectType: 'unknown',
    headers,
    body: '',
    ip: serverAddr ? serverAddr.ipAddress : '',
    port: serverAddr ? serverAddr.port : 0
  }

  const isSSRidirect = isThreeHundres(status)
  if (isSSRidirect) {
    doc.redirectType = 'server'
    return doc
  }

  try {
    const body = (await res.body()).toString()
    const $ = load(body)
    const head = $('head').html() || body
    doc.body = head
    doc.redirectType = 'client'
  } catch {
    // console.log(`[Parsing body failed] ${url}`)
    const res = await axios.get(url)
    // console.log(`Faillback request status: ${res.status}`)
    if (res.status === 200) doc.body = res.data
  } // sometimes body() fails
  return doc
}

export const parseDocsToRings = (docs: Doc[]): Ring[] => {
  const rings: Ring[] = []
  for (let i = 0; i < docs.length; i++) {
    const { url, status, headers, body, ip, port } = docs[i]
    const isSSRidirect = isThreeHundres(status)

    if (isSSRidirect) {
      rings.push({
        url,
        candidates: headers.hasOwnProperty('location')
          ? [headers.location]
          : [],
        redirectType: serverSideRedirect(status),
        ip,
        port,
        status
      })
      continue
    }

    rings.push({
      url,
      candidates: body.match(urlRegex()) || [],
      redirectType: clientSideRedirect(body),
      ip,
      port,
      status
    })
  }

  return rings
}

export const calculateChain = (
  start: string,
  rings: Ring[],
  destination: string
): Redirect[] => {
  const hasNoRedirects = start === destination
  if (hasNoRedirects) return []

  const redirects: Redirect[] = []

  for (let i = 0; i < rings.length; i++) {
    const hasNext = i + 1 < rings.length
    const cur = rings[i]
    const type = cur.redirectType
    const positive = hasNext ? cur.candidates.includes(rings[i + 1].url) : false

    delete cur.redirectType
    delete cur.candidates
    redirects.push({
      ...cur,
      index: i,
      type,
      positive
    })
  }

  return redirects
}
