const mongoose = require('mongoose')

class apiFeatures {
  constructor(query, queryString) {
    this.query = query
    this.queryString = queryString
  }

  textFilter() {
    if (this.queryString.text) {
      this.query = this.query
        .find({ $text: { $search: this.queryString.text } })
        .sort({ score: { $meta: 'textScore' } })
    }
    return this
  }
}
module.exports = apiFeatures
