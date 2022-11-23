import { logger } from '@lib/log'
import { getPersistentContext } from '@lib/playwright'
import { Article } from '@prisma/client'
import { Page } from 'playwright'

let page: Page = null

const url = 'https://www.google.co.jp/'

const selectors = {
  input: 'input',
  topics: 'a[ping][data-ved]',
  breads: '#bres div[data-abe] a'
}

const saerchGoogleWithInput = async (page: Page, query: string) => {
  // clear input
  await page.focus(selectors.input)
  await page.keyboard.press('Meta+A')
  await page.keyboard.press('Delete')

  // type in and navigate
  await page.type(selectors.input, query)
  await Promise.all([page.keyboard.press('Enter'), page.waitForNavigation()])
  await page.waitForTimeout(2 * 1000)
}

export const getArticlesFromTopic = async (
  topic: string
): Promise<{ links: string[]; totalResults: string; searchTime: number }> => {
  if (page === null) {
    logger.error('Page not initialized!')
    return {
      links: [],
      totalResults: 'failed',
      searchTime: 0
    }
  }

  await saerchGoogleWithInput(page, topic)
  const links = await page.$$eval(
    'div[data-sokoban-container] a[data-ved][ping]',
    (anchs) => anchs.map((anc: HTMLAnchorElement) => anc.href)
  )
  const stats = await page.$eval('#result-stats', (stats) => stats.textContent)
  const nobr = await page.$eval(
    '#result-stats nobr',
    (nobr) => nobr.textContent
  )
  const searchTime = +nobr.match(/\d+/g).join('.')
  const dup = stats.replace(nobr, '')
  const totalResults = dup.match(/\d+/g).join('')

  return {
    links,
    totalResults,
    searchTime
  }
}

export const getRelatedTopicsOnGoogle = async (query: string) => {
  if (page === null) {
    const context = await getPersistentContext()
    page = await context.newPage()
    await page.goto(url)
  }

  await saerchGoogleWithInput(page, query)

  const relateds = await page.$$eval(selectors.breads, (breads) =>
    breads.map((bred) => bred.textContent)
  )
  return relateds
}
