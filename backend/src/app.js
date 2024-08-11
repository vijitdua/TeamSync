import express from "express";
import cors from "cors";
import http from "http";
import authRoutes from "./routes/authRoutes.js";
import {env} from "./config/env.js";

const app = express();

const corsOptions={
    origin: env.corsOrigin,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions)); // Use cors in express app with the cors configuration.
app.use(express.json()); // Parse json as middleware (performance improvements, prevents misc. injections)

app.use("/api/auth", authRoutes);

// Server config
const server = http.createServer(app);

// Activate server
server.listen(env.port, ()=>{
    console.log(`Server is running on port ${env.port}`);
});