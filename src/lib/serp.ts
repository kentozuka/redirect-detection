import SerpApi from 'google-search-results-nodejs'

import { useEnvironmentVariable } from './dotenv'
import { SerpResponse } from '@c-types/serp'

const apiKey = useEnvironmentVariable('SERP_PRIVATE_KEY')
const search = new SerpApi.GoogleSearch(apiKey)

const otherParams = {
  device: 'desktop',
  engine: 'google',
  location: 'Shibuya, Tokyo, Japan',
  google_domain: 'google.co.jp',
  gl: 'jp',
  hl: 'ja'
}

export const searchGoogle = async (q: string) => {
  const params = { q, ...otherParams }
  const data = await new Promise((resolve: (val: SerpResponse) => void) => {
    search.json(params, (data: SerpResponse) => resolve(data))
  })

  console.log(data)

  const results = data.organic_results
  const related = data.related_searches

  return {
    results,
    related
  }
}
