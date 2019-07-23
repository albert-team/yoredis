const net = require('net')
const RedisParser = require('redis-parser')
const waitUntil = require('node-wait-until')

const { Operation, PipelineOperation } = require('./operations')
const { commandsToBuffer } = require('./utils')

/**
 * Redis client
 * @public
 * @param {string} [host='localhost'] - Host name
 * @param {number} [port=6379] - Port number
 * @param {Object} [options={}] - Options
 */
class RedisClient {
  constructor(host = 'localhost', port = 6379, options = {}) {
    /**
     * @private
     * @type {string}
     */
    this.host = host
    /**
     * @private
     * @type {number}
     */
    this.port = port
    /**
     * @private
     * @type {Object}
     */
    this.options = Object.assign(
      { password: null, timeout: 3000, returnBuffers: false, stringNumbers: false },
      options
    )
    /**
     * @private
     * @type {boolean}
     */
    this.ready = false // client is ready if this.socket is ready
    /**
     * @private
     * @type {boolean}
     */
    this.disconnected = true // client is disconnected if this.socket is fully closed
    /**
     * @private
     * @type {Operation[]}
     */
    this.operations = []
    /**
     * @private
     * @type {net.Socket}
     */
    this.socket = null
    /**
     * @private
     * @type {RedisParser}
     */
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
      returnBuffers: this.options.returnBuffers,
      stringNumbers: this.options.stringNumbers
    })
  }

  /**
   * Connect to database server
   * @public
   * @async
   */
  async connect() {
    if (this.ready) return

    this.socket = net.createConnection(this.port, this.host)
    this.socket
      .once('ready', () => {
        this.ready = true
        this.disconnected = false
      })
      .on('data', (data) => this.parser.execute(data))
      .on('error', (err) => {
        const operation = this.operations.shift()
        operation.reject(err)
      })
    await waitUntil(() => this.ready, this.options.timeout, 100)

    const { password } = this.options
    if (password) await this.authenticate(password)
  }

  /**
   * Disconnect from database server
   * @public
   * @async
   */
  async disconnect() {
    if (this.disconnected) return
    this.socket
      .once('end', () => (this.ready = false))
      .once('close', () => {
        this.disconnected = true
        this.socket = null
      })
    this.socket.end()
    return waitUntil(() => this.disconnected, this.options.timeout, 100)
  }

  /**
   * Authenticate
   * @public
   * @async
   * @param {string} password - Password
   */
  async authenticate(password) {
    return this.callOne(['AUTH', password])
  }

  /**
   * Call once
   * @public
   * @async
   * @param {...any} args - Arguments
   */
  async call(...args) {
    return this.callOne(args)
  }

  /**
   * Call once
   * @public
   * @async
   * @param {any[]} command - Command as an array of arguments
   */
  async callOne(command) {
    return new Promise((resolve, reject) => {
      this.operations.push(new Operation(resolve, reject))
      const buffer = commandsToBuffer([command])
      this.socket.write(buffer)
    })
  }

  /**
   * Call multiple times
   * @param {Array<any[]>} commands - An array of commands
   */
  async callMany(commands) {
    return new Promise((resolve, reject) => {
      this.operations.push(new PipelineOperation(resolve, reject, commands.length))
      const buffer = commandsToBuffer(commands)
      this.socket.write(buffer)
    })
  }
}

module.exports = RedisClient
