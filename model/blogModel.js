const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now(),
  },
})

const Blog = new mongoose.model('Blog', blogSchema)
module.exports = Blog
