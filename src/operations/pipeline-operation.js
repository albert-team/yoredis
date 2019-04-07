const Operation = require('./operation')

/**
 * Pipeline operation
 * @public
 * @param {Function} resolve - Callback to run when resolved
 * @param {Function} reject - Callback to run when rejected
 * @param {number} size - Number of operations
 */
class PipelineOperation extends Operation {
  constructor(resolve, reject, size) {
    super(resolve, reject)
    /**
     * @private
     * @type {number}
     */
    this.size = size
    /**
     * @private
     * @type {string[]}
     */
    this.responses = []
    /**
     * @private
     * @type {Error}
     */
    this.error = null
  }

  /**
   * Add a response. Resolve if received all responses
   * @public
   * @param {string} res - Response
   */
  addResponse(res) {
    this.responses.push(res)
    if (this.responses.length === this.size) {
      if (this.error) this.reject(this.error)
      else this.resolve(this.responses)
      this.completed = true
    }
  }

  /**
   * Add an error. Reject the 1st error encountered if received all responses
   * @public
   * @param {Error} err - Error
   */
  addError(err) {
    this.responses.push(err)
    if (!this.error) this.error = err
    if (this.responses.length === this.size) {
      this.reject(this.error)
      this.completed = true
    }
  }
}

module.exports = PipelineOperation
