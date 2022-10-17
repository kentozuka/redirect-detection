import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

export const writeStringToStorage = (filename: string, data: string) => {
  const storagePath = join('../storage/')
  if (!existsSync(storagePath)) mkdirSync(storagePath)

  const path = join(storagePath, filename)
  writeFileSync(path, data)
}
