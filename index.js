const fs = require('fs')
const path = require('path')

const eol = require('eol')
const MsgReader = require('@kenjiuno/msgreader').default


if (process.argv.length !== 3) {
  throw new Error('You must specify the file to convert!')
}

const filename = process.argv[2]

if (!filename.endsWith('.msg')) {
  throw new Error('Only .msg files can be converted!')
}

const msgFileBuffer = fs.readFileSync(path.resolve(filename))
const testMsg = new MsgReader(msgFileBuffer)
const testMsgInfo = testMsg.getFileData()

const headers = Object.fromEntries(
  testMsgInfo.headers
    .split('\r\n')
    .map(line => line.split(': '))
)
const date = new Date(Date.parse(headers.Date))

const dateFormatted = date
  .toISOString()
  .replace('T', ' ')
  .replace('.000Z', '')


let message =
  'Absender: ' + headers.From + '\n' +
  'Empfänger: ' + headers.To + '\n' +
  'Datum: ' + dateFormatted + ' UTC\n' +
  'Betreff: ' + testMsgInfo.subject + '\n' +
  '\n'

message += testMsgInfo.body + '\n'

message = eol.auto(message)


const directory = path.join(
  path.dirname(filename),
  path.basename(filename, '.msg')
)

fs.mkdirSync(directory)

fs.writeFileSync(
  path.join(directory, 'nachricht.txt'),
  message,
  {encoding: 'utf-8'}
)

testMsgInfo.attachments.forEach(attachment => {
  const attachmentObj = testMsg.getAttachment(attachment)
  fs.writeFileSync(
    path.join(directory, attachmentObj.fileName),
    attachmentObj.content
  )
})
