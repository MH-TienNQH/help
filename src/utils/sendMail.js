import { createTransport } from "nodemailer";
import { config } from "dotenv";

config();

export const sendMailTo = (to, subject, content) => {
  const transporter = createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "nguyentien100333@gmail.com",
      pass: "plronafpklfwqeqp",
    },
    authentication: "plain",
  });
  const info = {
    from: process.env.MAIL_FROM_ADDRESS,
    to: to,
    subject: subject,
    html: content,
  };
  return transporter.sendMail(info);
};
