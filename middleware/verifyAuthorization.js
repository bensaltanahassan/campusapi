const verifyAuthorizationTeacher = (req, res, next) => {
  console.log("====================================");
  console.log(req.body);

  if (req.user.id !== req.body.teacherId) {
    return res.status(401).json({
      status: false,
      message: "You are not authorized to perform this action",
    });
  }
  next();
};

const verifyAuthorizationStudent = (req, res, next) => {
  if (req.user.id !== req.body.studentId) {
    return res.status(401).json({
      status: false,
      message: "You are not authorized to perform this action",
    });
  }
  next();
};

module.exports = {
  verifyAuthorizationTeacher,
  verifyAuthorizationStudent,
};
