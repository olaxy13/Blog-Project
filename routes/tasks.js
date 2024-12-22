const express = require('express');
const Task = require('../models/Task');
const router = express.Router();
const isAuthenticated = require('../middleware/auth'); // Custom middleware to check user session
const taskController = require("../controllers/task") ;

// GET tasks
router.get('/', isAuthenticated, taskController.getAllTask);

// POST task (add)
 router.post('/add', isAuthenticated, taskController.createTask);

// PUT task (mark as completed)
router.put('/:id/complete', isAuthenticated, taskController.updateTaskStatus);

// DELETE task
router.delete('/:id/delete', isAuthenticated, taskController.deleteTask);



module.exports = router;
