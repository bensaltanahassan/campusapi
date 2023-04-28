const asyncHandler = require("express-async-handler");
const {
  validateCreateModule,
  Module,
  validateGetALLModules,
} = require("../models/moduleModel");
const { Student } = require("../models/studentModel");
const Mark = require("../models/markModel");
const File = require("../models/filesModel");
const Invitation = require("../models/invitationModel");
const Teacher = require("../models/teacherModel");
const { Chat } = require("../models/chatModel");
const { Message } = require("../models/messageModel");
const { Notification } = require("../models/notificationModel");
const Pub = require("../models/pubModel");
const Comment = require("../models/commentsModel");
const path = require("path");

const { v4: uuidv4 } = require("uuid");
const Task = require("../models/taskModel");
const TaskCompletion = require("../models/taskCompletionModel");
/**
 * @description     Get all modules
 * @router          /modules/all
 * @method          GET
 * @access          public
 */
module.exports.getAllModulesController = asyncHandler(async (req, res) => {
  const { userId, userType } = req.body;
  let modules = [];
  if (userType === "Student") {
    modules = await Module.find({
      students: { $in: [userId] },
    });
  } else {
    modules = await Module.find({
      teacherId: userId,
    });
  }
  res.status(200).json({ status: true, modules });
});

/**
 * @description     search module
 * @router          /search
 * @method          POST
 * @access          public
 */
module.exports.searchModuleController = asyncHandler(async (req, res) => {
  const { identifiant, studentId } = req.body;
  // get all modules that has identifiant and the student doesnt in
  const module = await Module.findOne({
    identifiant,
  });
  if (!module) {
    return res
      .status(404)
      .json({ status: false, message: "Module introuvable" });
  }
  // if student id already in
  console.log(module.students);
  for (let i = 0; i < module.students.length; i++) {
    if (module.students[i]._id.toString() === studentId) {
      return res.status(400).json({
        status: false,
        message: "Vous êtes déjà inscrit dans ce module",
      });
    }
  }
  res.status(200).json({ status: true, module });
});

/**
 * @description     create module
 * @router          /modules
 * @method          POST
 * @access          private (teacher)
 */

module.exports.createModuleController = asyncHandler(async (req, res) => {
  const { name, teacherId, classe, color, identifiant } = req.body;

  let module = await Module.findOne({
    identifiant,
  });
  if (module)
    return res
      .status(400)
      .json({ status: false, message: "Module déjà existant avec ce ID" });

  module = new Module({
    name,
    teacherId,
    classe,
    identifiant,
    color,
  });

  await module.save();
  res.status(201).json({ status: true, message: "Module créer avec succès" });
});

/**
 * @description     generate auto id
 * @router          /modules/generateAutoId
 * @method          GET
 * @access          private (teacher)
 */

module.exports.generateAutoIdController = asyncHandler(async (req, res) => {
  const identifiant = uuidv4();
  res.status(201).json({ status: true, identifiant });
});

/**
 * @description     Update Module
 * @router          /modules/:moduleId
 * @method          PUT
 * @access          private(only teacher)
 */
module.exports.updateModuleController = asyncHandler(async (req, res) => {
  const { moduleId } = req.params;
  const { name, classe } = req.body;
  const module = await Module.findById(moduleId);
  if (!module)
    return res
      .status(404)
      .json({ status: false, message: "Module introuvable" });
  module.name = name;
  module.classe = classe;
  await module.save();
  res.status(200).json({ status: true, message: "Module modifié avec succès" });
});

/**
 * @description     DELETE
 * @router          /modules/:moduleId
 * @method          DELETE
 * @access          private
 */

module.exports.deleteModuleController = asyncHandler(async (req, res) => {
  // get the module
  const { moduleId } = req.params;
  const module = await Module.findById(moduleId);

  // delete all files
  await File.deleteMany({ module: moduleId });

  // get all pubs
  const pubs = await Pub.find({ module: moduleId });

  // delete all comments
  for (let i = 0; i < pubs.length; i++) {
    await Comment.deleteMany({
      pubId: pubs[i]._id.toString(),
    });
  }

  // delete all pubs
  await Pub.deleteMany({ module: moduleId });

  // delete all invitations
  await Invitation.deleteMany({ module: moduleId });
  // delete all notes
  await Mark.deleteMany({ module: moduleId });

  // get all chats
  const chats = await Chat.find({ module: moduleId });
  // delete all messages
  for (let i = 0; i < chats.length; i++) {
    const messages = chats[i].messages;
    for (let j = 0; j < messages.length; j++) {
      await Message.findByIdAndDelete(messages[j]);
    }
  }
  // delete all chats
  await Chat.deleteMany({ module: moduleId });

  // delete the module
  await Module.findByIdAndDelete(moduleId);

  res.status(200).json({
    status: true,
    message: "Module supprimé avec succès",
  });
});

/**
 * @description     Get module info
 * @router          /modules/:moduleId
 * @method          GET
 * @access          public
 */
module.exports.getModuleInfoController = asyncHandler(async (req, res) => {
  const { moduleId } = req.params;
  const module = await Module.findById(moduleId);
  if (!module)
    return res
      .status(404)
      .json({ status: false, message: "Module introuvable" });
  res.status(200).json({ status: true, module });
});

/**
 * @description     Get statistiques module
 * @router          /modules/:moduleId/statistiques
 * @method          GET
 * @access          private (teacher)
 */
module.exports.getStatistiquesModuleController = asyncHandler(
  async (req, res) => {
    const { moduleId } = req.params;

    const module = await Module.findById(moduleId);
    if (!module)
      return res
        .status(400)
        .json({ status: false, message: "Module introuvable" });

    // ====================================
    // get the number of docs
    const files = await File.find({
      module: moduleId,
    });
    // get the number of cours/tds/tps/exams
    let cours = 0;
    let tds = 0;
    let tps = 0;
    let exams = 0;
    let downloads = 0;
    for (let i = 0; i < files.length; i++) {
      if (files[i].type === "cours") {
        cours++;
      }
      if (files[i].type === "td") {
        tds++;
      }
      if (files[i].type === "tp") {
        tps++;
      }
      if (files[i].type === "exam") {
        exams++;
      }
      downloads += files[i].downloadNumber;
    }

    // ====================================
    // get the students
    let students = module.students;
    // get the students who have validated/not validate/less than 7
    // get note max/min/avg
    let studentsValidated = [];
    let studentsNotValidated = [];
    let studentLessThan7 = [];
    let max = 0;
    let min = 20;
    let avg = 0;

    if (students.length === 0) {
      min = 0;
    } else {
      for (let i = 0; i < students.length; i++) {
        let mark = await Mark.findOne({
          student: students[i],
          module: moduleId,
        });
        if (mark) {
          if (mark.mark >= 12) {
            studentsValidated.push(mark);
          }
          if (mark.mark < 12) {
            studentsNotValidated.push(mark);
          }
          if (mark.mark < 7) {
            studentLessThan7.push(mark);
          }
          if (mark.mark > max) {
            max = mark.mark;
          }
          if (mark.mark < min) {
            min = mark.mark;
          }
          avg += mark.mark;
        }
      }
      avg = avg / students.length;
    }

    // get etudiants who whave the max / min
    const maxMark = await Mark.find({
      module: moduleId,
      mark: max,
    });
    const minMark = await Mark.find({
      module: moduleId,
      mark: min,
    });

    res.status(200).json({
      status: true,
      statistiques: {
        files: {
          docs: files.length,
          cours,
          tds,
          tps,
          exams,
          downloads,
        },
        students: {
          students,
          studentsValidated,
          studentsNotValidated,
          studentLessThan7,
        },
        marks: {
          max: maxMark,
          min: minMark,
          avg,
        },
      },
    });
  }
);

/**
 * @description     Get all Student in module
 * @router          /modules/:moduleId/students
 * @method          GET
 * @access          private (teacher)
 */

module.exports.getAllStudentsInModuleController = asyncHandler(
  async (req, res) => {
    const { moduleId } = req.params;

    const module = await Module.findById(moduleId);
    if (!module)
      return res
        .status(400)
        .json({ status: false, message: "Module introuvable" });

    const students = module.students;
    const teacherId = module.teacherId;
    const teacher = await Teacher.Teacher.findById(teacherId);

    res.status(200).json({ status: true, students, teacher });
  }
);

/**
 * @description     Get Notes module
 * @router          /modules/:moduleId/notes
 * @method          GET
 * @access          private (teacher)
 */
module.exports.getNotesModuleController = asyncHandler(async (req, res) => {
  const { moduleId } = req.params;
  const notes = await Mark.find({
    module: moduleId,
  });
  res.status(200).json({ status: true, notes });
});

/**
 * @description     Add Note module
 * @router          /modules/:moduleId/notes
 * @method          POST
 * @access          private (teacher)
 */

module.exports.addNoteModuleController = asyncHandler(async (req, res) => {
  const { moduleId } = req.params;
  const { studentId, mark } = req.body;
  await Mark.create({
    student: studentId,
    module: moduleId,
    mark,
  });
  res.status(201).json({ status: true, message: "Note ajoutée avec succès" });
});

/**
 * @description     Update Note module
 * @router          /modules/:moduleId/notes
 * @method          PUT
 * @access          private (teacher)
 */

module.exports.updateNoteModuleController = asyncHandler(async (req, res) => {
  const { moduleId } = req.params;
  const { studentId, mark } = req.body;
  await Mark.findOneAndUpdate(
    {
      student: studentId,
      module: moduleId,
    },
    {
      mark,
    }
  );
  res.status(201).json({ status: true, message: "Note modifiée avec succès" });
});

/**
 * @description     Get all invitations
 * @router          /modules/:moduleId/invitations
 * @method          GET
 * @access          private (teacher)
 */

module.exports.getAllInvitationsController = asyncHandler(async (req, res) => {
  const { moduleId } = req.params;

  const invitations = await Invitation.find({
    module: moduleId,
  });
  res.status(200).json({ status: true, invitations });
});

/**
 * @description     Send invit to module
 * @router          /modules/:moduleId/invitations
 * @method          POST
 * @access          private (teacher)
 */

module.exports.SendInvitationToModuleController = asyncHandler(
  async (req, res) => {
    const { moduleId } = req.params;

    const { studentId } = req.body;

    // check if the invitation is exist

    const invitation = await Invitation.findOne({
      module: moduleId,
      student: studentId,
    });

    if (!invitation) {
      // send invitation
      await Invitation.create({
        module: moduleId,
        student: studentId,
      });
      // get studentName and moduleName
      const student = await Student.findById(studentId);
      const module = await Module.findById(moduleId);

      // send notification
      await Notification.create({
        message: `${student.fullName} a envoyer une
        invitation pour rejoindre le module ${module.name}`,
        user: module.teacherId,
        userType: "Teacher",
        page: `/modules/${module.id}/invitations`,
      });
    }

    res.status(201).json({
      status: true,
      message: "Invitation envoyée avec succès",
    });
  }
);

/**
 * @description     Confirm invitation
 * @router          /modules/:moduleId/invitations/:invitationId
 * @method          POST
 * @access          private (teacher)
 */

module.exports.confirmInvitationController = asyncHandler(async (req, res) => {
  const { invitationId } = req.params;

  const invitation = await Invitation.findById(invitationId);

  const module = await Module.findById(invitation.module);
  const students = module.students;

  students.push(invitation.student);
  await module.save();

  // add Student to marks
  await Mark.create({
    student: invitation.student,
    module: invitation.module,
  });

  // create chat for that student
  await Chat.create({
    module: invitation.module,
    student: invitation.student,
    teacher: module.teacherId,
  });

  await Invitation.findByIdAndDelete(invitationId);

  // send notification
  await Notification.create({
    message: `Vous avez rejoint le module ${module.name}`,
    user: invitation.student,
    userType: "Student",
    page: `/modules/${module.id}`,
  });

  res.status(200).json({
    status: true,
    message: "Invitation confirmée avec succès",
  });
});

/**
 * @description     Rejet invitation
 * @router          /modules/:moduleId/invitations/:invitationId
 * @method          DELETE
 * @access          private (teacher)
 */

module.exports.rejectInvitationController = asyncHandler(async (req, res) => {
  const { invitationId } = req.params;

  await Invitation.findByIdAndDelete(invitationId);

  res.status(200).json({
    status: true,
    message: "Invitation rejetée avec succès",
  });
});

/**
 * @description     Get all conversations
 * @router          /modules/:moduleId/chats
 * @method          POST
 * @access          private (teacher)
 */

module.exports.getAllConversationsController = asyncHandler(
  async (req, res) => {
    const { moduleId } = req.params;
    const { id: userId } = req.user;
    const { isTeacher } = req.body;

    const chats = isTeacher
      ? await Chat.find({
          module: moduleId,
        })
      : await Chat.find({
          module: moduleId,
          student: userId,
        });

    res.status(200).json({ status: true, chats });
  }
);

/**
 * @description     GET single chat
 * @router          /modules/:moduleId/chats/:chatId
 * @method          GET
 * @access          private (only logged in)
 */

module.exports.getSingleChatController = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  const chat = await Chat.findById(chatId);

  res.status(200).json({ status: true, chat });
});

/**
 * @description     Send message
 * @router          /modules/:moduleId/chats/:chatId
 * @method          POST
 * @access          private (teacher)
 */

module.exports.sendMessageController = asyncHandler(async (req, res) => {
  // get the user id (from verifyToken middle)
  const { id: userId } = req.user;

  const { chatId } = req.params;
  const { isTeacher, message } = req.body;

  const senderType = isTeacher ? "Teacher" : "Student";

  const recipientType = isTeacher ? "Student" : "Teacher";

  // Find the chat by ID
  const chat = await Chat.findById(chatId);

  // Create a new message
  const newMessage = new Message({
    message,
    sender: isTeacher ? chat.teacher : chat.student,
    senderType,
    recipient: isTeacher ? chat.student : chat.teacher,
    recipientType,
  });

  // Add the message to the chat messages array
  chat.messages.push(newMessage);

  // Save the new message and the updated chat
  await Promise.all([newMessage.save(), chat.save()]);

  res.status(201).json({ status: true, message: "Message envoyé avec succès" });
});

/**
 * @description     Exit from module
 * @router          /modules/:moduleId/exit
 * @method          POST
 * @access          private
 */

module.exports.exitFromModuleController = asyncHandler(async (req, res) => {
  const { moduleId } = req.params;
  const { id: userId } = req.user;

  // get the module
  const module = await Module.findById(moduleId);

  const students = module.students;

  // filter student in module
  const newStudents = students.filter((student) => student._id != userId);

  module.students = newStudents;

  await module.save();

  // delete marks
  await Mark.findOneAndDelete({
    module: moduleId,
    student: userId,
  });

  // delete chat
  await Chat.findOneAndDelete({
    module: moduleId,
    student: userId,
  });

  res.status(200).json({ status: true, message: "Vous avez quitté le module" });
});

/**
 * @description     Delete student from module
 * @router          /modules/:moduleId/deletestudent/:studentId
 * @method          POST
 * @access          private
 */

module.exports.deleteStudentFromModuleController = asyncHandler(
  async (req, res) => {
    const { moduleId, studentId } = req.params;
    console.log(moduleId, studentId);
    // get the module
    const module = await Module.findById(moduleId);

    const students = module.students;

    // filter student in module
    const newStudents = students.filter((student) => student._id != studentId);

    module.students = newStudents;

    await module.save();

    // delete marks
    await Mark.findOneAndDelete({
      module: moduleId,
      student: studentId,
    });

    // delete chat
    await Chat.findOneAndDelete({
      module: moduleId,
      student: studentId,
    });

    res
      .status(200)
      .json({ status: true, message: "Etudiant supprimé avec succès" });
  }
);
//!========================Tasks===========

/**
 * @description     Get all tasks
 * @router          /modules/:moduleId/tasks
 * @method          GET
 * @access          private(only logged in)
 */

module.exports.getAllTasksController = asyncHandler(async (req, res) => {
  const { moduleId } = req.params;

  const tasks = await Task.find({ module: moduleId });

  res.status(200).json({ status: true, tasks });
});

/**
 * @description     Get Single Task
 * @router          /modules/:moduleId/tasks/:taskId
 * @method          GET
 * @access          private (only logged in)
 */

module.exports.getSingleTaskController = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  // get the task
  const task = await Task.findById(taskId);

  // get the task completion
  const taskCompletion = await TaskCompletion.find({ task: taskId });

  res.status(200).json({ status: true, task, taskCompletion });
});

/**
 * @description     Add task
 * @router          /modules/:moduleId/tasks
 * @method          POST
 * @access          private (only teacher)
 */

module.exports.addTaskController = asyncHandler(async (req, res) => {
  const { debut, fin, description, bonus, penalty } = req.body;

  const task = await Task.create({
    module: req.params.moduleId,
    debut,
    fin,
    description,
    bonus,
    penalty,
  });

  if (req.file) {
    // get the path to the image
    const filePath = path.join(__dirname, `../files/${req.file.filename}`);

    const file = new File({
      module: req.params.moduleId,
      name: req.file.originalname,
      type: "task",
      path: filePath,
    });
    await file.save();

    task.file = file._id;
    await task.save();
  }

  const module = await Module.findById(req.params.moduleId);

  // send notification to all students in the module
  const students = module.students;

  students.forEach(async (student) => {
    await Notification.create({
      user: student,
      userType: "Student",
      page: `/modules/${module.id}/tasks`,
      message: `Une nouveau task a été ajouté dans le module ${module.name}`,
    });
  });

  res.status(201).json({ status: true, task });
});

/**
 * @description     Answer Task
 * @router          /modules/:moduleId/tasks/taskId/answer
 * @method          POST
 * @access          private (only student)
 */

module.exports.answerTaskController = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { id: studentId } = req.user;

  const taskCompletion = await TaskCompletion.create({
    task: taskId,
    student: studentId,
  });
  if (req.file) {
    // get the path to the image
    const filePath = path.join(__dirname, `../files/${req.file.filename}`);

    const file = new File({
      module: req.params.moduleId,
      name: req.file.originalname,
      type: "taskAnswer",
      path: filePath,
    });
    await file.save();

    taskCompletion.file = file._id;
    await taskCompletion.save();
  }

  res.status(201).json({ status: true, taskCompletion });
});

/**
 * @description     EvaluateTask
 * @router          /modules/:moduleId/tasks/taskId/evaluate
 * @method          POST
 * @access          private (only teacher)
 */

module.exports.evaluateTaskController = asyncHandler(async (req, res) => {
  const { studentId, point } = req.body;

  const { moduleId } = req.params;

  const mark = await Mark.findOne({ student: studentId, module: moduleId });

  const noteModule = mark.mark;

  if (!noteModule) {
    mark.mark = 0;
    await mark.save();
    return res
      .status(200)
      .json({ status: true, message: "Note ajoutée avec succès" });
  }

  let newNote = noteModule + point;

  if (newNote > 20) newNote = 20;

  if (newNote < 0) newNote = 0;

  mark.mark = newNote;

  await mark.save();

  res.status(200).json({ status: true, message: "Note ajoutée avec succès" });
});
