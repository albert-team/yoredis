const bufStar = Buffer.from('*', 'ascii')
const bufDollar = Buffer.from('$', 'ascii')
const bufCrlf = Buffer.from('\r\n', 'ascii')

/**
 * Convert an array of commands to buffer
 * @param {Array<any[]>} commands - An array of commands
 * @returns {Buffer}
 */
function commandsToBuffer(commands) {
  return Buffer.concat([...commands.map(commandToBuffer), bufCrlf])
}

/**
 * Convert a command - an array of arguments to buffer
 * @param {any[]} command - Command as an array of arguments
 * @returns {Buffer}
 */
function commandToBuffer(command) {
  const bufArgCount = Buffer.from(String(command.length), 'ascii')
  return Buffer.concat([bufStar, bufArgCount, bufCrlf, ...command.map(argToBuffer)])
}

/**
 * Convert an argument to buffer
 * @param {an} arg - Argument
 * @returns {Buffer}
 */
function argToBuffer(arg) {
  const bufArg = Buffer.from(String(arg), 'ascii')
  const bufByteLength = Buffer.from(String(bufArg.length), 'ascii')
  return Buffer.concat([bufDollar, bufByteLength, bufCrlf, bufArg, bufCrlf])
}

module.exports = { commandsToBuffer }
