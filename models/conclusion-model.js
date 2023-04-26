const mongoose = require('mongoose');

// const ConclusionSchema = new mongoose.Schema({
//   colors: {
//     type: [String],
//     required: true,
//   },
//   pixelData: {
//     type:[[String]],
//     required: true,
//   },
// })

const ConclusionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  grid: {
    type: [{
      id: {
        type: String,
        required: true
      },
      style: {
        type: String,
        required: false
      }
    }],
    required: true
  }
});

module.exports = mongoose.model('conclusion', ConclusionSchema);