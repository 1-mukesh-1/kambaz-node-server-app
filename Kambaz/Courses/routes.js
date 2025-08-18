import * as modulesDao from "../Modules/dao.js";
import * as dao from "./dao.js";
import * as assignmentsDao from "../Assignments/dao.js";
import * as enrollmentsDao from "../Enrollments/dao.js";

export default function CourseRoutes(app) {
    app.post("/api/courses", async (req, res) => {
        try {
            console.log("Received course creation request:", req.body);            
            if (!req.body.name || !req.body.number) {
                return res.status(400).json({ 
                    message: "Course name and number are required" 
                });
            }

            const course = await dao.createCourse(req.body);
            console.log("Course created successfully:", course);
            res.status(201).json(course);
        } catch (error) {
            console.error("Error creating course:", error);
            res.status(500).json({ 
                message: "Failed to create course", 
                error: error.message 
            });
        }
    });

    app.get("/api/courses", async (req, res) => {
        try {
            const courses = await dao.findAllCourses();
            res.json(courses);
        } catch (error) {
            console.error("Error fetching courses:", error);
            res.status(500).json({ 
                message: "Failed to fetch courses", 
                error: error.message 
            });
        }
    });
    
    app.delete("/api/courses/:courseId", async (req, res) => {
        try {
            const { courseId } = req.params;
            const status = await dao.deleteCourse(courseId);
            if (status.deletedCount === 0) {
                return res.status(404).json({ message: "Course not found" });
            }
            res.json(status);
        } catch (error) {
            console.error("Error deleting course:", error);
            res.status(500).json({ 
                message: "Failed to delete course", 
                error: error.message 
            });
        }
    });

    app.put("/api/courses/:courseId", async (req, res) => {
        try {
            const { courseId } = req.params;
            await dao.updateCourse(courseId, req.body);
            const updatedCourse = await dao.findCourseById(courseId);
            res.json(updatedCourse);
        } catch (error) {
            console.error("Error updating course:", error);
            res.status(500).json({ 
                message: "Failed to update course", 
                error: error.message 
            });
        }
    });
    
    app.post("/api/courses/:courseId/modules", async (req, res) => {
        try {
            const { courseId } = req.params;
            const module = {
                ...req.body,
                course: courseId,
            };
            const newModule = await modulesDao.createModule(module);
            res.status(201).json(newModule);
        } catch (error) {
            console.error("Error creating module:", error);
            res.status(500).json({ 
                message: "Failed to create module", 
                error: error.message 
            });
        }
    });
    
    app.get("/api/courses/:courseId/modules", async (req, res) => {
        try {
            const { courseId } = req.params;
            const modules = await modulesDao.findModulesForCourse(courseId);
            res.json(modules);
        } catch (error) {
            console.error("Error fetching modules:", error);
            res.status(500).json({ 
                message: "Failed to fetch modules", 
                error: error.message 
            });
        }
    });
    
    app.get("/api/courses/:courseId/assignments", async (req, res) => {
        try {
            const { courseId } = req.params;
            const assignments = await assignmentsDao.findAssignmentsForCourse(courseId);
            res.json(assignments);
        } catch (error) {
            console.error("Error fetching assignments:", error);
            res.status(500).json({ 
                message: "Failed to fetch assignments", 
                error: error.message 
            });
        }
    });

    app.get("/api/courses/:courseId/users", async (req, res) => {
        try {
            const { courseId } = req.params;
            const users = await enrollmentsDao.findUsersForCourse(courseId);
            res.json(users);
        } catch (error) {
            console.error("Error fetching course users:", error);
            res.status(500).json({ 
                message: "Failed to fetch course users", 
                error: error.message 
            });
        }
    });
}