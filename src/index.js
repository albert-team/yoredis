const { Socket } = require('net')
const RedisParser = require('redis-parser')

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
      { password: null, returnBuffers: false, stringNumbers: false },
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
     * @type {Socket}
     */
    this.socket = new Socket()
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

    await new Promise((resolve, reject) => {
      this.socket.connect({ host: this.host, port: this.port })
      this.socket
        .once('connect', () => {
          // we may replace this event with 'ready' once we drop support for Node < v9.11.0
          this.ready = true
          this.disconnected = false
          resolve()
        })
        .once('error', (err) => reject(err))
    })

    this.socket
      .on('data', (data) => this.parser.execute(data))
      .on('error', (err) => {
        const operation = this.operations.shift()
        operation.reject(err)
      })

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

    return new Promise((resolve, reject) => {
      this.socket.end()
      this.socket
        .once('end', () => {
          this.ready = false
        })
        .once('close', () => {
          this.disconnected = true
          resolve()
        })
        .once('error', (err) => reject(err))
    })
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
   * Call one command
   * @public
   * @async
   * @param {...any} args - Arguments
   */
  async call(...args) {
    return this.callOne(args)
  }

  /**
   * Call one command
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
   * Call many commands at once
   * @public
   * @async
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
