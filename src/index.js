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
        const completed = operation.addResponse(res)
        if (completed) this.operations.shift()
      },
      returnError: (err) => {
        const operation = this.operations[0]
        const completed = operation.addError(err)
        if (completed) this.operations.shift()
      }
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
      const buffer = createCommands([args])
      this.socket.write(buffer)
    })
  }

  async callMany(commands) {
    return new Promise((resolve, reject) => {
      this.operations.push(
        new PipelineOperation(resolve, reject, commands.length)
      )
      const buffer = createCommands(commands)
      this.socket.write(buffer)
    })
  }
}

const bufStar = Buffer.from('*', 'ascii')
const bufDollar = Buffer.from('$', 'ascii')
const bufCrlf = Buffer.from('\r\n', 'ascii')

function createCommands(commands) {
  const bufRespArrs = commands.map(toRESPArray)
  return Buffer.concat([...bufRespArrs, bufCrlf])
}

function toRESPArray(command) {
  const bufRespStrs = command.map(toRESPString)
  const bufStrCount = Buffer.from(String(bufRespStrs.length), 'ascii')
  return Buffer.concat([bufStar, bufStrCount, bufCrlf, ...bufRespStrs])
}

function toRESPString(str) {
  const bufStr = Buffer.from(str, 'ascii')
  const bufByteLength = Buffer.from(String(bufStr.length), 'ascii')
  return Buffer.concat([bufDollar, bufByteLength, bufCrlf, bufStr, bufCrlf])
}

module.exports = RedisClient
