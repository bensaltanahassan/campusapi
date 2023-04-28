const asyncHandler = require("express-async-handler");
const Comment = require("../models/commentsModel");
const Pub = require("../models/pubModel");

/**
 * @description     Add comments in pub
 * @router          /comments/:pubId/
 * @method          POST
 * @access          public

*/

module.exports.createPubCommentsController = asyncHandler(async (req, res) => {
  const { pubId } = req.params;
  const { studentId, content } = req.body;

  const comment = await Comment.create({
    content,
    studentId,
    pubId,
  });

  // add comment id comments array in pub
  await Pub.findByIdAndUpdate(pubId, {
    $push: { comments: comment._id },
  });

  res.status(201).json({ success: true });
});
