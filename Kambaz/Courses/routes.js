import * as modulesDao from "../Modules/dao.js";
import * as dao from "./dao.js";
import * as assignmentsDao from "../Assignments/dao.js";
import * as enrollmentsDao from "../Enrollments/dao.js";

export default function CourseRoutes(app) {
    app.post("/api/courses", async (req, res) => {
        try {
            console.log("=== COURSE CREATION REQUEST ===");
            console.log("Request body:", JSON.stringify(req.body, null, 2));
            console.log("Session user:", req.session?.currentUser?._id);
            const { name, number, description, department, credits, startDate, endDate, author } = req.body;
            
            if (!name || !number) {
                console.log("Validation failed: missing name or number");
                return res.status(400).json({ 
                    success: false,
                    message: "Course name and number are required",
                    received: { name, number }
                });
            }

            const courseData = {
                name: name.trim(),
                number: number.trim(),
                description: description || "",
                department: department || "",
                credits: Number(credits) || 3,
                startDate: startDate || "",
                endDate: endDate || "",
                author: author || req.session?.currentUser?._id || ""
            };

            console.log("Sanitized course data:", courseData);

            const course = await dao.createCourse(courseData);
            console.log("✅ Course created successfully:", course._id);
            
            res.status(201).json({
                success: true,
                course: course,
                message: "Course created successfully"
            });
        } catch (error) {
            console.error("❌ Error creating course:", error);
            console.error("Error stack:", error.stack);
            res.status(500).json({ 
                success: false,
                message: "Failed to create course", 
                error: error.message,
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    });

    app.get("/api/courses", async (req, res) => {
        try {
            console.log("Fetching all courses...");
            const courses = await dao.findAllCourses();
            console.log(`Found ${courses.length} courses`);
            res.json(courses);
        } catch (error) {
            console.error("Error fetching courses:", error);
            res.status(500).json({ 
                success: false,
                message: "Failed to fetch courses", 
                error: error.message 
            });
        }
    });

    app.delete("/api/courses/:courseId", async (req, res) => {
        try {
            const { courseId } = req.params;
            console.log(`Deleting course: ${courseId}`);
            
            if (!courseId) {
                return res.status(400).json({ message: "Course ID is required" });
            }

            const status = await dao.deleteCourse(courseId);
            if (status.deletedCount === 0) {
                return res.status(404).json({ message: "Course not found" });
            }
            console.log(`✅ Course ${courseId} deleted successfully`);
            res.json({ success: true, deletedCount: status.deletedCount });
        } catch (error) {
            console.error("Error deleting course:", error);
            res.status(500).json({ 
                success: false,
                message: "Failed to delete course", 
                error: error.message 
            });
        }
    });

    app.put("/api/courses/:courseId", async (req, res) => {
        try {
            const { courseId } = req.params;
            console.log(`Updating course: ${courseId}`, req.body);
            
            await dao.updateCourse(courseId, req.body);
            const updatedCourse = await dao.findCourseById(courseId);
            
            if (!updatedCourse) {
                return res.status(404).json({ message: "Course not found after update" });
            }
            
            console.log(`✅ Course ${courseId} updated successfully`);
            res.json(updatedCourse);
        } catch (error) {
            console.error("Error updating course:", error);
            res.status(500).json({ 
                success: false,
                message: "Failed to update course", 
                error: error.message 
            });
        }
    });
    
    app.post("/api/courses/:courseId/modules", async (req, res) => {
        try {
            const { courseId } = req.params;
            const module = { ...req.body, course: courseId };
            const newModule = await modulesDao.createModule(module);
            res.status(201).json(newModule);
        } catch (error) {
            console.error("Error creating module:", error);
            res.status(500).json({ message: "Failed to create module", error: error.message });
        }
    });
    
    app.get("/api/courses/:courseId/modules", async (req, res) => {
        try {
            const { courseId } = req.params;
            const modules = await modulesDao.findModulesForCourse(courseId);
            res.json(modules);
        } catch (error) {
            console.error("Error fetching modules:", error);
            res.status(500).json({ message: "Failed to fetch modules", error: error.message });
        }
    });
    
    app.get("/api/courses/:courseId/assignments", async (req, res) => {
        try {
            const { courseId } = req.params;
            const assignments = await assignmentsDao.findAssignmentsForCourse(courseId);
            res.json(assignments);
        } catch (error) {
            console.error("Error fetching assignments:", error);
            res.status(500).json({ message: "Failed to fetch assignments", error: error.message });
        }
    });

    app.get("/api/courses/:courseId/users", async (req, res) => {
        try {
            const { courseId } = req.params;
            const users = await enrollmentsDao.findUsersForCourse(courseId);
            res.json(users);
        } catch (error) {
            console.error("Error fetching course users:", error);
            res.status(500).json({ message: "Failed to fetch course users", error: error.message });
        }
    });
}