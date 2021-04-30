const sgMail = require('@sendgrid/mail')
const ADMIN_EMAIL = 'riyandhiman10@gmail.com'


const sendEmail = async function (to, subject, htmlContent,) {
  // Send the email
  // https://github.com/sendgrid/sendgrid-nodejs
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  const msg = {
    to: to,
    from: ADMIN_EMAIL,
    subject: subject,
    html: htmlContent
  }
  let res = await sgMail.send(msg)
  return res
}

module.exports = sendEmail