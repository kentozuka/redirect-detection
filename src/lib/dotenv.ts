import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()

type PlaywrightConfigDotenv =
  | 'PLAYWRIGHT_CONTEXT_USERNAME'
  | 'PLAYWRIGHT_HEADLESS'
  | 'PLAYWRIGHT_TIMEOUT_SEC'
  | 'PLAYWRIGHT_LIGHT_WEIGHT'

export const useEnvironmentVariable = (name: PlaywrightConfigDotenv) => {
  const cand = process.env[name]
  if (cand) return cand

  return ''
}
