import model from "./model.js";

export async function checkEnrollmentExists(userId, courseId) {
    try {
        const enrollment = await model.findOne({ user: userId, course: courseId });
        console.log("Enrollment exists check for user", userId, "in course", courseId, ":", !!enrollment);
        return !!enrollment;
    } catch (error) {
        throw new Error(`Failed to check enrollment: ${error.message}`);
    }
}

export async function findEnrollmentsForUser(userId) {
    try {
        return await model.find({ user: userId });
    } catch (error) {
        throw new Error(`Failed to find enrollments for user ${userId}: ${error.message}`);
    }
}

export async function findEnrollmentsForCourse(courseId) {
    try {
        return await model.find({ course: courseId });
    } catch (error) {
        throw new Error(`Failed to find enrollments for course ${courseId}: ${error.message}`);
    }
}

export async function findCoursesForUser(userId) {
    try {
        const enrollments = await model.find({ user: userId }).populate("course");
        return enrollments.map((enrollment) => enrollment.course).filter(course => course);
    } catch (error) {
        throw new Error(`Failed to find courses for user ${userId}: ${error.message}`);
    }
}

export async function findUsersForCourse(courseId) {
    try {
        const enrollments = await model.find({ course: courseId }).populate("user");
        return enrollments.map((enrollment) => enrollment.user).filter(user => user);
    } catch (error) {
        throw new Error(`Failed to find users for course ${courseId}: ${error.message}`);
    }
}

export async function enrollUserInCourse(user, course) {
    try {
        return await model.create({ user, course, _id: `${user}-${course}` });
    } catch (error) {
        if (error.code === 11000) {
            throw new Error("User already enrolled in this course");
        }
        throw new Error(`Failed to enroll user ${user} in course ${course}: ${error.message}`);
    }
}

export async function unenrollUserFromCourse(user, course) {
    try {
        return await model.deleteOne({ user, course });
    } catch (error) {
        throw new Error(`Failed to unenroll user ${user} from course ${course}: ${error.message}`);
    }
}