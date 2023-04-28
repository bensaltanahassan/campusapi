const pubRouter = require("express").Router();
const { getSinglePubController } = require("../controllers/pubController");
const verifyToken = require("../middleware/verifyToken");

pubRouter.route("/:pubId").get(verifyToken, getSinglePubController);

module.exports = pubRouter;
