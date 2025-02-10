const nodemailer = require('nodemailer')
const ejs=require('ejs')
const htmlToText=require('html-to-text')
module.exports=class Email{
  constructor(user,url){
    this.to=user.email
    this.firstName=user.name.split(' ')[0]
    this.url=url
    this.from=`Moretza Ahmadi <${process.env.EMAIL_FROM}>`
  }
  newTransport(){
    if(process.env.NODE_ENV=='production'){
      return nodemailer.createTransport({
        service:'gmail',
        auth:{
          user:process.env.GMAIL_USER,
          pass:process.env.GMAIL_PASSWORD
        }
      })
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    })

  }
  async send(template,subject){
    const html=await ejs.renderFile(`${__dirname}/../views/emails/${template}.ejs`,{
      firstName:this.firstName,
      subject,
      url:this.url
    })
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text:htmlToText.htmlToText(html),
      html
    }
    await this.newTransport().sendMail(mailOptions)
  }
  async sendWelcome(){
    await this.send('welcome','Welcome to the Natours Family!')
  }
  async sendPasswordReset(){
    await this.send('passwordReset','Your reset Token(valid for 10 minutes)')
  }
}
