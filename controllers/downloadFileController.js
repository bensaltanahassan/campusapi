const asyncHandler = require("express-async-handler");
const File = require("../models/filesModel");

/**
 * @description     Download file
 * @router          /files/:fileId/download
 * @method          GET
 * @access          public
 */

module.exports.downloadFileController = asyncHandler(async (req, res) => {
  const { fileId } = req.params;
  const file = await File.findById(fileId);

  if (file) {
    file.downloadNumber += 1;
    await file.save();
    res.download(file.path, file.name);
  } else {
    res.status(404).json({ status: false, message: "Fichier introuvable" });
  }
});
