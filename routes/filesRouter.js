const {
  downloadFileController,
} = require("../controllers/downloadFileController");
const {
  addFileToModuleController,
  getAllFilesInModuleController,
} = require("../controllers/filesController");
const { fileUpload } = require("../middleware/fileUpload");
const verifyToken = require("../middleware/verifyToken");

const filesRouter = require("express").Router();

filesRouter
  .route("/:moduleId")
  .post(verifyToken, fileUpload.single("file"), addFileToModuleController)
  .get(verifyToken, getAllFilesInModuleController);

filesRouter.route("/download/:fileId").get(downloadFileController);

module.exports = filesRouter;
