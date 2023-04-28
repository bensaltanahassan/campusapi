const mongoose = require("mongoose");

const pubSchema = new mongoose.Schema(
  {
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    file: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
      default: null,
      autopopulate: true,
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        autopopulate: true,
      },
    ],
  },
  { timestamps: true }
);

pubSchema.plugin(require("mongoose-autopopulate"));

const Pub = mongoose.model("Pub", pubSchema);

module.exports = Pub;
