const express = require('express');

const session = require('express-session');
const passport = require('passport');
const bodyParser = require('body-parser');


const app = express();


// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'secretkey', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());

// Routes (users)
const userRoutes = require('./routes/user');
app.use('/user', userRoutes);

// Routes (blogs)
const blogRoutes = require('./routes/blog');

app.use('/blogs', blogRoutes);

// Error Handling
app.use((err, req, res, next) => {

  console.error(err.stack);

  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Invalid ${err.path}: ${err.value}` });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token.' });
  }


  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token has expired.' });
  }

  console.log("Error FROM SERVER:",err);
  res.status(500).json({message: "Something went wrong from the server."});
  next()
});

module.exports = app;

// app.listen(3000, () => console.log('Server running on port 3000'));


