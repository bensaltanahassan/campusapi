const asyncHandler = require("express-async-handler");
const {
  validateAddStudent,
  Student,
  validateLoginStudent,
  validateForgetPasswordStudent,
  validateVerifyCodeStudent,
  validateUpdatedPasswordStudent,
  validateRegisterStudent,
} = require("../models/studentModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendWhatsappMessage = require("../utils/sendWhatsappMessage");
/**
 * @description     register student
 * @router          /students/register
 * @method          POST
 * @access          public
 */

module.exports.registerStudentController = asyncHandler(async (req, res) => {
  // await Student.deleteMany({});
  // validate data
  const { error } = validateRegisterStudent(req.body);
  if (error) {
    return res.status(400).json({
      status: false,
      message: error.details[0].message,
    });
  }
  const { fullName, cin, codeMassar, phoneNumber, password } = req.body;

  // check if email exist
  let student = await Student.findOne({ $or: [{ codeMassar }, { cin }] });
  if (student) {
    return res
      .status(400)
      .json({ status: false, message: "codeMassar ou cin existe déja" });
  }
  // verify if the phone is not used
  student = await Student.findOne({ phoneNumber });
  if (student) {
    return res
      .status(400)
      .json({ status: false, message: "Numéro de téléphone existe déja" });
  }

  // hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // generate verify code Math.floor(Math.random() * (max - min + 1)) + min;
  const verifyCode = Math.floor(Math.random() * 90000) + 10000;

  // send verify code to the phone number
  await sendWhatsappMessage(fullName, verifyCode, phoneNumber);

  // create new teacher and save it
  student = new Student({
    fullName,
    cin,
    codeMassar,
    phoneNumber,
    password: hashedPassword,
    verifyCode,
  });
  await student.save();

  student = await Student.findById(student._id).select("-password -verifyCode");

  res.status(201).json({ status: true, student });
});

/**
 * @description     login student
 * @router          /students/login
 * @method          POST
 * @access          public
 */

module.exports.loginStudentController = asyncHandler(async (req, res) => {
  // validate data
  const { error } = validateLoginStudent(req.body);
  if (error) {
    return res
      .status(400)
      .json({ status: false, message: error.details[0].message });
  }
  const { cin, codeMassar, password } = req.body;
  let student = await Student.findOne({ $or: [{ cin }, { codeMassar }] });
  if (!student) {
    return res
      .status(404)
      .json({ status: false, message: "Etudiant non trouvé" });
  }
  // check if the password is correct
  const passwordIsMatch = await bcrypt.compare(password, student.password);
  if (!passwordIsMatch) {
    return res
      .status(400)
      .json({ status: false, message: "Mot de passe incorrect" });
  }
  student = await Student.findById(student._id)
    .select("-password")
    .select("-verifyCode");
  // generate token for student
  const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET);
  let result = { ...student.toObject(), token };
  res.status(200).json({ status: true, user: result });
});

/**
 * @description     Forget Password student
 * @router          /students/forgetpassword
 * @method          POST
 * @access          public
 */

module.exports.forgetPasswordStudentController = asyncHandler(
  async (req, res) => {
    // validate data
    const { error } = validateForgetPasswordStudent(req.body);
    if (error) {
      return res
        .status(400)
        .json({ status: false, message: error.details[0].message });
    }
    const { cin } = req.body;

    let student = await Student.findOne({ cin });
    if (!student) {
      return res
        .status(404)
        .json({ status: false, message: "Etudiant non trouvé" });
    }
    // cin exist ===> generate code

    const verifyCode = Math.floor(Math.random() * 90000) + 10000;

    // send it to whatsap
    await sendWhatsappMessage(
      student.fullName,
      verifyCode,
      student.phoneNumber
    );

    // change verify code ond DB
    await Student.findByIdAndUpdate(student._id, { $set: { verifyCode } });

    // send response to frontend
    res.status(200).json({ status: true, student });
  }
);

/**
 * @description     verify code student
 * @router          /students/verifyCode
 * @method          POST
 * @access          public
 */

module.exports.verifyCodeStudentController = asyncHandler(async (req, res) => {
  // validate data
  const { error } = validateVerifyCodeStudent(req.body);
  if (error) {
    return res
      .status(400)
      .json({ status: false, message: error.details[0].message });
  }
  const { verifyCode, studentId } = req.body;
  let student = await Student.findById(studentId);
  console.log(student);
  if (student.verifyCode != verifyCode) {
    return res.status(400).json({
      status: false,
      message: "Code de vérification eroné",
    });
  }
  student = await Student.findByIdAndUpdate(
    studentId,
    {
      $set: { isAccountVerified: true },
    },
    { new: true }
  );
  res.status(200).json({
    status: true,
  });
});

/**
 * @description     verify code student
 * @router          /students/changepassword
 * @method          PUT
 * @access          public
 */

module.exports.changePasswordCodeStudentController = asyncHandler(
  async (req, res) => {
    // validate data
    const { error } = validateUpdatedPasswordStudent(req.body);
    if (error) {
      return res
        .status(400)
        .json({ status: false, message: error.details[0].message });
    }
    const { studentId, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const student = await Student.findByIdAndUpdate(studentId, {
      $set: { password: hashedPassword },
    })
      .select("-password")
      .select("verifyCode");
    // generate token for student
    const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET);
    student.token = token;
    // send response to client
    res.status(200).json({ status: true, user: student });
  }
);

/**
 * @description     update student
 * @router          /students/:studentId
 * @method          PUT
 * @access          private(only student)
 */

module.exports.updateStudentController = asyncHandler(async (req, res) => {
  console.log(req.body);
  const { fullName, cin, codeMassar, phoneNumber, password } = req.body;

  // check if cin or codeMassar or phoneNumber is used

  let student = await Student.findOne({
    $or: [{ cin }, { codeMassar }, { phoneNumber }],
  })

    .select("-password")
    .select("-verifyCode");

  if (student && student._id != req.params.studentId) {
    return res.status(400).json({
      status: false,
      message: "Cin ou code massar ou numéro de téléphone déja utilisé",
    });
  }

  if (password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;
  }

  student = await Student.findByIdAndUpdate(
    req.params.studentId,
    {
      $set: req.body,
    },
    {
      new: true,
    }
  )
    .select("-password")
    .select("-verifyCode");
  // generate token for student
  const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET);
  let result = { ...student.toObject(), token };
  res.status(200).json({ status: true, student: result });
});

/**
 * @description     resend code
 * @router          /students/resendCode
 * @method          POST
 * @access          private(only student)
 */

module.exports.resendCodeController = asyncHandler(async (req, res) => {
  const { phoneNumber } = req.body;

  let student = await Student.findOne({ phoneNumber: phoneNumber });

  if (!student) {
    return res.status(400).json({
      status: false,
      message: "Numéro de téléphone incorrect",
    });
  }

  const verifyCode = Math.floor(Math.random() * 90000) + 10000;

  // send it to whatsap
  await sendWhatsappMessage(student.fullName, verifyCode, student.phoneNumber);

  // change verify code ond DB
  student.verifyCode = verifyCode;

  await student.save();

  // send response to frontend
  res.status(200).json({ status: true, student });
});
