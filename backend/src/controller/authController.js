import passport from '../config/passport.js';

/**
 * Middleware to handle dynamic redirect URLs for login.
 */
export const loginController = (req, res, next) => {
    const successRedirect = req.query.successRedirect || '/';
    const failureRedirect = req.query.failureRedirect || '/login';

    passport.authenticate('login', {
        successRedirect,
        failureRedirect,
        failureFlash: true
    })(req, res, next);
};

/**
 * Middleware to handle dynamic redirect URLs for signup.
 */
export const signupController = (req, res, next) => {
    const successRedirect = req.query.successRedirect || '/';
    const failureRedirect = req.query.failureRedirect || '/signup';

    passport.authenticate('signup', {
        successRedirect,
        failureRedirect,
        failureFlash: true
    })(req, res, next);
};

// Middleware to check if the user is authenticated, use for requests where authentication is required and no need to use where not required.
export function isAuthenticatedUserMiddleware(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: 'Unauthorized' });
}

// Function to check if user is authenticated
export function isAuthenticatedUser(req, res, next) {
    return req.isAuthenticated();
}