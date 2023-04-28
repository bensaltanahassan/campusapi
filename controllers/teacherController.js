const asyncHandler = require("express-async-handler");
const {
  validateRegisterTeacher,
  Teacher,
  validateLoginTeacher,
  validateUpdatedPasswordTeacher,
  validateVerifyCodeTeacher,
  validateForgetPasswordTeacher,
} = require("../models/teacherModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const { JsonWebTokenError } = require("jsonwebtoken");
const sendMail = require("../utils/sendmail");
const fs = require("fs");

/**
 * @description     register teacher
 * @router          /teachers/register
 * @method          POST
 * @access          public
 */

module.exports.registerTeacherController = asyncHandler(async (req, res) => {
  // await Teacher.deleteMany({});
  // validate data
  const { error } = validateRegisterTeacher(req.body);
  if (error) {
    return res.status(400).json({
      status: false,
      message: error.details[0].message,
    });
  }
  const { fullName, email, password } = req.body;

  // check if email exist
  let teacher = await Teacher.findOne({ email });
  if (teacher) {
    return res
      .status(400)
      .json({ status: false, message: "Email déja utilisé" });
  }
  // hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // get the path to the image
  const imageUrl = path.join(__dirname, `../assets/${req.file.filename}`);

  // generate verify code Math.floor(Math.random() * (max - min + 1)) + min;
  const verifyCode = Math.floor(Math.random() * 90000) + 10000;

  await sendMail(email, verifyCode);

  // create new teacher and save it
  teacher = new Teacher({
    fullName,
    email,
    password: hashedPassword,
    imageUrl,
    verifyCode,
  });
  await teacher.save();

  teacher = await Teacher.findById(teacher._id)
    .select("-password")
    .select("-verifyCode");

  res.status(201).json({ status: true, teacher });
});

/**
 * @description     login teacher
 * @router          /teachers/login
 * @method          POST
 * @access          public
 */

// create teacher login controller
module.exports.loginTeacherController = asyncHandler(async (req, res) => {
  const { error } = validateLoginTeacher(req.body);
  if (error) {
    return res.status(400).json({
      status: false,
      message: error.details[0].message,
    });
  }
  const { email, password } = req.body;
  let teacher = await Teacher.findOne({ email });
  if (!teacher) {
    return res.status(404).json({
      status: false,
      message: "Utilisateur non trouvé",
    });
  }
  const passwordIsMatch = await bcrypt.compare(password, teacher.password);
  if (!passwordIsMatch) {
    return res.status(400).json({
      status: false,
      message: "Mot de passe incorrect",
    });
  }
  // generate token for teacher
  const accessToken = jwt.sign({ id: teacher._id }, process.env.JWT_SECRET);

  teacher = await Teacher.findById(teacher._id)
    .select("-password")
    .select("-verifyCode");

  let result = { ...teacher.toObject() };
  result.token = accessToken;
  res.status(200).json({ status: true, user: result });
});

/**
 * @description     Forget Password teacher
 * @router          /teachers/forgetpassword
 * @method          POST
 * @access          public
 */

module.exports.forgetPasswordTeacherController = asyncHandler(
  async (req, res) => {
    // validate data
    const { error } = validateForgetPasswordTeacher(req.body);
    if (error) {
      return res
        .status(400)
        .json({ status: false, message: error.details[0].message });
    }
    const { email } = req.body;

    let teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return res
        .status(404)
        .json({ status: false, message: "Professeur non trouvé" });
    }
    // email exist ===> generate code

    const verifyCode = Math.floor(Math.random() * 90000) + 10000;

    // send it to email
    await sendMail(email, verifyCode);

    // change verify code ond DB
    await Teacher.findByIdAndUpdate(teacher._id, { $set: { verifyCode } });

    // send response to frontend
    res.status(200).json({ status: true, teacher });
  }
);

/**
 * @description     verify code teacher
 * @router          /teachers/verifyCode
 * @method          POST
 * @access          public
 */

module.exports.verifyCodeTeacherController = asyncHandler(async (req, res) => {
  // validate data
  const { error } = validateVerifyCodeTeacher(req.body);
  if (error) {
    return res
      .status(400)
      .json({ status: false, message: error.details[0].message });
  }
  const { verifyCode, teacherId } = req.body;

  const teacher = await Teacher.findById(teacherId);

  if (teacher.verifyCode != verifyCode) {
    return res.status(400).json({
      status: false,
      message: "Verification code érroné",
    });
  }

  await Teacher.findByIdAndUpdate(teacherId, {
    $set: { isAccountVerified: true },
  });

  res.status(200).json({
    status: true,
  });
});

/**
 * @description     verify code teacher
 * @router          /teachers/changepassword
 * @method          PUT
 * @access          public
 */

module.exports.changePasswordCodeTeacherController = asyncHandler(
  async (req, res) => {
    // validate data
    const { error } = validateUpdatedPasswordTeacher(req.body);
    if (error) {
      return res
        .status(400)
        .json({ status: false, message: error.details[0].message });
    }
    const { teacherId, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const teacher = await Teacher.findByIdAndUpdate(teacherId, {
      $set: { password: hashedPassword },
    })
      .select("-password")
      .select("-verifyCode");
    // generate token for Teacher
    const token = jwt.sign({ id: teacher._id }, process.env.JWT_SECRET);
    teacher.token = token;
    // send response to client
    res.status(200).json({ status: true, user: teacher });
  }
);

/**
 * @description     update teacher
 * @router          /teachers/:teacherId
 * @method          PUT
 * @access          private(only teacher)
 */

module.exports.updateTeacherController = asyncHandler(async (req, res) => {
  console.log(req.body);
  const { fullName, email, password } = req.body;

  // check if email is exist

  let teacher = await Teacher.findOne({
    email,
  });

  if (teacher && teacher._id != req.params.teacherId) {
    return res.status(400).json({
      status: false,
      message: "Email déja utilisé",
    });
  }

  if (password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;
  }

  teacher = await Teacher.findByIdAndUpdate(
    req.params.teacherId,
    {
      $set: req.body,
    },
    {
      new: true,
    }
  );

  // generate token for teacher
  const token = jwt.sign({ id: teacher._id }, process.env.JWT_SECRET);
  let result = { ...teacher.toObject(), token };

  res.status(200).json({ status: true, teacher: result });
});

/**
 * @description     update teacher image
 * @router          /teachers/:teacherId/image
 * @method          PUT
 * @access          private(only teacher)
 */

module.exports.updateTeacherImageController = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.teacherId);
  if (!teacher) {
    return res.status(404).json({
      status: false,
      message: "Professeur non trouvé",
    });
  }

  let imageUrl = teacher.imageUrl;

  const unixPath = path.posix.join(...imageUrl.split(path.sep));

  fs.unlink(unixPath, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("File removed!");
  });

  imageUrl = path.join(__dirname, `../assets/${req.file.filename}`);

  const updatedTeacher = await Teacher.findByIdAndUpdate(
    req.params.teacherId,
    {
      $set: { imageUrl },
    },
    {
      new: true,
    }
  );

  // generate token for teacher
  const token = jwt.sign({ id: teacher._id }, process.env.JWT_SECRET);
  let result = { ...updatedTeacher.toObject(), token };

  res.status(200).json({
    status: true,
    teacher: result,
  });
});

/**
 * @description     resend Code verification
 * @router          /teachers/resendCode
 * @method          POST
 * @access          private(only teacher)
 */

module.exports.resendCodeController = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const teacher = await Teacher.findOne({ email });

  if (!teacher) {
    return res.status(404).json({
      status: false,
      message: "Professeur non trouvé",
    });
  }

  const verifyCode = Math.floor(Math.random() * 90000) + 10000;

  // send it to email
  await sendMail(email, verifyCode);

  // change verify code ond DB
  await Teacher.findByIdAndUpdate(teacher._id, { $set: { verifyCode } });

  // send response to frontend
  res.status(200).json({ status: true, teacher });
});
