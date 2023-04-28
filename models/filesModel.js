const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    path: { type: String, required: true, trim: true },
    downloadNumber: { type: Number, default: 0 },
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const File = mongoose.model("File", fileSchema);

module.exports = File;
