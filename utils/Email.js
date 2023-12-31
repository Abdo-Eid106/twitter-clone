const nodemailer = require('nodemailer');

module.exports = class Email {
  constructor(reciever) {
    this.senderEmail = process.env.email;
    this.reciever = reciever;
    this.transporter = this.createTransport();
  }

  createTransport() {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.senderEmail,
        pass: process.env.password
      }
    });
  }

  async sendEmail(subject, message) {
    const mailOptions = {
      from: this.senderEmail,
      to: this.reciever.email, 
      subject, 
      text: message
    };
    await this.transporter.sendMail(mailOptions);
  }

  async welcome() {
    const message = `welcome ${this.reciever.username}`;
    await this.sendEmail('Welcome', message);
  }
}