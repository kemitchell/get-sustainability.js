#!/usr/bin/env node
if (process.argv.length < 3) {
  console.error('Usage: get-sustainability <URI>')
  process.exit(1)
}

require('./')({ uri: process.argv[2] }, function (error, data) {
  if (error) {
    process.stderr.write(error.toString() + '\n')
    process.exit(1)
  }
  process.stdout.write(JSON.stringify(data) + '\n')
})
