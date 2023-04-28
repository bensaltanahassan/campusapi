const mongoose = require("mongoose");

const invitationSchema = new mongoose.Schema({
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

invitationSchema.plugin(require("mongoose-autopopulate"));

const Invitation = mongoose.model("Invitation", invitationSchema);

module.exports = Invitation;
