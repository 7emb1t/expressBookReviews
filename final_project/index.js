const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req, res, next) {
    // Check whether a session with an authorization object exists for this user
    if (req.session.authorization) {
        // Retrieve the access token saved in the session at login time
        const token = req.session.authorization['accessToken'];

        // Verify the JWT access token against the secret used when signing it
        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                // Save the decoded user data so the routes can identify the caller
                req.user = user;
                next(); // proceed to the protected route
            } else {
                return res.status(403).json({ message: "User not authenticated" });
            }
        });
    } else {
        return res.status(403).json({ message: "User not logged in" });
    }
});
 
const PORT = process.env.PORT || 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running on port " + PORT));
