const app = require('./app.js')
const User = require('./models/user')
const port = process.env.PORT
require('./db/mongoose') // makes sure that the file mongoose.js runs and connect to the server


app.listen(port, () => {
    console.log('Server is up on port ' + port)
})
