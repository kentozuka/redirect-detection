import { useEnvironmentVariable } from '@lib/dotenv'

export const scroll =
  useEnvironmentVariable('PLAYWRIGHT_SCROLL_INTO_VIEW') === 'true'

export const mark =
  useEnvironmentVariable('PLAYWRIGHT_MARK_ANCHOR_ELEMENT') === 'true'

export const headless = useEnvironmentVariable('PLAYWRIGHT_HEADLESS') === 'true'

export const linkTrackTimeoutMS = (() => {
  const timeout = useEnvironmentVariable('PLAYWRIGHT_LINK_TRACK_TIMEOUT_SEC')
  return +timeout * 1000 || 15 * 1000
})()

export const persistentContextTimeoutMS = (() => {
  const sec = useEnvironmentVariable('PLAYWRIGHT_TIMEOUT_SEC')
  return +sec * 1000 || 15 * 1000
})()
