import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

export const writeStringToStorage = (filename: string, data: string) => {
  const storagePath = join(process.cwd(), 'storage')
  if (!existsSync(storagePath)) mkdirSync(storagePath)

  const path = join(storagePath, filename)
  writeFileSync(path, data)
}

export const readTextFile = async (fn: string) => {
  const path = join(process.cwd(), 'data', fn)
  if (!existsSync(path)) return null

  const data = readFileSync(path, 'utf-8')
  return data
}
