const mongoose = require('mongoose')

const storePagesSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  slug: {
    type: String,
  },
  html: {
    type: String,
  },
  store: {
    type: mongoose.Schema.ObjectId,
    ref: 'Store',
  },
  updatedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
  },
  type: { type: String, enum: ['dnd', 'quill'] },
  designJSON: {
    type: Map,
  },
})

storePagesSchema.index({
  name: 'text',
  slug: 'text',
})

const StorePages = new mongoose.model('StorePages', storePagesSchema)
module.exports = StorePages
