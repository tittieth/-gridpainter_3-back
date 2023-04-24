const mongoose = require('mongoose');

const ConclusionSchema = new mongoose.Schema({
  colors: {
    type:[[String]],
    required: true,
  },
  ids: {
    type:[[String]],
    required: true,
  },
});

module.exports = mongoose.model('conclusion', ConclusionSchema);