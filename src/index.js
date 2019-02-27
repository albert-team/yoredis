const net = require('net')
const RedisParser = require('redis-parser')

const Operation = require('./operations/operation')
const PipelineOperation = require('./operations/pipeline-operation')

class RedisClient {
  constructor(host = 'localhost', port = 6379) {
    this.host = host
    this.port = port

    this.operations = []
    this.socket = null
    this.parser = new RedisParser({
      returnReply: (res) => {
        const operation = this.operations[0]
        operation.addResponse(res)
        if (operation.completed) this.operations.shift()
      },
      returnError: (err) => {
        const operation = this.operations[0]
        operation.addError(err)
        if (operation.completed) this.operations.shift()
      },
      returnBuffers: false,
      stringNumbers: false
    })
  }

  connect() {
    if (this.socket) return
    this.socket = net.createConnection(this.port, this.host)
    this.socket
      .on('data', (data) => {
        this.parser.execute(data)
      })
      .on('error', (err) => {
        const operation = this.operations.shift()
        operation.reject(err)
      })
  }

  disconnect() {
    if (!this.socket) return
    this.socket.end()
    this.socket = null
  }

  async call(...args) {
    return new Promise((resolve, reject) => {
      this.operations.push(new Operation(resolve, reject))
      const buffer = commandsToBuffer([args])
      this.socket.write(buffer)
    })
  }

  async callMany(commands) {
    return new Promise((resolve, reject) => {
      this.operations.push(
        new PipelineOperation(resolve, reject, commands.length)
      )
      const buffer = commandsToBuffer(commands)
      this.socket.write(buffer)
    })
  }
}

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
  const bufArg = Buffer.from(arg, 'ascii')
  const bufByteLength = Buffer.from(String(bufArg.length), 'ascii')
  return Buffer.concat([bufDollar, bufByteLength, bufCrlf, bufArg, bufCrlf])
}

module.exports = RedisClient
