#! /usr/bin/env node

const msg2txt = require('./index.js')


if (process.argv.length !== 3) {
  throw new Error('You must specify the file to convert!')
}

msg2txt(process.argv[2])

