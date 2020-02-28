const fs = require('fs')
const path = require('path')

const eol = require('eol')
const MsgReader = require('@kenjiuno/msgreader').default

const lang = 'de'  // Available options: de, en

const i18n = {
  de: {
    sender: 'Absender',
    receiver: 'Empfänger',
    date: 'Datum',
    subject: 'Betreff',
    message: 'nachricht',
  },
  en: {
    sender: 'Sender',
    receiver: 'Receiver',
    date: 'Date',
    subject: 'Subject',
    message: 'message',
  },
}


function main () {
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
    i18n[lang].sender + ': ' + headers.From + '\n' +
    i18n[lang].receiver + ': ' + headers.To + '\n' +
    i18n[lang].date + ': ' + dateFormatted + ' UTC\n' +
    i18n[lang].subject + ': ' + testMsgInfo.subject + '\n' +
    '\n'

  message += testMsgInfo.body + '\n'

  message = eol.auto(message)


  const directory = path.join(
    path.dirname(filename),
    path.basename(filename, '.msg')
  )

  fs.mkdirSync(directory)

  fs.writeFileSync(
    path.join(directory, `${i18n[lang].message}.txt`),
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
}

module.exports = main
