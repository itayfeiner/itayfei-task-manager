const express = require('express')
const router =  new express.Router()
const Task = require('../models/task')
const auth = require('../middleware/auth')


// GET /tasks?completed=true
// GET /tasks?limit=10&skip=10   --> limit = 10 views per page, skip = how many views to skip
// GET /tasks?  sortBy=createdAt:asc (or desc)  --> specifing a field and an order
router.get('/tasks', auth, async (req,res) => {
    const match = {}
    const sort = {}
    if (req.query.completed){
        match.completed = req.query.completed === 'true'
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':') // splits the string by a character
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1  // short for an if statement
    }
try{
    //const tasks = await Task.find({owner: req.user._id})
    
    
    await req.user.populate({
        path: 'tasks',
        match,
        options: {
            limit: parseInt(req.query.limit),  //turns a string into an integer
            skip: parseInt(req.query.skip),
            sort
        }
    }).execPopulate()
    res.send(req.user.tasks)
} catch (e) {
    res.status(500).send(e)
    }
})

router.get('/tasks/:id', auth, async (req,res) => {
    const _id = req.params.id //gets the dynamic input that we entered
    console.log(_id)
    
try {
    
    const tasks = await Task.findOne({ _id, owner: req.user._id })
    await tasks.populate('tasks').execPopulate()
    console.log(tasks)
    if(!tasks){
        return res.status(404).send()
    }
    res.send(tasks)
} catch (e) {
    res.status(500).send(e)
    }
})



router.post('/tasks', auth, async (req, res) =>{
    const task = new Task ({
    ...req.body, // inherits all task properties (description and completed)
    owner: req.user._id

})

try {
    await task.save()
    res.status(201).send(task)
} catch (e) {
    res.status(400).send(e)
    }
})


router.patch('/tasks/:id', auth, async (req,res) => {
const updates = Object.keys(req.body) //takes a JSON object and create an array whose values are the keys
const allowedUpdates = ['description', 'completed']
const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    
if(!isValidOperation) {
    return res.status(400).send({error: 'Wrong input'})
}
try {
    const task = await Task.findOne({_id: req.params.id, owner: req.user._id})
    
    if (!task) {
       return res.status(404).send()
    }
    updates.forEach ((update) => { task[update] = req.body[update] })
    await task.save()

    res.send(task)
}   catch (e) {
    res.status(400).send(e)
    }
})
   

router.delete('/tasks/:id', auth, async (req,res) => {

    try {
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id})
        if(!task){
            return res.status(404).send({error: 'Task does not exist'})    
        }
        res.send(task)
    
        } catch (e) {
            res.status(500).send(e)
        }
})
  
module.exports = router