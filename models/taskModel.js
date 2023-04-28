const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    file: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
      default: null,
      autopopulate: true,
    },
    debut: {
      type: String,
      required: true,
      trim: true,
    },
    fin: {
      type: String,
      required: true,
      trim: true,
    },
    bonus: {
      type: Number,
      trim: true,
      default: 0,
    },
    penalty: {
      type: Number,
      trim: true,
      default: 0,
    },
  },
  { timestamps: true }
);

taskSchema.plugin(require("mongoose-autopopulate"));

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
