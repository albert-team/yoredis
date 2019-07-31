/**
 * Operation
 * @public
 * @param {Function} resolve - Callback to run when resolved
 * @param {Function} reject - Callback to run when rejected
 */
class Operation {
  constructor(resolve, reject) {
    /**
     * @public
     * @type {Function}
     */
    this.resolve = resolve
    /**
     * @public
     * @type {Function}
     */
    this.reject = reject
    /**
     * @public
     * @type {boolean}
     */
    this.completed = false
  }

  /**
   * Add and resolve response
   * @public
   * @param {string} res - Response
   */
  addResponse(res) {
    this.resolve(res)
    this.completed = true
  }

  /**
   * Add and reject error
   * @public
   * @param {Error} err - Error
   */
  addError(err) {
    this.reject(err)
    this.completed = true
  }
}

module.exports = Operation
