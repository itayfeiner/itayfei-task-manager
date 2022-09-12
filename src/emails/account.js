const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
sgMail.send({
    to: email,
    from: 'itayfeiner1@gmail.com',
    subject: 'Thanks for joining in',
    text: `Welcome to the app, ${name}. Let me know how you get along with the app.` // can be done only with backticks
    
})
}

const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'itayfeiner1@gmail.com',
        subject: 'Removal succesfully',
        text: `Hey ${name}, we'll be happy to know why you wanted to unregister from the app.` // can be done only with backticks
        
    })
    }

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}