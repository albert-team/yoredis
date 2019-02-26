const net = require('net')
const RedisParser = require('redis-parser')

const Operation = require('./operations/operation')
const PipelineOperation = require('./operations/pipeline-operation')

class RedisClient {
  constructor(host = 'localhost', port = 6379) {
    this.host = host
    this.port = port

    this.parser = new RedisParser({
      returnReply: (res) => {
        const operation = this.operations[0]
        const completed = operation.addResponse(res)
        if (completed) this.operations.shift()
      },
      returnError: (err) => {
        const operation = this.operations[0]
        const completed = operation.addError(err)
        if (completed) this.operations.shift()
      }
    })
    this.socket = null
    this.operations = []
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
    if (this.socket) {
      this.socket.end()
      this.socket = null
    }
  }

  async call(...args) {
    return new Promise((resolve, reject) => {
      this.operations.push(new Operation(resolve, reject))
      const responses = createCommands([args])
      this.socket.write(responses)
    })
  }

  async callMany(commands) {
    return new Promise((resolve, reject) => {
      this.operations.push(
        new PipelineOperation(resolve, reject, commands.length)
      )
      const responses = createCommands(commands)
      this.socket.write(responses)
    })
  }
}

const bufStar = Buffer.from('*', 'ascii')
const bufDollar = Buffer.from('$', 'ascii')
const bufCrlf = Buffer.from('\r\n', 'ascii')

function createCommands(commands) {
  const respArrays = commands.map(toRESPArray)
  const buffer = Buffer.concat([...respArrays, bufCrlf])
  return buffer
}

function toRESPArray(command) {
  const respStrings = command.map(toRESPBulkString)
  const stringCount = Buffer.from(String(respStrings.length), 'ascii')
  const respArray = Buffer.concat([
    bufStar,
    stringCount,
    bufCrlf,
    ...respStrings
  ])
  return respArray
}

function toRESPBulkString(string) {
  const asciiString = Buffer.from(string, 'ascii')
  const byteLength = Buffer.from(String(asciiString.length), 'ascii')
  const totalLength =
    bufDollar.length +
    byteLength.length +
    bufCrlf.length +
    asciiString.length +
    bufCrlf.length
  const respBulkString = Buffer.concat(
    [bufDollar, byteLength, bufCrlf, asciiString, bufCrlf],
    totalLength
  )
  return respBulkString
}

module.exports = RedisClient
