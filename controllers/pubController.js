const asyncHandler = require("express-async-handler");
const Comment = require("../models/commentsModel");
const { find } = require("../models/pubModel");
const Pub = require("../models/pubModel");
const path = require("path");
const File = require("../models/filesModel");
const { Module } = require("../models/moduleModel");
const { Teacher } = require("../models/teacherModel");
const { Notification } = require("../models/notificationModel");

/**
 * @description     Add pub 
 * @router          /pubs
 * @method          POST
 * @access          public

*/

module.exports.createPubController = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { moduleId } = req.params;

  const pub = await Pub.create({
    moduleId,
    content,
  });

  if (req.file) {
    // get the path to the image
    const filePath = path.join(__dirname, `../files/${req.file.filename}`);

    const file = new File({
      module: moduleId,
      name: req.file.originalname,
      type: req.body.type,
      path: filePath,
    });
    await file.save();

    pub.file = file._id;
    await pub.save();
  }

  const module = await Module.findById(moduleId);

  // send notification to all students in the module
  const students = module.students;

  students.forEach(async (student) => {
    Notification.create({
      user: student,
      userType: "Student",
      page: `/modules/${module.id}/boards`,
      message: `Un nouveau publication a été ajouté dans le module ${module.name}`,
    });
  });

  res
    .status(201)
    .json({ status: true, message: "Publication créer avec succès" });
});

/**
 * @description     Get all pub
 * @router          /pubs
 * @method          GET
 * @access          public
 */

module.exports.getAllPubController = asyncHandler(async (req, res) => {
  const { moduleId } = req.params;
  const pubs = await Pub.find({ moduleId }).sort({ createdAt: -1 });

  res.status(200).json({ status: true, pubs });
});

/**
 * @description     Get single pub
 * @router          /pubs
 * @method          GET
 * @access          public
 */

module.exports.getSinglePubController = asyncHandler(async (req, res) => {
  const { pubId } = req.params;
  const pub = await Pub.findById(pubId);
  const module = await Module.findById(pub.moduleId);
  const teacher = await Teacher.findById(module.teacherId);

  res.status(200).json({ status: true, pub, teacher });
});
