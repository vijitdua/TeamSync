import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import {authUserModel} from '../models/authUserModel.js';
import { verifyLoginCredentials, registerNewUser } from '../services/authService.js';

/**
 * Local strategy for handling user login.
 * Uses the `verifyLoginCredentials` service function to authenticate users.
 */
passport.use('login', new LocalStrategy(
    async function (username, password, done) {
        try {
            const { success, user, message } = await verifyLoginCredentials(username, password);
            if (!success) {
                return done(null, false, { message });
            }

            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));

/**
 * Local strategy for handling user signup (registration).
 * Uses the `registerNewUser` service function to register new users.
 */
passport.use('signup', new LocalStrategy(
    async function (username, password, done) {
        try {
            // external API user registration is disabled, uncomment the following and comment the subsequent line to enable external registration
            // const {success, user, message} = await registerNewUser(username, password);
            const { success, user, message } = {success: false, message: 'User registration is disabled'};
            if (!success) {
                return done(null, false, { message });
            }

            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));

/**
 * Serializes the user object to store in the session.
 */
passport.serializeUser((user, done) => {
    done(null, user.id);
});

/**
 * Deserializes the user object from the session by its ID.
 */
passport.deserializeUser(async (userId, done) => {
    try {
        const userRecord = await authUserModel.findByPk(userId);
        done(null, userRecord);
    } catch (err) {
        done(err);
    }
});

export default passport;