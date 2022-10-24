import { ElementHandle, Logger } from 'playwright'

type JavaScriptRedirectKeywords = 'href' | 'replace' | 'assign'
type JavaScriptRedirectTypes = `js-${JavaScriptRedirectKeywords}`

type UnknownTypes = 'unknown'
type ServerSideTypes = 'permanent' | 'temporary' | UnknownTypes
type ClientSideTypes = 'meta' | JavaScriptRedirectTypes | UnknownTypes
export type PossibleTypes = ServerSideTypes | ClientSideTypes

export interface Doc {
  url: string
  status: number
  redirectType: 'client' | 'server' | 'unknown'
  headers: { [key: string]: string }
  body: string
  ip: string
  port: number
}

export interface Ring {
  url: string
  candidates: string[]
  redirectType: PossibleTypes
  ip: string
  port: number
  status: number
}

export interface Route {
  // id: string
  start: string
  documents: number
  destination: string
}

export interface Redirect {
  // routeId: string
  url: string
  index: number
  status: number
  type: PossibleTypes
  positive: boolean
  ip: string
  port: number
}

// playwright does not export handler type
export type ElementHandleForTag<K extends keyof HTMLElementTagNameMap> =
  ElementHandle<HTMLElementTagNameMap[K]>

// no type was exposed so just copy and pasting this. might not work in the future versions
export type PlayWrightContextOption = {
  acceptDownloads?: boolean
  args?: Array<string>
  baseURL?: string
  bypassCSP?: boolean
  channel?: string
  chromiumSandbox?: boolean
  colorScheme?: 'light' | 'dark' | 'no-preference'
  deviceScaleFactor?: number
  devtools?: boolean
  downloadsPath?: string
  env?: { [key: string]: string | number | boolean }
  executablePath?: string
  extraHTTPHeaders?: { [key: string]: string }
  forcedColors?: 'active' | 'none'
  geolocation?: {
    latitude: number
    longitude: number
    accuracy?: number
  }
  handleSIGHUP?: boolean
  handleSIGINT?: boolean
  handleSIGTERM?: boolean
  hasTouch?: boolean
  headless?: boolean
  httpCredentials?: {
    username: string
    password: string
  }
  ignoreDefaultArgs?: boolean | Array<string>
  ignoreHTTPSErrors?: boolean
  isMobile?: boolean
  javaScriptEnabled?: boolean
  locale?: string
  logger?: Logger
  offline?: boolean
  permissions?: Array<string>
  proxy?: {
    server: string
    bypass?: string
    username?: string
    password?: string
  }
  recordHar?: {
    omitContent?: boolean
    content?: 'omit' | 'embed' | 'attach'
    path: string
    mode?: 'full' | 'minimal'
    urlFilter?: string | RegExp
  }
  recordVideo?: {
    dir: string
    size?: {
      width: number
      height: number
    }
  }
}
