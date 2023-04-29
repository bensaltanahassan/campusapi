const path = require("path");
const multer = require("multer");

// photo storage
const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/images"));
  },
  filename: (req, file, cb) => {
    if (file) {
      cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
    } else {
      cb(null, false);
    }
  },
});

// file storage
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../files"));
  },
  filename: (req, file, cb) => {
    if (file) {
      cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
    } else {
      cb(null, false);
    }
  },
});

// Photo Upload middleware
const photoUpload = multer({
  storage: photoStorage,
  fileFilter: (req, file, cb) => {
    // make condition is there is no file
    if (!file) {
      cb({ message: "no file provided" }, false);
    }
    //   make condition if file is image
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb({ message: "Unsupported file format" }, false); // false => don't upload
    }
    cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 megabyte
  },
});

// File Upload middleware
const fileUpload = multer({
  storage: fileStorage,
  fileFilter: (req, file, cb) => {
    // make condition is there is no file
    if (!file) {
      cb({ message: "no file provided" }, false);
    }
    // make condition if file is pdf
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb({ message: "Unsupported file format" }, false); // false => don't upload
    }
    cb(null, true);
  },
  limits: {
    fileSize: 30 * 1024 * 1024, // 30 megabyte
  },
});

module.exports = { photoUpload, fileUpload };
