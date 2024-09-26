import express from "express";
import cors from "cors";
import http from "http";
import authRoutes from "./routes/authRoutes.js";
import {env} from "./config/env.js";
import session from "express-session";
import flash from "connect-flash";
import passport from "passport";
import teamDataRoutes from "./routes/teamDataRoutes.js";
import memberDataRoutes from "./routes/memberDataRoutes.js";
import RedisStore from "connect-redis";
import redisClient from "./config/redis.js";
import {conditionalJson} from "./middleware/conditionalJson.js";

const app = express();

const corsOptions={
    // Disable COR origin during testing
    // origin: env.corsOrigin,
    // credentials: true, // Allows sending Cookies for authentication
    optionsSuccessStatus: 200 // avoid 204 choke.
};

app.use(cors(corsOptions));
app.use(conditionalJson); // express.json is used if expecting json, otherwise not.

app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: env.passportSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 30 * (24 * 60 * 60 * 1000), // 30 day expiry
        secure: false, // Not secure because of Cloudflare Flexible SSL, security should be enabled for most users.
        httpOnly: true,
        sameSite: 'None', // Allow CORs
    }
}));

// Initialize passport and connect-flash middleware
app.use(passport.initialize()); // Initialize passport
app.use(passport.session()); // Persistent login sessions
app.use(flash()); // Add connect-flash middleware

app.use("/api/auth", authRoutes);
app.use("/api/team", teamDataRoutes);
app.use("/api/member", memberDataRoutes);

// Server config
const server = http.createServer(app);

// Activate server
server.listen(env.port, ()=>{
    console.log(`Server is running on port ${env.port}`);
});