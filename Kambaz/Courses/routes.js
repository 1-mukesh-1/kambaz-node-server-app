import * as modulesDao from "../Modules/dao.js";
import * as dao from "./dao.js";
import * as assignmentsDao from "../Assignments/dao.js";
import * as enrollmentsDao from "../Enrollments/dao.js";

export default function CourseRoutes(app) {
    app.post("/api/courses", async (req, res) => {
        const course = await dao.createCourse(req.body);
        res.json(course);
    });

    app.get("/api/courses", async (req, res) => {
        const courses = await dao.findAllCourses();
        res.send(courses);
    });
    
    app.delete("/api/courses/:courseId", async (req, res) => {
        const { courseId } = req.params;
        const status = await dao.deleteCourse(courseId);
        res.send(status);
    });

    app.put("/api/courses/:courseId", async (req, res) => {
        const { courseId } = req.params;
        await dao.updateCourse(courseId, req.body);
        const updatedCourse = await dao.findCourseById(courseId);
        res.json(updatedCourse);
    });
    
    app.post("/api/courses/:courseId/modules", async (req, res) => {
        const { courseId } = req.params;
        const module = {
            ...req.body,
            course: courseId,
        };
        const newModule = await modulesDao.createModule(module);
        res.send(newModule);
    });
    
    app.get("/api/courses/:courseId/modules", async (req, res) => {
        const { courseId } = req.params;
        const modules = await modulesDao.findModulesForCourse(courseId);
        res.json(modules);
    });
    
    app.get("/api/courses/:courseId/assignments", async (req, res) => {
        const { courseId } = req.params;
        const assignments = await assignmentsDao.findAssignmentsForCourse(courseId);
        res.json(assignments);
    });

    app.get("/api/courses/:courseId/users", async (req, res) => {
        const { courseId } = req.params;
        const users = await enrollmentsDao.findUsersForCourse(courseId);
        res.json(users);
    });
}