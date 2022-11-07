import { findSearchResult, saveSearchResult } from '@components/prisma'
import { customsearch_v1, google } from 'googleapis'
import { useEnvironmentVariable } from './dotenv'
const customsearch = google.customsearch('v1')

const cx = useEnvironmentVariable('SEARCH_ENGINE_ID')
const auth = useEnvironmentVariable('SEARCH_ENGINE_AUTH')

export const search = async (q: string) => {
  const opt = {
    cx,
    q,
    auth
  }
  const exist = await findSearchResult(opt)
  if (exist !== null) {
    const parsed = JSON.parse(exist.res) as customsearch_v1.Schema$Search
    return parsed
  }

  const res = await customsearch.cse.list(opt)
  await saveSearchResult({
    ...opt,
    res: JSON.stringify(res.data)
  })

  return res.data
}
