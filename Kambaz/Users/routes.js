import * as dao from "./dao.js";
import * as courseDao from "../Courses/dao.js";
import * as enrollmentsDao from "../Enrollments/dao.js";

export default function UserRoutes(app) {
    const createUser = async (req, res) => {
        const newUser = await dao.createUser(req.body);
        res.json(newUser);
    };
    const deleteUser = async (req, res) => {
        const status = await dao.deleteUser(req.params.userId);
        res.json(status);
    };
    const findAllUsers = async (req, res) => {
        const { role, name } = req.query;
        if (role) {
            const users = await dao.findUsersByRole(role);
            res.json(users);
            return;
        }
        if (name) {
            const users = await dao.findUsersByPartialName(name);
            res.json(users);
            return;
        }
        const users = await dao.findAllUsers();
        res.json(users);
    };
    const findUserById = async (req, res) => {
        const user = await dao.findUserById(req.params.userId);
        res.json(user);
    };
    const updateUser = async (req, res) => {
        const userId = req.params.userId;
        const userUpdates = req.body;
        await dao.updateUser(userId, userUpdates);
        const currentUser = req.session["currentUser"];
        if (currentUser && currentUser._id === userId) {
            req.session["currentUser"] = { ...currentUser, ...userUpdates };
        }
        res.json({ ...currentUser, ...userUpdates });
    };
    const signup = async (req, res) => {
        const user = await dao.findUserByUsername(req.body.username);
        if (user) {
            res.status(400).json({ message: "Username already taken" });
            return;
        }
        const currentUser = await dao.createUser(req.body);
        req.session["currentUser"] = currentUser;
        res.json(currentUser);
    };
    const signin = async (req, res) => {
        const { username, password } = req.body;
        const currentUser = await dao.findUserByCredentials(username, password);
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

    const findCoursesForUser = async (req, res) => {
        try {
            const { userId } = req.params;
            const courses = await enrollmentsDao.findCoursesForUser(userId);
            res.json(courses);
        } catch (error) {
            console.error("Error finding courses for user:", error);
            res.status(500).json({ message: error.message });
        }
    };

    const enrollUserInCourse = async (req, res) => {
        try {
            const { userId, courseId } = req.params;
            const enrollment = await enrollmentsDao.enrollUserInCourse(userId, courseId);
            res.status(201).json(enrollment);
        } catch (error) {
            console.error("Error enrolling user:", error);
            if (error.message.includes("already enrolled")) {
                res.status(409).json({ message: error.message });
            } else {
                res.status(500).json({ message: error.message });
            }
        }
    };

    const unenrollUserFromCourse = async (req, res) => {
        const { userId, courseId } = req.params;
        try {
            const status = await enrollmentsDao.unenrollUserFromCourse(userId, courseId);
            if (status.deletedCount === 0) {
                return res.status(404).json({ message: "Enrollment not found" });
            }
            res.sendStatus(204);
        } catch (error) {
            res.status(500).json({ message: "Failed to unenroll user", error: error.message });
        }
    };

    app.get("/api/users/:userId/courses", findCoursesForUser);
    app.post("/api/users/:userId/courses/:courseId/enroll", enrollUserInCourse);
    app.delete("/api/users/:userId/courses/:courseId/unenroll", unenrollUserFromCourse);

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