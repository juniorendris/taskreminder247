const nodemailer=require('nodemailer');
const transport = nodemailer.createTransport({
    service:'gmail',
    auth:{user:process.env.email_user,
    pass:process.env.password_app
    }
    
});
console.log("EMAIL:", process.env.email_user);
console.log("PASS EXISTS:", !!process.env.password_app);
async function sendEmail(to, subject, message) {
  try {
    await transport.sendMail({
      from: process.env.email_user,
      to:to,
      subject:subject,
      text: message
    });

    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("Email error:", error.message);
  }
}

module.exports=sendEmail;