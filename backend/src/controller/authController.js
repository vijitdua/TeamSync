import passport from '../config/passport.js';

/**
 * Middleware to handle dynamic redirect URLs for login.
 */
export function loginController(req, res, next){
    passport.authenticate('login', (err, user, info) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'An error occurred during login.', error: err });
        }
        if (!user) {
            return res.status(401).json({ success: false, message: info.message || 'Login failed.' });
        }
        // Log in the user manually
        req.login(user, (loginErr) => {
            if (loginErr) {
                return res.status(500).json({ success: false, message: 'Login failed after authentication.', error: loginErr });
            }
            // If login is successful, send the cookie and a success response
            return res.status(200).json({ success: true});
        });
    })(req, res, next);
}

/**
 * Middleware to handle dynamic redirect URLs for signup.
 */
export const signupController = (req, res, next) => {
    passport.authenticate('signup', (err, user, info) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'An error occurred during signup.', error: err });
        }
        if (!user) {
            return res.status(401).json({ success: false, message: info.message || 'Signup failed.' });
        }
        // Log in the user manually after signup
        req.login(user, (loginErr) => {
            if (loginErr) {
                return res.status(500).json({ success: false, message: 'Signup successful, but login failed.', error: loginErr });
            }
            // Success, send user data and set cookie
            return res.status(200).json({ success: true});
        });
    })(req, res, next);
};

// Middleware to check if the user is authenticated, use for requests where authentication is required and no need to use where not required.
export function isAuthenticatedUserMiddleware(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({success: false, message: 'Unauthorized' });
}

// Function to check if user is authenticated
export function isAuthenticatedUser(req) {
    return req.isAuthenticated();
}

// Function to check if user is authenticated
export function isAuthenticatedController(req, res) {
    if (req.isAuthenticated()) {
        return res.status(200).json({ auth: true });
    }
    return res.status(401).json({ auth: false, message: 'Unauthorized' });
}
