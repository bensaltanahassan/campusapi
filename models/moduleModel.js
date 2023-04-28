const Joi = require("joi");
const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    classe: {
      type: String,
      required: true,
      trim: true,
    },
    color: {
      type: String,
      required: true,
      trim: true,
    },
    identifiant: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Teacher",
      trim: true,
      autopopulate: true,
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        autopopulate: true,
        default: [],
      },
    ],
    files: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "File",
        autopopulate: true,
        default: [],
      },
    ],
  },
  { timestamps: true }
);

moduleSchema.plugin(require("mongoose-autopopulate"));

const Module = mongoose.model("Module", moduleSchema);

const validateGetALLModules = (module) => {
  const schema = Joi.object({
    teacherId: Joi.string().required(),
  });
  return schema.validate(module);
};

module.exports = { Module, validateGetALLModules };
