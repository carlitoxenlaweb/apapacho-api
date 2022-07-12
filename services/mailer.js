const nodemailer = require("nodemailer")

const masterEmail = "soporte@apapachoamigo.com"
const transporter = nodemailer.createTransport({
  host: "apapachoamigo.com",
  secure: true,
  port: 465,
  debug: false,
  auth: {
    user: masterEmail,
    pass: "1}l4V?nBERtk",
  },
})

const sendMail = (email, mailOptions) => {
  return new Promise((resolve, reject) => {
    transporter.sendMail(
      {
        ...mailOptions,
        from: masterEmail,
        to: email,
      },
      (err, info) => {
        if (err) {
          console.log("Mailer err: ", err)
          reject(err)
        } else {
          resolve(info)
        }
      }
    )
  })
}

module.exports = {
  sendActivationEmail: async (email, data) =>
    await sendMail(email, {
      subject: "Verify account",
      text: `Please verify your account with the token: ${data.token}`,
      html: `Please verify your account with the token: <b>${data.token}</b>`,
    }),

  sendRecoverEmail: async (email, data) =>
    await sendMail(email, {
      subject: "Reset password",
      text: `Use this token to reset your password: ${data.token}`,
      html: `Use this token to reset your password: <b>${data.token}</b>`,
    }),
    
  sendWelcomeEmail: async (email, data) =>
    await sendMail(email, {
      subject: "Bienvenido",
      text: `Gracias por registrate con nosotros`,
      html: `Gracias por registrate con nosotros`,
    }),
}
