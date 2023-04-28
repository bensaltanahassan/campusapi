const {
  registerTeacherController,
  loginTeacherController,
  forgetPasswordTeacherController,
  verifyCodeTeacherController,
  changePasswordCodeTeacherController,
  updateTeacherController,
  updateTeacherImageController,
  resendCodeController,
} = require("../controllers/teacherController");
const { photoUpload } = require("../middleware/fileUpload");
const verifyToken = require("../middleware/verifyToken");

const teacherRouter = require("express").Router();

teacherRouter.post(
  "/register",
  photoUpload.single("image"),
  registerTeacherController
);
teacherRouter.post("/login", loginTeacherController);
teacherRouter.post("/forgetpassword", forgetPasswordTeacherController);
teacherRouter.post("/verifycode", verifyCodeTeacherController);
teacherRouter.put("/changepassword", changePasswordCodeTeacherController);
teacherRouter.post("/resendCode", resendCodeController);

teacherRouter.route("/:teacherId").put(verifyToken, updateTeacherController);

teacherRouter
  .route("/:teacherId/image")
  .put(verifyToken, photoUpload.single("image"), updateTeacherImageController);

module.exports = teacherRouter;
