const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Student",
      trim: true,
      autopopulate: true,
    },
    pubId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      trim: true,
      ref: "Pub",
    },
  },
  { timestamps: true }
);

commentSchema.plugin(require("mongoose-autopopulate"));

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
