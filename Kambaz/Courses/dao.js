import model from "./model.js";
import EnrollmentModel from "../Enrollments/model.js";
import { v4 as uuidv4 } from "uuid";

export async function findAllCourses() {
    try {
        return await model.find();
    } catch (error) {
        throw new Error(`Failed to find courses: ${error.message}`);
    }
}

export async function findCoursesForEnrolledUser(userId) {
    try {
        const enrollments = await EnrollmentModel.find({ user: userId }).populate('course');
        return enrollments.map(enrollment => enrollment.course).filter(course => course); // Filter out null courses
    } catch (error) {
        throw new Error(`Failed to find courses for user ${userId}: ${error.message}`);
    }
}

export async function findCoursesByIds(courseIds) {
    try {
        return await model.find({ _id: { $in: courseIds } });
    } catch (error) {
        throw new Error(`Failed to find courses by IDs: ${error.message}`);
    }
}

export async function findCourseById(courseId) {
    try {
        return await model.findById(courseId);
    } catch (error) {
        throw new Error(`Failed to find course ${courseId}: ${error.message}`);
    }
}

export async function createCourse(course) {
    try {
        const newCourse = { ...course, _id: uuidv4() };
        return await model.create(newCourse);
    } catch (error) {
        throw new Error(`Failed to create course: ${error.message}`);
    }
}

export async function deleteCourse(courseId) {
    try {
        return await model.deleteOne({ _id: courseId });
    } catch (error) {
        throw new Error(`Failed to delete course ${courseId}: ${error.message}`);
    }
}

export async function updateCourse(courseId, courseUpdates) {
    try {
        return await model.updateOne({ _id: courseId }, { $set: courseUpdates });
    } catch (error) {
        throw new Error(`Failed to update course ${courseId}: ${error.message}`);
    }
}