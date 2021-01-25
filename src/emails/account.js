const sendGrid = require('@sendgrid/mail')

sendGrid.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email,name)=>{
    sendGrid.send({
        to : email,
        from : 'adorablesmileee@gmail.com',
        subject : 'Welcome to the my application.',
        text:`Thanks ${name} for joining out application, i hope you getting alone with it!`
    })
}

const sendGoodByeEmail = (email,name)=>{
    sendGrid.send({
        to : email,
        from : 'adorablesmileee@gmail.com',
        subject : 'Sad to see you leave our application!',
        text:`Thanks ${name} for joining out application, here is a survay for you to tell us about your experience using our app!`
    })
}

module.exports={
    sendWelcomeEmail,
    sendGoodByeEmail
}

