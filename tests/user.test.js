const request = require('supertest')
const app = request('../src/app')

test('Should sign up a new user', async () => {
    await request(app).post('/users').send({
        name:'mokte',
        email:'motke@gmail.com',
        password:'MyPass77ssssss7!'
    }).expect(201)
})

