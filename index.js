// index.js - Enhanced server configuration
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
    "https://a5--cs5610-kambaz-react-web-app.netlify.app",
    "http://localhost:5173"
];

const CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING || "mongodb+srv://chmukesh1612:da784o3MaRqo7kQD@kambaz-cluster.ztmdudn.mongodb.net/kambaz?retryWrites=true&w=majority&appName=kambaz-cluster";

mongoose.connect(CONNECTION_STRING)
    .then(() => {
        console.log("✅ MongoDB connected successfully");
    })
    .catch((error) => {
        console.error("❌ MongoDB connection failed:", error);
        process.exit(1);
    });

const app = express();

app.use(
    cors({
        credentials: true,
        origin: function (origin, callback) {
            console.log("CORS request from origin:", origin);
            if (!origin) return callback(null, true);
            
            const url = new URL(origin);
            const domain = url.hostname;
            
            if (
                allowedOrigins.includes(origin) ||
                domain.endsWith(".netlify.app") ||
                domain === "localhost" ||
                domain === "127.0.0.1"
            ) {
                console.log("✅ CORS allowed for origin:", origin);
                callback(null, true);
            } else {
                console.error("❌ CORS blocked for origin:", origin);
                callback(new Error(`CORS: Not allowed by CORS for origin ${origin}`));
            }
        },
    })
);

const sessionOptions = {
    secret: process.env.SESSION_SECRET || "kambaz",
    resave: false,
    saveUninitialized: false,
    name: "kambaz-session",
};

if (process.env.NODE_ENV !== "development") {
    sessionOptions.proxy = true;
    sessionOptions.cookie = {
        sameSite: "none",
        secure: true
    };
}

app.use(session(sessionOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    if (req.method === 'POST' || req.method === 'PUT') {
        console.log("Request body:", JSON.stringify(req.body, null, 2));
    }
    next();
});

UserRoutes(app);
CourseRoutes(app);
ModuleRoutes(app);
AssignmentRoutes(app);
Lab5(app);
Hello(app);

app.use((error, req, res, next) => {
    console.error("Global error handler:", error);
    res.status(500).json({
        message: "Internal server error",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
});

app.get("/health", (req, res) => {
    res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}`);
});