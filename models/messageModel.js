const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "senderType",
      autopopulate: true,
    },
    senderType: {
      type: String,
      required: true,
      enum: ["Teacher", "Student"],
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "recipientType",
      autopopulate: true,
    },
    recipientType: {
      type: String,
      required: true,
      enum: ["Teacher", "Student"],
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.plugin(require("mongoose-autopopulate"));

const Message = mongoose.model("Message", messageSchema);

module.exports = {
  Message,
};
