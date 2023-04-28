const nodemailer = require("nodemailer");

const sendMail = async (email, verifyCode) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "bensaltanahassan@gmail.com",
      pass: "mnddzznbldyoyksm",
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: '"MERN app" <hbc@hbc.com>',
    to: email,
    subject: "Verification Code",
    // we can send html or text or both of them
    text: `Le code de vérification`,
    html: `<h1>Votre code de vérification est: ${verifyCode}</h1>`,
  };

  await transporter.sendMail(mailOptions, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Email sent successfully");
    }
  });
};

module.exports = sendMail;
