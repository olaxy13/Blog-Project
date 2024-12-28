const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

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
  console.log("Error FROM SERVER:",err);
  res.status(500).json({error: err.message});
  //next()
});

app.listen(3000, () => console.log('Server running on port 3000'));
