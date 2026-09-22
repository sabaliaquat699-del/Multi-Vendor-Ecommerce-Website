import nodemailer from "nodemailer";

// ======================================================
// SEND EMAIL
// ======================================================

const sendEmail = async ({
  to,
  subject,
  html,
}) => {
  try {
    // ==================================================
    // CHECK EMAIL ENVIRONMENT VARIABLES
    // ==================================================

    if (
      !process.env.EMAIL_USER
    ) {
      throw new Error(
        "EMAIL_USER is missing in .env"
      );
    }

    if (
      !process.env.EMAIL_PASS
    ) {
      throw new Error(
        "EMAIL_PASS is missing in .env"
      );
    }

    // ==================================================
    // SMTP PORT
    // ==================================================

    const port =
      Number(
        process.env.EMAIL_PORT
      ) || 465;

    // ==================================================
    // CREATE TRANSPORTER
    // ==================================================

    const transporter =
      nodemailer.createTransport({
        host:
          process.env.EMAIL_HOST ||
          "smtp.gmail.com",

        port,

        secure:
          port === 465,

        auth: {
          user:
            process.env.EMAIL_USER,

          pass:
            process.env.EMAIL_PASS,
        },
      });

    // ==================================================
    // VERIFY SMTP CONNECTION
    // ==================================================

    await transporter.verify();

    console.log(
      "================================="
    );

    console.log(
      "SMTP CONNECTION SUCCESSFUL"
    );

    console.log(
      "================================="
    );

    // ==================================================
    // SEND EMAIL
    // ==================================================

    const info =
      await transporter.sendMail({
        from:
          `"NextTech" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,

        to,

        subject,

        html,
      });

    console.log(
      "================================="
    );

    console.log(
      "EMAIL SENT SUCCESSFULLY"
    );

    console.log(
      "To:",
      to
    );

    console.log(
      "Message ID:",
      info.messageId
    );

    console.log(
      "================================="
    );

    return info;
  } catch (error) {
    console.error(
      "================================="
    );

    console.error(
      "EMAIL SENDING ERROR"
    );

    console.error(
      "================================="
    );

    console.error(
      "Message:",
      error.message
    );

    console.error(
      "Code:",
      error.code
    );

    console.error(
      "Command:",
      error.command
    );

    console.error(
      "Response:",
      error.response
    );

    console.error(
      "================================="
    );

    throw error;
  }
};

export default sendEmail;