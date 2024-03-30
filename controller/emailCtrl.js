const expressAsyncHandler = require('express-async-handler')
const nodemailer =  require('nodemailer')

const sendaMail = expressAsyncHandler(
    //using data we can send to, subject, body like this 
    //note we need to pass the data according to the symentics if not passed will not work
    async(data, req, res)=>{
        const transporter = nodemailer.createTransport({
            //we are using gmail
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // Use `true` for port 465, `false` for all other ports
            auth: {
              user: process.env.MAIL_ID,
              pass: process.env.MPASS,
            },
        });

        const info = await transporter.sendMail({
            from: '"Maddison Foo Koch 👻" <maddison53@ethereal.email>', // sender address
            to: data.to, // list of receivers
            subject: data.subject, // Subject line
            text: data.text, // plain text body
            html: data.htm, // html body
        });
        console.log("Message sent: %s", info.messageId);
    }
)

module.exports = {sendaMail}