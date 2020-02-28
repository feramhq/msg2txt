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
    timeZone: 'Europe/Berlin',
  },
  en: {
    sender: 'Sender',
    receiver: 'Receiver',
    date: 'Date',
    subject: 'Subject',
    message: 'message',
    timeZone: 'UTC',
  },
}


function getNumericOffset (zone, now) {
  const tzNum = Intl
    .DateTimeFormat('en-US', {
      timeZone: zone,
      timeZoneName: 'short',
    })
    .format(now)
    .split(', ')[1]
    .replace('GMT', '')

  const timeZoneIsNumeric = /^[0-9:+-]*$/.test(tzNum)

  const offset =
    (!timeZoneIsNumeric || tzNum.length === 3)
    ? tzNum
    : tzNum.length === 0
      ? '+00'
      : (tzNum.length === 2 || tzNum.length === 5)
        ? tzNum.replace('+', '+0').replace('-', '-0')
        : tzNum.padStart(5, '0')

  return offset
    .replace('UTC', '+00')
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
  const opts = {
    timeZone: i18n[lang].timeZone,
    hour12: false,
  }
  const dateFormatted =
    date.toLocaleDateString('en-CA', opts)
    + ' ' +
    date.toLocaleTimeString(lang, opts)
    + ' ' +
    getNumericOffset(i18n[lang].timeZone, date)


  let message =
    i18n[lang].sender + ': ' + headers.From + '\n' +
    i18n[lang].receiver + ': ' + headers.To + '\n' +
    i18n[lang].date + ': ' + dateFormatted + '\n' +
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
