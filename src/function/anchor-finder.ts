import { getPersistentContext } from '../lib/playwright'
import { PlayWrightContextOption } from '../types'
import { isValidUrl } from '../lib/url'
import { checkRedirects } from './link-tracker'
import { breakdownURL } from './parameter'

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
  return float.toFixed(2)
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

    const anchors = await page.$$('a')
    for (const anchor of anchors) {
      const href = await anchor.evaluate((a) => a.href) // returns full length href
      if (!isValidUrl(href)) continue

      const { host: ancHost, pathname: ancPathname, hash } = new URL(href)
      const samePage = host === ancHost && pathname === ancPathname
      const isIdLink = samePage && hash
      if (isIdLink) continue

      const evaled = await anchor.evaluate((a) => {
        const {
          color,
          backgroundColor,
          animation,
          fontWeight,
          fontFamily,
          padding,
          margin,
          lineHeight
        } = getComputedStyle(a)
        return {
          href: a.href,
          target: a.target,
          referrer_policy: a.referrerPolicy,
          text_content: a.textContent.trim(),
          outer_html: a.outerHTML.trim(),
          dataset: Object.entries(a.dataset),
          html_id: a.id,
          rel_list: Array.from(a.relList),
          class_list: Array.from(a.classList),
          child_element_count: a.childElementCount,
          child_name: a.firstElementChild ? a.firstElementChild.localName : '',
          on_click: a.onclick ? a.onclick.toString().trim() : '',
          color,
          backgroundColor,
          fontWeight: +fontWeight,
          padding,
          margin,
          lineHeight: +lineHeight.replace('px', ''),
          fontFamily,
          animation
          // ...a.getBoundingClientRect() => spread syntax does not work on DOMRect
        }
      })

      const detail = {
        ...evaled,
        sponsored: evaled.rel_list.includes('sponsored'),
        screenshot: '',
        host: ancHost,
        pathname: ancPathname,
        same_page: samePage,
        has_animation:
          evaled.animation !== 'none 0s ease 0s 1 normal none running',
        contrast_score: calculateContrast(evaled.color, evaled.backgroundColor),
        ...(await anchor.boundingBox())
      }

      console.log(detail)

      // console.time('Background Check')
      // const redirectResponse = await checkRedirects(href)
      // if (redirectResponse === null) {
      //   console.log('Failed to evaluate the link')
      //   continue
      // }
      // const { redirects, destination, start } = redirectResponse

      // const sp = (x: string) => (x.length < 60 ? x : x.slice(0, 60) + '...')
      // const tb = {
      //   start: sp(start),
      //   destination: sp(destination),
      //   'document num': redirects.length || 1
      // }
      // const rtb = redirects.map((x) => ({ ...x, url: sp(x.url) }))

      // const startUrl = breakdownURL(start)
      // const destiUrl = breakdownURL(destination)

      // console.log('\n')

      // console.log('start search params', startUrl.searchParams)
      // console.log('destination search params', destiUrl.searchParams)

      // console.table(tb)
      // console.table(rtb)
      // console.timeEnd('Background Check')
      // console.log('\n\n')
    }
    // protocol === http || https

    /**
     *
     *
     *
     *
     *
     * TODO
     * - create anchor extraction code
     * - - calculate conotrast score
     * - implement prisma in the code base
     * - setup database
     * - implement prisma to the code
     * - create palasite code
     * - integrate everythin
     * - - show link status (loading/scraping/searched)
     * - - show card on hover
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
