const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const bodyParser = require('body-parser');

const app = express();

// MongoDB Connection
mongoose.connect('mongodb+srv://olaxy:olamide.13@cluster0.8fwdo.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'secretkey', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// Routes (example for tasks)
const taskRoutes = require('./routes/tasks');
app.use('/tasks', taskRoutes);

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
  next()
});

app.listen(3000, () => console.log('Server running on port 3000'));
