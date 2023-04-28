const mongoose = require("mongoose");

const taskCompletionSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      autopopulate: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      autopopulate: true,
    },
    file: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
      default: null,
      autopopulate: true,
    },
  },
  { timestamps: true }
);

taskCompletionSchema.plugin(require("mongoose-autopopulate"));

const TaskCompletion = mongoose.model("TaskCompletion", taskCompletionSchema);

module.exports = TaskCompletion;
