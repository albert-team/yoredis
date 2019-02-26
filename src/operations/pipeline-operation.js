const Operation = require('./operation')

class PipelineOperation extends Operation {
  constructor(resolve, reject, size) {
    super(resolve, reject)
    this.size = size
    this.responses = []
    this.error = null
  }

  addResponse(res) {
    this.responses.push(res)
    if (this.responses.length >= this.size) {
      if (this.error) this.reject(this.error)
      else this.resolve(this.responses)
      return true
    }
  }

  addError(err) {
    if (!this.error) this.error = err
    this.responses.push(err)
    if (this.responses.length >= this.size) this.reject(this.error)
  }
}

module.exports = PipelineOperation
