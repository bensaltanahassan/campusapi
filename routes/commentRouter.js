const {
  createPubCommentsController,
} = require("../controllers/commentsController");
const {
  verifyAuthorizationStudent,
} = require("../middleware/verifyAuthorization");
const verifyToken = require("../middleware/verifyToken");

const commentRouter = require("express").Router();

commentRouter.post(
  "/:pubId",
  verifyToken,
  verifyAuthorizationStudent,
  createPubCommentsController
);

module.exports = commentRouter;
