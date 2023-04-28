const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    module: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Module",
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Student",
      autopopulate: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Teacher",
      autopopulate: true,
    },
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
        autopopulate: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

chatSchema.plugin(require("mongoose-autopopulate"));

const Chat = mongoose.model("Chat", chatSchema);

module.exports = {
  Chat,
};
