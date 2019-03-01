const bufStar = Buffer.from('*', 'ascii')
const bufDollar = Buffer.from('$', 'ascii')
const bufCrlf = Buffer.from('\r\n', 'ascii')

function commandsToBuffer(commands) {
  return Buffer.concat([...commands.map(commandToBuffer), bufCrlf])
}

function commandToBuffer(command) {
  const bufArgCount = Buffer.from(String(command.length), 'ascii')
  return Buffer.concat([
    bufStar,
    bufArgCount,
    bufCrlf,
    ...command.map(argToBuffer)
  ])
}

function argToBuffer(arg) {
  const bufArg = Buffer.from(String(arg), 'ascii')
  const bufByteLength = Buffer.from(String(bufArg.length), 'ascii')
  return Buffer.concat([bufDollar, bufByteLength, bufCrlf, bufArg, bufCrlf])
}

module.exports = { commandsToBuffer }
