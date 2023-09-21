const nodemailer = require('nodemailer');
const dotenv = require("dotenv");

dotenv.config();

exports.sendMail = async ({ to, subject, text }) => {
    try {
        let config = {
            host:"mail.privateemail.com",
            port:465,
            secure:true,
            auth: {
                user: process.env.EMAILADDRESS,
                pass: process.env.EMAILPASSWORD
            }
        }
        console.log(config)
        const transporter = await nodemailer.createTransport(config);
        const info = await transporter.sendMail({to, subject, text, from: process.env.EMAILADDRESS});
        return info
    } catch (err) {
        return err;
    }
}