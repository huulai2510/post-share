const mongoose = require('mongoose')

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true,
    trim: true
  },
  categories: {
    type: [String],
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  likes: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  messages: [{
    messageBody: {
      type: String
    },
    messageDate: {
      type: Date,
      default: Date.now()
    },
    messageUser: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    }
  }]
})

// Create index to search on all fields of posts
PostSchema.index({
  '$**': 'text'
})

module.exports = mongoose.model('Post', PostSchema)