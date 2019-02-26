class Operation {
  constructor(resolve, reject) {
    this.resolve = resolve
    this.reject = reject
  }

  addResponse(res) {
    this.resolve(res)
    return true
  }

  addError(err) {
    this.reject(err)
    return true
  }
}

module.exports = Operation
