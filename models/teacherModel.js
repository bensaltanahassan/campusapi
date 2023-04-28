const Joi = require("joi");
const JoiPasswordComplexity = require("joi-password-complexity");
const mongoose = require("mongoose");

const complexityOptions = {
  min: 8,
  max: 250,
  lowerCase: 1,
  upperCase: 1,
  numeric: 1,
  symbol: 1,
  requirementCount: 5,
};

const teacherSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, unique: true },
  password: { type: String, required: true, minlength: 8 },
  imageUrl: { type: String, default: "" },
  board: { type: Array },
  isAccountVerified: { type: Boolean, default: false },
  verifyCode: { type: Number },
});

const Teacher = mongoose.model("Teacher", teacherSchema);

// Validate register teacher
const validateRegisterTeacher = (obj) => {
  const schema = Joi.object({
    fullName: Joi.string().trim().required(),
    email: Joi.string().trim().email().required(),
    password: Joi.string().required(),
  });
  return schema.validate(obj);
};

// forgetten password
const validateForgetPasswordTeacher = (obj) => {
  const schema = Joi.object({
    email: Joi.string().trim().required(),
  });
  return schema.validate(obj);
};

const validateVerifyCodeTeacher = (obj) => {
  const schema = Joi.object({
    verifyCode: Joi.number().required(),
    teacherId: Joi.string().trim().required(),
  });
  return schema.validate(obj);
};

const validateUpdatedPasswordTeacher = (obj) => {
  const schema = Joi.object({
    password: Joi.string().required(),
    teacherId: Joi.string().trim().required(),
  });
  return schema.validate(obj);
};

// Validate register teacher
const validateLoginTeacher = (obj) => {
  const schema = Joi.object({
    email: Joi.string().email().trim().required(),
    password: Joi.string().required(),
  });
  return schema.validate(obj);
};

module.exports = {
  Teacher,
  validateRegisterTeacher,
  validateLoginTeacher,
  validateForgetPasswordTeacher,
  validateVerifyCodeTeacher,
  validateUpdatedPasswordTeacher,
};
