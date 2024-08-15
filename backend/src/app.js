import express from "express";
import cors from "cors";
import http from "http";
import authRoutes from "./routes/authRoutes.js";
import {env} from "./config/env.js";
import session from "express-session";
import flash from "connect-flash";
import passport from "passport"; // Import connect-flash for flash messages

const app = express();

const corsOptions={
    // Disable COR origin during testing
    // origin: env.corsOrigin,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions)); // Use cors in express app with the cors configuration.
app.use(express.json()); // Parse json as middleware (performance improvements, prevents misc. injections)

// Session setup (required for `connect-flash` to work)
app.use(session({
    secret: env.passportSecret,
    resave: false,
    saveUninitialized: false
}));

// Initialize passport and connect-flash middleware
app.use(passport.initialize()); // Initialize passport
app.use(passport.session()); // Persistent login sessions
app.use(flash()); // Add connect-flash middleware

app.use("/api/auth", authRoutes);

// Server config
const server = http.createServer(app);

// Activate server
server.listen(env.port, ()=>{
    console.log(`Server is running on port ${env.port}`);
});