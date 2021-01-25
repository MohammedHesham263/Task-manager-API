const express = require('express')
require('./db/mongoose')
const userRouters = require('./routers/users')
const taskRouters = require('./routers/tasks')

const app = express()

const PORT = process.env.PORT

app.use(express.json())
app.use(userRouters)
app.use(taskRouters)

app.listen(PORT , ()=>{
    console.log('server is up on port'+PORT)
})
