import * as dao from "./dao.js";
import * as modulesDao from "../Modules/dao.js";
import * as assignmentsDao from "../Assignments/dao.js";
import * as enrollmentsDao from "../Enrollments/dao.js";

export default function CourseRoutes(app) {
    app.get("/api/courses", (req, res) => {
        const courses = dao.findAllCourses();
        res.send(courses);
    });
    
    app.delete("/api/courses/:courseId", (req, res) => {
        const { courseId } = req.params;
        const status = dao.deleteCourse(courseId);
        res.send(status);
    });
    
    app.put("/api/courses/:courseId", (req, res) => {
        const { courseId } = req.params;
        const courseUpdates = req.body;
        const status = dao.updateCourse(courseId, courseUpdates);
        res.send(status);
    });
    
    app.post("/api/courses/:courseId/modules", (req, res) => {
        const { courseId } = req.params;
        const module = {
            ...req.body,
            course: courseId,
        };
        const newModule = modulesDao.createModule(module);
        res.send(newModule);
    });
    
    app.get("/api/courses/:courseId/modules", (req, res) => {
        const { courseId } = req.params;
        const modules = modulesDao.findModulesForCourse(courseId);
        res.json(modules);
    });
    
    app.get("/api/courses/:courseId/assignments", (req, res) => {
        const { courseId } = req.params;
        const assignments = assignmentsDao.findAssignmentsForCourse(courseId);
        res.json(assignments);
    });
    
    app.post("/api/courses/:courseId/users/:userId/enroll", async (req, res) => {
        try {
            const { userId, courseId } = req.params;
            console.log("Enrolling user", userId, "in course", courseId);
            
            await enrollmentsDao.enrollUserInCourse(userId, courseId);
            console.log("Successfully enrolled user", userId, "in course", courseId);
            res.sendStatus(200);
        } catch (error) {
            console.error("Error enrolling user:", error);
            res.status(500).json({ message: "Failed to enroll user", error: error.message });
        }
    });
    
    app.delete("/api/courses/:courseId/users/:userId/unenroll", async (req, res) => {
        try {
            const { userId, courseId } = req.params;
            console.log("Unenrolling user", userId, "from course", courseId);
            
            const enrollmentExists = await enrollmentsDao.checkEnrollmentExists(userId, courseId);
            if (!enrollmentExists) {
                console.log("Enrollment not found for user", userId, "in course", courseId);
                return res.status(404).json({ message: "Enrollment not found" });
            }
            
            await enrollmentsDao.unenrollUserFromCourse(userId, courseId);
            console.log("Successfully unenrolled user", userId, "from course", courseId);
            res.sendStatus(200);
        } catch (error) {
            console.error("Error unenrolling user:", error);
            res.status(500).json({ message: "Failed to unenroll user", error: error.message });
        }
    });
}

export function findCoursesForEnrolledUser(userId) {
    const { courses, enrollments } = Database;
    const enrolledCourses = courses.filter((course) =>
        enrollments.some((enrollment) => enrollment.user === userId && enrollment.course === course._id));
    return enrolledCourses;
}