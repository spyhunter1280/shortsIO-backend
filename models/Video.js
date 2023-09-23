const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  userID: {
    type: String,
    trim: true,
  },
  originURL: {
    type: String,
  },
  modifiedURL: {
    type: String,
  },
  originCaption: {
    type: String,
  },
  modifiedCaption: {
    type: String,
  },
  
});

const Video = mongoose.model('Video', VideoSchema);

module.exports = Video;