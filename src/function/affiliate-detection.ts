import { chromium } from 'playwright'
import { join } from 'path'

const target =
  'https://lenard.jp/magazine/_click/11bdd7141e7da8a8178486d53975d111?ref=%2Fmagazine%2Fsalon-ranking%2F&'
const pathToExtension =
  '/Users/ron/Library/Application Support/Google/Chrome/Default/Extensions/nnpljppamoaalgkieeciijbcccohlpoh/1.0.0.0_0'

// @ts-nocheck
var qualifyURL = function (url) {
  var a = document.createElement('a')
  a.href = url
  return a.href
}

var getMetaRedirects = function () {
  var nodes = document.querySelectorAll('meta[http-equiv=refresh i]')
  if (!nodes.length) return
  var res = []
  for (var i = 0, len = nodes.length; i < len; i++) {
    var node = nodes[i]
    var content = node.getAttribute('content')
    var params = content.split(/;\s?url\s?=\s?/i)
    if (params.length !== 2) continue
    var url = qualifyURL(params[1])
    res.push({ url: url, timeout: params[0] })
  }
  return res
}

var getRelCan = function () {
  var nodes = document.querySelectorAll('link[rel=canonical i]')
  if (!nodes.length) return
  var res = []
  for (var i = 0, len = nodes.length; i < len; i++) {
    var node = nodes[i]
    var href = node.getAttribute('href')
    var url = qualifyURL(href)
    res.push({ url: url, src: 'HTML Rel-Canonical' })
  }
  return res
}

var getMetaRobots = function () {
  var nodes = document.querySelectorAll('meta[name=robots i]')
  if (!nodes.length) return
  var values = []
  for (var i = 0, len = nodes.length; i < len; i++) {
    var node = nodes[i]
    var content = node.getAttribute('content')
    var noindex = !!content.match(/noindex/i)
    var nofollow = !!content.match(/nofollow/i)
    if (!noindex && !nofollow) continue
    values.push({ noindex: noindex, nofollow: nofollow })
  }
  var res = { src: 'html' }
  values.map(function (item) {
    if (item.noindex) res.noindex = true
    if (item.nofollow) res.nofollow = true
  })
  return res
}

!(async () => {
  const userDataDir = '/tmp/test-user-data-dir'
  const browserContext = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: [
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`
    ]
  })
  let [backgroundPage] = browserContext.backgroundPages()
  if (!backgroundPage)
    backgroundPage = await browserContext.waitForEvent('backgroundpage')

  // backgroundPage.on('console', async (e) => {
  //   console.log(e.text())
  // })

  // Test the background page as you would any other page.
  // await browserContext.close()

  const page = await browserContext.newPage()
  await page.goto(target, { waitUntil: 'networkidle' })

  page.on('domcontentloaded', (e) => {
    console.log(`dom content loaded ${e.url()}`)
  })

  const a = backgroundPage.evaluate(() => {
    try {
      // @ts-ignore
      return getMetaRedirects
    } catch (e) {
      // @ts-ignore
      return e.message
    }
  })

  console.log('idled')
  // console.log({ backgroundPage })
})()
