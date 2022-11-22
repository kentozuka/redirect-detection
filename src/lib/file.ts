import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

export const writeStringToStorage = (filename: string, data: string) => {
  const storagePath = join('../storage/')
  if (!existsSync(storagePath)) mkdirSync(storagePath)

  const path = join(storagePath, filename)
  writeFileSync(path, data)
}
;('use strict')
//モジュールの読み込み
const fs = require('fs')
const readline = require('readline')

//readstreamを作成
const rs = fs.createReadStream('./input.csv')
//writestreamを作成
const ws = fs.createWriteStream('./output.csv')

//インターフェースの設定
const rl = readline.createInterface({
  //読み込みたいストリームの設定
  input: rs,
  //書き出したいストリームの設定
  output: ws
})

//1行ずつ読み込む設定
rl.on('line', (lineString) => {
  //wsに一行ずつ書き込む
  ws.write(lineString + '\n')
})
rl.on('close', () => {
  console.log('END!')
})

export const extractOneLineFrom = async (from: string) => {
  const path = join(process.cwd(), 'data', from)
  // read line from "from"
  // remove it
  // retunrs the line
}
