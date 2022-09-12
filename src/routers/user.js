const express = require('express')
const mongoose = require('mongoose')
const { Mongoose } = require('mongoose')
const router =  new express.Router()
const sharp = require('sharp')
const User = require('../models/user')
const auth = require('../middleware/auth')
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account')

const multer = require('multer')
const upload = multer({
    //dest: 'avatar',     // --> saves the picture in a nested folder called avatar
    limits: {
        fileSize: 1000000 //file size in bytes 
    },
    fileFilter(req, file, cb) {       // 1) contain the request being made, 2)information about the file being uploaded, 3)tell multer when were done filtering the file
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('file must be a photo '))
        }
        
        cb(undefined, true)
    }
})


router.get('/users/me', auth ,async (req,res) => {

    try {
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/users/:id', async (req,res) => {
    const _id = req.params.id //gets the dynamic input that we entered
    try {
        const user = await User.findById(_id)
        if(!user){
            return res.status(404).send()
        }
        res.send(user)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.post('/users', async (req, res) =>{
    const email = req.body.email
    const users = await User.find({})
    var isExist = false

    users.forEach(user => {
        if(user.email === email) {isExist = true }})

    if(isExist){
        return res.status(500).send('Email already exists')
    }
    const user = new User(req.body)
    const token = await user.generateAuthToken()

    try{
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        res.status(201).send({user,token}   )
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/login', async (req,res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})
    } catch (e) {
        res.status(400).send("Username or password are incorrect")
    }
})

router.post('/users/logout', auth, async (req,res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req,res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/users/me', auth, async (req,res) => {
    const updates = Object.keys(req.body) //takes a JSON object and create an array whose values are the keys
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation) {
        return res.status(400).send({error: 'Wrong input'})
    }
    try {
        
        const user = req.user
        updates.forEach((update) => { user[update] = req.body[update] })
        await user.save()
        if (!user) {
            return res.status(404).send()
        }
        res.send(user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth, async (req,res) => {
    try {
       
        await req.user.remove()
        sendCancelationEmail(req.user.email, req.user.name)
        res.send(req.user)

        } catch (e) {
         res.status(500).send(e)
     }
    })


router.post('/users/me/avatar', auth, upload.single('avatar'), async (req,res) => {
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: 'Please uplaod a picture file'})
})

router.delete('/users/me/avatar', auth, async (req,res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: 'Please uplaod a picture file'})
})

router.get('/users/:id/avatar', async (req,res) => {
    try {
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar){
            throw new Error() // jumps to catch
        }
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send('An error occurd')
    }
})

module.exports = router