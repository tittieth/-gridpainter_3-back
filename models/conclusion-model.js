const mongoose = require('mongoose')

const ConclusionSchema = new mongoose.Schema({
  colors: {
    type: [String],
    required: true,
  },
  pixelData: {
    type:[[String]],
    required: true,
  },
})

module.exports = mongoose.model('conclusion', ConclusionSchema)