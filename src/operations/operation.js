class Operation {
  constructor(resolve, reject) {
    this.resolve = resolve
    this.reject = reject
    this.completed = false
  }

  addResponse(res) {
    this.resolve(res)
    this.completed = true
  }

  addError(err) {
    this.reject(err)
    this.completed = true
  }
}

module.exports = Operation
