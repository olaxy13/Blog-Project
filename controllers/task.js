    const Task = require("../models/Task");

    async function getAllTask(req, res, next) {
        try {
            const tasks = await Task.findAll({ userId: req.user._id });
            res.status(200).json(tasks)
        //const tasks = await Task.find({ userId: req.user._id });
        res.render('tasks', { tasks });
        } catch(error) {
            next(error)
        }
        }


    async function getTask(req, res, next) {
            try {
                //const tasks = await Task.findOne();
                
           const tasks = await Task.find(req.params.id, { userId: req.user._id });
            res.status(200).json(tasks)
            res.render('tasks', { tasks });
            } catch(error) {
                next(error)
            }
            }


    async function createTask(req, res, next) {
        let taskInfo = req.body;
        try{
        const task = await new Task.create({taskInfo, userId: req.user._id});
        await task.save();
        res.status(201).json(task);  
        res.redirect('/tasks');
        } catch(error) {
            next(error)
        }
    }

    async function updateTaskStatus(req, res, next) {
        try {
            const task = await Task.findByIdAndUpdate(req.params.id, {status: "completed"})
            res.redirect('/tasks');
            else {
                res.status(404).json({
                    message: 'Task not found'
                });
            }
        } catch (error) {
            next(error)
        }
    }

    async function deleteTask(req, res, next) {
        const task = await Task.findByIdAndDelete(req.params.id)
            res.status(201).json(task)
        res.redirect('/tasks');

    }
    
    // async function (req, res, next) {
    //     try {
    //         if(!req)
    //         const tasks = await Task.find({ userId: req.user._id });
    //         res.render('tasks', { tasks });
    //     }
    // }

    module.exports = {
        getAllTask,
        getTask
        createTask,
        getBookById,
        updateTaskStatus,
        deleteTask
    }