/* eslint-disable no-console */
import path from 'node:path'
import fs from 'node:fs'

const args = process.argv.slice(2)

if (args.length !== 1) {
  console.error('Please provide exactly one argument for the file name.')
  process.exit(1)
}

const fileName = args[0]
const timestamp = new Date().toISOString().replace(/[-TZ:.]/g, '')
const filePath = path.join(
  'src/database/migrations/',
  `${timestamp}-${fileName}.ts`
)

fs.writeFile(filePath, '', { flag: 'wx' }, (err) => {
  if (err) {
    console.error('Error creating file: ', err)
    process.exit(1)
  }
  console.log(`File created at ${filePath}`)
})
