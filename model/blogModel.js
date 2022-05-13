const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.ObjectId,
    ref: 'Store',
  },
  users: [{ // people from store team who edited this blog
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  }],
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  content: {
    type: String,
  },
  cover_image: {
    type: String,
  },
  views: {
    type: Number,
    default: 0,
  },
  show_votes: {
    type: Boolean,
    default: true,
  },
  upvote: {
    type: Number,
    default: 0,
  },
  downvote: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['Published', 'Unpublished', 'Draft',],
    default: 'Draft',
  },
  tags: [{
    type: String,
  }],
  meta_title: {
    type: String,
  },
  meta_description: {
    type: String,
  },
  meta_keywords: {
    type: String,
  },
  updated_at: {
    type: Date,
    default: Date.now(),
  },
  created_at: {
    type: Date,
  },
});

const Blog = new mongoose.model('Blog', blogSchema);
module.exports = Blog;
