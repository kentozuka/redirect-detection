import { getPersistentContext } from '@lib/playwright'
import { Page } from 'playwright'

let page: Page = null

const url = 'https://www.google.co.jp/'

const selectors = {
  input: 'input',
  topics: 'a[ping][data-ved]',
  breads: '#bres div[data-abe] a'
}

export const getRelatedTopicsOnGoogle = async (query: string) => {
  if (page === null) {
    const context = await getPersistentContext()
    page = await context.newPage()
    await page.goto(url)
  }

  // clear input
  await page.focus(selectors.input)
  await page.keyboard.press('Meta+A')
  await page.keyboard.press('Delete')

  // type in and navigate
  await page.type(selectors.input, query)
  await Promise.all([page.keyboard.press('Enter'), page.waitForNavigation()])

  const relateds = await page.$$eval(selectors.breads, (breads) =>
    breads.map((bred) => bred.textContent)
  )
  return relateds
}
