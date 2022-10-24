import { getPersistentContext } from '../lib/playwright'
import { PlayWrightContextOption } from '../types'
import { isValidUrl } from '../lib/url'
import { checkRedirects } from './link-tracker'
import { breakdownURL } from './parameter'
import { prisma } from '../lib/prisma'
import { endTimer, startTimer } from '../lib/util'
import { compareTwoStrings } from 'string-similarity'
import { injectTippy } from '../lib/tippy'

// strt https://stackoverflow.com/questions/9733288/how-to-programmatically-calculate-the-contrast-ratio-between-two-colors
const luminance = (r: number, g: number, b: number) => {
  var a = [r, g, b].map((v) => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722
}

const contrast = (rgb1: number[], rgb2: number[]) => {
  var lum1 = luminance(rgb1[0], rgb1[1], rgb1[2])
  var lum2 = luminance(rgb2[0], rgb2[1], rgb2[2])
  var brightest = Math.max(lum1, lum2)
  var darkest = Math.min(lum1, lum2)
  return (brightest + 0.05) / (darkest + 0.05)
}
// end

const calculateContrast = (color: string, backgroundColor: string) => {
  const exp = new RegExp(/\d+/, 'g')
  const col = color.match(exp).map((x) => +x)
  const bac = backgroundColor.match(exp).map((x) => +x)
  const float = contrast(col, bac)
  return +float.toFixed(2)
}

export async function queryAnchors(
  target: string,
  options?: PlayWrightContextOption
): Promise<null> {
  if (!isValidUrl(target)) return null

  try {
    const { host, pathname } = new URL(target)
    const browser = await getPersistentContext(options)
    const page = await browser.newPage()

    await page.goto(target)
    await injectTippy(page)
    await page.waitForTimeout(2000)

    const anchors = await page.$$('a')
    for (const an of anchors) {
      await an.evaluate((a) => (a.style.outline = '4px solid gray'))
    }

    for (const anchor of anchors) {
      const href = await anchor.evaluate((a) => a.href) // returns full length href
      if (!isValidUrl(href)) continue

      const { host: ancHost, pathname: ancPathname, hash } = new URL(href)
      const samePage = host === ancHost && pathname === ancPathname
      const isIdLink = samePage && hash
      if (isIdLink) continue

      await anchor.evaluate((a) => (a.style.outlineColor = 'blue'))
      const rect = await anchor.boundingBox()
      if (rect === null || (rect.width === 0 && rect.height === 0)) {
        await anchor.evaluate((a) => (a.style.outlineColor = 'red'))
        continue
      }

      const timer = startTimer()

      const evaled = await anchor.evaluate((a) => {
        const {
          color,
          backgroundColor,
          animation,
          fontWeight,
          fontFamily,
          padding,
          margin,
          lineHeight,
          fontSize
        } = getComputedStyle(a)
        return {
          href: a.href,
          target: a.target,
          referrer_policy: a.referrerPolicy,
          textContent: a.textContent.trim(),
          outerHtml: a.outerHTML.trim(),
          dataset: Object.entries(a.dataset),
          htmlId: a.id,
          relList: Array.from(a.relList),
          classList: Array.from(a.classList),
          firstChildElementCount: a.childElementCount,
          firstChildElementName: a.firstElementChild
            ? a.firstElementChild.localName
            : '',
          onClick: a.onclick ? a.onclick.toString().trim() : '',
          color,
          backgroundColor,
          fontWeight: +fontWeight,
          padding,
          margin,
          lineHeight: +lineHeight.replace('px', ''),
          fontSize: +fontSize.replace('px', ''),
          fontFamily,
          animation
          // ...a.getBoundingClientRect() => spread syntax does not work on DOMRect
        }
      })

      const detail = {
        ...evaled,
        sponsored: evaled.relList.includes('sponsored'),
        screenshot: '',
        host: ancHost,
        pathname: ancPathname,
        hasAnimation:
          evaled.animation !== 'none 0s ease 0s 1 normal none running',
        contrastScore: calculateContrast(evaled.color, evaled.backgroundColor),
        ...rect
      }

      console.time('Background Check')
      const redirectResponse = await checkRedirects(href)
      if (redirectResponse === null) {
        await anchor.evaluate((a) => (a.style.outlineColor = 'red'))
        continue
      }
      const { redirects, destination, start } = redirectResponse

      const sp = (x: string) => (x.length < 60 ? x : x.slice(0, 60) + '...')
      const tb = {
        start: sp(start),
        destination: sp(destination),
        documentNum: redirects.length || 1
      }
      const rtb = redirects.map((x) => ({ ...x, url: sp(x.url) }))

      const startUrl = breakdownURL(start)
      const destiUrl = breakdownURL(destination)

      const result = {
        detail,
        ...tb,
        redirects: rtb,
        time: endTimer(timer),
        similarity: compareTwoStrings(start, destination)
      }

      await anchor.evaluate((a, data) => {
        const el = document.createElement('div')
        el.innerHTML = `
        <p>${data.start}</p>
        <p>${data.destination}</p>
        <p>${data.time.toLocaleString()}ms | ${
          data.redirects.length
        } redirects | ${(data.similarity * 100).toFixed(1)}% similar</p>
        <p>${data.detail.contrastScore} contrast score</p>
        <p>${data.detail.color} / ${
          data.detail.backgroundColor
        } <span style="color: ${data.detail.color}; background-color: ${
          data.detail.backgroundColor
        };">(c/b)</span></p>
        `
        // @ts-ignore
        tippy(a, {
          content: el
        })
      }, result)

      if (result.redirects.length > 0)
        await anchor.evaluate((a) => (a.style.outlineColor = 'yellow'))
      else await anchor.evaluate((a) => (a.style.outlineColor = 'green'))

      console.log('start search params', startUrl.searchParams)
      console.log('destination search params', destiUrl.searchParams)

      console.table(tb)
      console.table(rtb)
      console.timeEnd('Background Check')
      console.log('\n')
    }

    /**
     *
     *
     *
     *
     *
     * TODO
     * - implement prisma to the code
     * - integrate everythin
     *
     *
     *
     *
     *
     *
     *
     *
     *
     *
     * */

    // await page.close()
  } catch (e) {
    console.log(e)
    return null
  }
}
