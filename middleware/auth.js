const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY ;

const = isAuthenticated(req, res, next) => {
    const token = req.cookies?.authToken || req.headers['authorization']?.split(' ')[1];
    console.log('Cookies:', req.cookies);

     if (!token) {
        console.log('Token not found, Redirecting to login.');
        return res.status(401).json({ message: 'Unauthorized access' });
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY); // Verify the token
        req.user = decoded; // Attach the decoded user info to the request
        next();
    } catch (error) {
      console.log('Token Error.', error.message);
    return res.redirect('/login'); // Redirect if token is invalid
        res.status(401).json({ message: 'Invalid or expired token' });
    }
}

module.exports = isAuthenticated;
