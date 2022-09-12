const express = require('express')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')
const User = require('./models/user')
require('./db/mongoose') // makes sure that the file mongoose.js runs and connect to the server

const app = express()
const port = process.env.PORT
app.use(express.json()) // automatically parse incoming json to an object
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})
