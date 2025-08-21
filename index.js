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
import QuizRoutes from './Kambaz/Quizzes/routes.js';
import mongoose from "mongoose";

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173', 
    'http://localhost:4173',
    process.env.NETLIFY_URL
].filter(Boolean);

console.log("Allowed origins:", allowedOrigins);
console.log("NODE_ENV:", process.env.NODE_ENV);

const CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING || "mongodb+srv://chmukesh1612:da784o3MaRqo7kQD@kambaz-cluster.ztmdudn.mongodb.net/kambaz?retryWrites=true&w=majority&appName=kambaz-cluster"
mongoose.connect(CONNECTION_STRING);

const app = express()

app.use(cors({
    credentials: true,
    origin: function (origin, callback) {
        console.log("CORS request from origin:", origin);
        
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        
        try {
            const url = new URL(origin);
            if (url.hostname.endsWith('.netlify.app')) {
                return callback(null, true);
            }
        } catch (e) {
            console.error("Invalid origin URL:", origin);
        }
        
        if (process.env.NODE_ENV === 'development') {
            return callback(null, true);
        }
        
        console.error(`CORS: Origin ${origin} not allowed`);
        callback(new Error(`CORS: Not allowed by CORS for origin ${origin}`));
    },
}));

const sessionOptions = {
    secret: process.env.SESSION_SECRET || "kambaz",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
    }
};

if (process.env.NODE_ENV === "production") {
    console.log("Setting up production session cookies");
    sessionOptions.proxy = true;
    sessionOptions.cookie.sameSite = "none";
    sessionOptions.cookie.secure = true;
} else {
    console.log("Setting up development session cookies");
    sessionOptions.cookie.sameSite = "lax";
    sessionOptions.cookie.secure = false;
}

console.log("Session options:", sessionOptions);

app.use(session(sessionOptions));
app.use(express.json());

UserRoutes(app);
CourseRoutes(app);
ModuleRoutes(app);
AssignmentRoutes(app);
QuizRoutes(app);
Lab5(app)
Hello(app)

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});