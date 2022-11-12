/**
 * work 1
 * - create queries (more than 10,000)
 *
 * work 2
 * - get 100 queries (query if not exist)
 * - go article
 * - get redirect
 */

import { get100search } from '@components/prisma'
import { createQuery } from '@function/query-creator'

!(async () => {
  const searches = await get100search()
  for (const { q: query } of searches) {
    const result = await createQuery(query)
    if (result === null) continue
  }
})()
