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
  start_time: Number,
  end_time: Number,
  x: Number,
  y: Number,
  width: Number,
  height: Number
});

const Video = mongoose.model('Video', VideoSchema);

module.exports = Video;