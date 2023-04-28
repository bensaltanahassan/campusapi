const {
  registerStudentController,
  forgetPasswordStudentController,
  verifyCodeStudentController,
  changePasswordCodeStudentController,
  loginStudentController,
  updateStudentController,
  resendCodeController,
} = require("../controllers/studentController");
const verifyToken = require("../middleware/verifyToken");
const studentRouter = require("express").Router();

studentRouter.put("/:studentId", verifyToken, updateStudentController);

studentRouter.post("/register", registerStudentController);
studentRouter.post("/login", loginStudentController);
studentRouter.post("/forgetpassword", forgetPasswordStudentController);
studentRouter.post("/verifycode", verifyCodeStudentController);
studentRouter.put("/changepassword", changePasswordCodeStudentController);
studentRouter.post("/resendCode", resendCodeController);

module.exports = studentRouter;
