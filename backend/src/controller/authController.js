import passport from '../config/passport.js';

/**
 * Controller for handling user login.
 * Uses the 'login' strategy defined in Passport.js.
 */
export const loginController = passport.authenticate('login', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true // Optionally, enable flash messages
});

/**
 * Controller for handling user signup (registration).
 * Uses the 'signup' strategy defined in Passport.js.
 */
export const signupController = passport.authenticate('signup', {
    successRedirect: '/',
    failureRedirect: '/signup',
    failureFlash: true // Optionally, enable flash messages
});
