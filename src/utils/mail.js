import nodemailer from "nodemailer";
import Mailgen from "mailgen";
const sendEmail = async (options) => {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Task Manager",
      link: "https:taskmanagement.com",
    },
  });

  const emailText = mailGenerator.generatePlaintext(options.mailGenContent);
  const emailHTML = mailGenerator.generate(options.mailGenContent);

  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_TRAP_SMTP_HOST,
    port: MAIL_TRAP_SMTP_PORT,
    auth: {
      user: process.env.MAIL_TRAP_SMTP_USER,
      pass: MAIL_TRAP_SMTP_PASS,
    },
  });

  const mail = {
    from: "mail.taskmanager@example.com",
    to: options.email,
    subject: options.subject,
    text: emailText,
    html: emailHTML,
  };

  try {
    await transporter.sendMail(mail);
  } catch (error) {
    console.error("Email service failed");
  }
};

function emailVerificationMailGenerator(username, verificationUrl) {
  return {
    body: {
      name: username,
      intro: "Welcome to our App!",
      action: {
        instructions: "Verify your email.",
        button: {
          color: "#22BC66",
          text: "confirm your account",
          link: verificationUrl,
        },
      },
      outro: "Need help, contact our support team.",
    },
  };
}

function forgotPasswordMailGen(username, passwordResetUrl) {
  return {
    body: {
      name: username,
      intro: "We got a request to reset the password if your account",
      action: {
        instructions: "Click the button to change your password",
        button: {
          color: "#22BC66",
          text: "click here",
          link: passwordResetUrl,
        },
      },
      outro: "Need help, contact our support team.",
    },
  };
}

export { emailVerificationMailGenerator, forgotPasswordMailGen, sendEmail };
