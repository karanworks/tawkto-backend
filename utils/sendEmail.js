const nodemailer = require("nodemailer");

async function sendEmail(email, token) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "sendemail2k24@gmail.com",
      pass: process.env.EMAIL_PASSKEY,
    },
  });

  // async..await is not allowed in global scope, must use a wrapper
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: "<sendemail2k24@gmail.com>", // sender address
    to: email, // list of receivers
    subject: "Verification mail for tawkto", // Subject line
    // text: "Hello world?", // plain text body
    html: `<span> Click this link to verify your email -> </span> <a href=http://localhost:3010/api/verify-email?token=${token} target="_blank">Verify Email</a>`, // html body
  });
}

module.exports = sendEmail;
