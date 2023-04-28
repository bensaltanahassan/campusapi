const mongoose = require("mongoose");

const markSchema = new mongoose.Schema({
  mark: { type: Number },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    trim: true,
    ref: "Student",
    autopopulate: true,
  },
  module: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    trim: true,
  },
});

markSchema.plugin(require("mongoose-autopopulate"));

const Mark = mongoose.model("Mark", markSchema);

module.exports = Mark;
