const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "userType",
      autopopulate: true,
    },
    userType: {
      type: String,
      required: true,
      enum: ["Teacher", "Student"],
    },
    page: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

notificationSchema.plugin(require("mongoose-autopopulate"));

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = { Notification };
