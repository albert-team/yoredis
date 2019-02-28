const net = require('net')
const RedisParser = require('redis-parser')
const waitUntil = require('node-wait-until')

const Operation = require('./operations/operation')
const PipelineOperation = require('./operations/pipeline-operation')
const { commandsToBuffer } = require('./utils')

class RedisClient {
  constructor(host = 'localhost', port = 6379) {
    this.host = host
    this.port = port

    this.operations = []
    this.socket = null
    this.ready = false // client is ready if this.socket is ready
    this.disconnected = true // client is disconnected if this.socket is fully closed
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

  async connect() {
    if (this.ready) return
    this.socket = net.createConnection(this.port, this.host)
    this.socket
      .once('ready', () => {
        this.ready = true
        this.disconnected = false
      })
      .on('data', (data) => {
        this.parser.execute(data)
      })
      .on('error', (err) => {
        const operation = this.operations.shift()
        operation.reject(err)
      })
    return waitUntil(() => this.ready, 1000, 10)
  }

  async disconnect() {
    if (this.disconnected) return
    this.socket.end()
    this.socket
      .once('end', () => (this.ready = false))
      .once('close', () => {
        this.disconnected = true
        this.socket = null
      })
    return waitUntil(() => this.disconnected, 1000, 10)
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

module.exports = RedisClient
