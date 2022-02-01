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
  tagFilter() {
    if (this.queryString.tag) {
      this.query = this.query.find({
        $or: [{ tag: this.queryString.tag }, { type: this.queryString.tag }],
      })
    }
    return this
  }
}
module.exports = apiFeatures
