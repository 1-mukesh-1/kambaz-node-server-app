import express from 'express'
import Hello from "./Hello.js"
import Lab5 from "./Lab5/index.js";
import cors from "cors";
import "dotenv/config";
import session from "express-session";
import UserRoutes from "./Kambaz/Users/routes.js";
import CourseRoutes from "./Kambaz/Courses/routes.js";
import ModuleRoutes from "./Kambaz/Modules/routes.js";
import AssignmentRoutes from './Kambaz/Assignments/routes.js';
import mongoose from "mongoose";

const allowedOrigins = [
    process.env.NETLIFY_URL,
];

const CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING || "mongodb+srv://chmukesh1612:da784o3MaRqo7kQD@kambaz-cluster.ztmdudn.mongodb.net/kambaz?retryWrites=true&w=majority&appName=kambaz-cluster"
mongoose.connect(CONNECTION_STRING);

const app = express()
app.use(
    cors({
        credentials: true,
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);
            const url = new URL(origin);
            const domain = url.hostname;
            if (
                allowedOrigins.includes(origin) ||
                domain.endsWith(".netlify.app")
            ) {
                callback(null, true);
            } else {
                callback(new Error(`CORS: Not allowed by CORS for origin ${origin}`));
            }
        },
    }));
const sessionOptions = {
    secret: process.env.SESSION_SECRET || "kambaz",
    resave: false,
    saveUninitialized: false,
};
if (process.env.NODE_ENV !== "development") {
    sessionOptions.proxy = true;
    sessionOptions.cookie = {
        sameSite: "none",
        secure: true
    };
}
app.use(session(sessionOptions));
app.use(express.json());

UserRoutes(app);
CourseRoutes(app);
ModuleRoutes(app);
AssignmentRoutes(app);
Lab5(app)
Hello(app)
app.listen(process.env.PORT || 4000)