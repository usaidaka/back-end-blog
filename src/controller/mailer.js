const nodemailer = require("nodemailer");

module.exports = {
  sendEmailForgotPassword({ recipient_email, OTP, link }) {
    return new Promise((resolve, reject) => {
      var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.MY_EMAIL,
          pass: process.env.MY_PASSWORD,
        },
      });

      const mail_configs = {
        from: process.env.MY_EMAIL,
        to: recipient_email,
        subject: "RECOVERY YOUR PASSWORD BY USING THIS OTP",
        html: `
<!DOCTYPE html>
<html lang="en" >
<head>
  <meta charset="UTF-8">
  <title>FORGOT PASSWORD</title>
</head>
<body>
<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
  <div style="margin:50px auto;width:70%;padding:20px 0">
    <div style="border-bottom:1px solid #eee">
      <a href="" style="font-size:1.4em;color: #02cc35;text-decoration:none;font-weight:600">Purwadhika</a>
    </div>
    <p style="font-size:1.1em">Hi,</p>
    <p>Use the following OTP to complete your Password Recovery Procedure. <span style="color:red">DO NOT LET PEOPLE KNOW YOUR OTP CODE !</span>. OTP is valid for 5 minutes</p>
    <h2 style="background: #02cc35;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${OTP}</h2>
    <a href=${link} style="background: #02cc35;margin: 0 auto;width: max-content;padding: 5px 10px;color: #fff;border-radius: 4px;text-decoration:none;">reset your password</a>
    <p style="font-size:0.9em;">Regards,<br />JCWD PURWADHIKA JAKARTA</p>
    <hr style="border:none;border-top:1px solid #eee" />
    <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
      <p>Purwadhika</p>
      <p>MSIG TOWER</p>
      <p>JC Web Development</p>
    </div>
  </div>
</div>
  
</body>
</html>`,
      };
      transporter.sendMail(mail_configs, function (error, info) {
        if (error) {
          console.log(error);
          return reject({ message: `An error has occured` });
        }
        return resolve({ message: "Email sent successfully" });
      });
    });
  },

  sendEmailRegister({ recipient_email, link }) {
    return new Promise((resolve, reject) => {
      var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.MY_EMAIL,
          pass: process.env.MY_PASSWORD,
        },
      });

      const mail_configs = {
        from: process.env.MY_EMAIL,
        to: recipient_email,
        subject: "VERIFY YOUR ACCOUNT",
        html: `
<!DOCTYPE html>
<html lang="en" >
<head>
  <meta charset="UTF-8">
  <title>FORGOT PASSWORD</title>
</head>
<body>
<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
  <div style="margin:50px auto;width:70%;padding:20px 0">
    <div style="border-bottom:1px solid #eee">
      <a href="" style="font-size:1.4em;color: #02cc35;text-decoration:none;font-weight:600">Purwadhika</a>
    </div>
    <p style="font-size:1.1em">Hi,</p>
    <p>Congratulation, welcome to our blog community. verify your account for the wide relation with another author!</p>
    <a href=${link} style="background: #02cc35;margin: 0 auto;width: max-content;padding: 5px 10px;color: #fff;border-radius: 4px;text-decoration:none;">verify your account</a>
    <p style="font-size:0.9em;">Regards,<br />JCWD PURWADHIKA JAKARTA</p>
    <hr style="border:none;border-top:1px solid #eee" />
    <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
      <p>Purwadhika</p>
      <p>MSIG TOWER</p>
      <p>JC Web Development</p>
    </div>
  </div>
</div>
  
</body>
</html>`,
      };
      transporter.sendMail(mail_configs, function (error, info) {
        if (error) {
          console.log(error);
          return reject({ message: `An error has occured` });
        }
        return resolve({ message: "Email sent succesfuly" });
      });
    });
  },
};
