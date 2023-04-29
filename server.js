const express = require("express");
const helmet = require("helmet");
const hpp = require("hpp");
const cors = require("cors");

const connectToDB = require("./config/connectToDB.js");
const { notFound, errorHandler } = require("./middleware/error.js");
const teacherRouter = require("./routes/teacherRouter.js");
const studentRouter = require("./routes/studentRouter.js");
const moduleRouter = require("./routes/moduleRouter.js");
const filesRouter = require("./routes/filesRouter.js");
const commentRouter = require("./routes/commentRouter.js");
const path = require("path");
const pubRouter = require("./routes/pubRouter.js");
const notificationRouter = require("./routes/notificationsRouter.js");

const app = express();

// to access to image
app.use("/images", express.static(path.join(__dirname, "public/images")));

// dotenv
require("dotenv").config();

//security
app.use(helmet());
app.use(hpp());
app.use(cors());

//middlewares
app.use(express.json());

//routes
app.use("/teachers", teacherRouter);
app.use("/students", studentRouter);
app.use("/modules", moduleRouter);
app.use("/pub", pubRouter);
app.use("/files", filesRouter);
app.use("/comments", commentRouter);
app.use("/notifications", notificationRouter);

// error handler middleware
app.use(notFound);
app.use(errorHandler);

//mongoose
connectToDB();

//Run the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `server running on port ${PORT} on mode ${process.env.NODE_ENV}... `
  );
});
