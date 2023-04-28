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

const studentSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  codeMassar: { type: String, required: true, trim: true, unique: true },
  cin: { type: String, required: true, trim: true, unique: true },
  phoneNumber: { type: String, required: true, trim: true, unique: true },
  password: { type: String, required: true, minlength: 8 },
  isAccountVerified: { type: Boolean, default: false },
  verifyCode: { type: Number },
});

const Student = mongoose.model("Student", studentSchema);

// Validate register techear
const validateRegisterStudent = (obj) => {
  const schema = Joi.object({
    fullName: Joi.string().trim().required(),
    cin: Joi.string().trim().required(),
    codeMassar: Joi.string().trim().required(),
    phoneNumber: Joi.string().trim().required(),
    password: Joi.string().trim().required(),
  });
  return schema.validate(obj);
};

//TODO: make or condition
// Validate login student
const validateLoginStudent = (obj) => {
  const schema = Joi.object({
    cin: Joi.string().trim(),
    codeMassar: Joi.string().trim(),
    password: Joi.string().trim().required(),
  });
  return schema.validate(obj);
};

// forgetten password
const validateForgetPasswordStudent = (obj) => {
  const schema = Joi.object({
    cin: Joi.string().trim().required(),
  });
  return schema.validate(obj);
};

const validateVerifyCodeStudent = (obj) => {
  const schema = Joi.object({
    verifyCode: Joi.number().required(),
    studentId: Joi.string().trim().required(),
  });
  return schema.validate(obj);
};

const validateUpdatedPasswordStudent = (obj) => {
  const schema = Joi.object({
    password: Joi.string().required(),
    studentId: Joi.string().trim().required(),
  });
  return schema.validate(obj);
};

module.exports = {
  Student,
  validateRegisterStudent,
  validateLoginStudent,
  validateForgetPasswordStudent,
  validateVerifyCodeStudent,
  validateUpdatedPasswordStudent,
};
