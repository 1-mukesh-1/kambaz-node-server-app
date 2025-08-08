import * as dao from "./dao.js";
import * as courseDao from "../Courses/dao.js";
import * as enrollmentsDao from "../Enrollments/dao.js";

export default function UserRoutes(app) {
    const createUser = (req, res) => {
        const newUser = dao.createUser(req.body);
        res.json(newUser);
    };
    const deleteUser = (req, res) => { };
    const findAllUsers = (req, res) => { };
    const findUserById = (req, res) => { };
    const updateUser = (req, res) => {
        const userId = req.params.userId;
        const userUpdates = req.body;
        dao.updateUser(userId, userUpdates);
        const currentUser = dao.findUserById(userId);
        req.session["currentUser"] = currentUser;
        res.json(currentUser);
    };
    const signup = (req, res) => {
        const user = dao.findUserByUsername(req.body.username);
        if (user) {
            res.status(400).json({ message: "Username already taken" });
            return;
        }
        const currentUser = dao.createUser(req.body);
        req.session["currentUser"] = currentUser;
        res.json(currentUser);
    };
    const signin = (req, res) => {
        const { username, password } = req.body;
        const currentUser = dao.findUserByCredentials(username, password);
        if (currentUser) {
            req.session["currentUser"] = currentUser;
            res.json(currentUser);
        } else {
            res.status(401).json({ message: "Unable to login. Try again later." });
        }
    };
    const signout = (req, res) => {
        req.session.destroy();
        res.sendStatus(200);
    };
    const profile = (req, res) => {
        const currentUser = req.session["currentUser"];
        if (!currentUser) {
            res.sendStatus(401);
            return;
        }
        res.json(currentUser);
    };
    const findCoursesForEnrolledUser = (req, res) => {
        let { userId } = req.params;
        if (userId === "current") {
            const currentUser = req.session["currentUser"];
            if (!currentUser) {
                res.sendStatus(401);
                return;
            }
            userId = currentUser._id;
        }
        const courses = courseDao.findCoursesForEnrolledUser(userId);
        res.json(courses);
    };
    const createCourse = (req, res) => {
        const currentUser = req.session["currentUser"];
        const newCourse = courseDao.createCourse(req.body);
        enrollmentsDao.enrollUserInCourse(currentUser._id, newCourse._id);
        res.json(newCourse);
    };
    const enrollUserInCourse = (req, res) => {
        const currentUser = req.session["currentUser"];
        const { courseId } = req.params;
        if (!currentUser) {
            return res.sendStatus(401);
        }
        enrollmentsDao.enrollUserInCourse(currentUser._id, courseId);
        res.sendStatus(200);
    };

    const unenrollUserFromCourse = (req, res) => {
        try {
            const currentUser = req.session["currentUser"];
            const { courseId, userId } = req.params;
            
            console.log("Unenroll request - currentUser:", currentUser?._id, "userId:", userId, "courseId:", courseId);
            
            if (!currentUser) {
                console.log("No current user in session");
                return res.sendStatus(401);
            }
            
            if (currentUser._id !== userId && currentUser.role !== "FACULTY") {
                console.log("Unauthorized unenroll attempt");
                return res.sendStatus(401);
            }
            
            enrollmentsDao.unenrollUserFromCourse(userId, courseId);
            console.log("Successfully unenrolled user", userId, "from course", courseId);
            res.sendStatus(200);
        } catch (error) {
            console.error("Error in unenrollUserFromCourse:", error);
            res.status(500).json({ message: "Failed to unenroll user" });
        }
    };

    app.post("/api/users/:userId/courses/:courseId/enroll", enrollUserInCourse);
    app.delete("/api/users/:userId/courses/:courseId/unenroll", unenrollUserFromCourse);
    app.post("/api/users/current/courses", createCourse);
    app.get("/api/users/:userId/courses", findCoursesForEnrolledUser);
    app.post("/api/users", createUser);
    app.get("/api/users", findAllUsers);
    app.get("/api/users/:userId", findUserById);
    app.put("/api/users/:userId", updateUser);
    app.delete("/api/users/:userId", deleteUser);
    app.post("/api/users/signup", signup);
    app.post("/api/users/signin", signin);
    app.post("/api/users/signout", signout);
    app.post("/api/users/profile", profile);
}