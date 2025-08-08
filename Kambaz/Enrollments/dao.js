import Database from "../Database/index.js";
import { v4 as uuidv4 } from "uuid";

export function enrollUserInCourse(userId, courseId) {
    const { enrollments } = Database;

    const existingEnrollment = enrollments.find(
        enrollment => enrollment.user === userId && enrollment.course === courseId
    );

    if (existingEnrollment) {
        console.log("User", userId, "is already enrolled in course", courseId);
        return existingEnrollment;
    }

    const newEnrollment = { _id: uuidv4(), user: userId, course: courseId };
    enrollments.push(newEnrollment);
    console.log("Added new enrollment:", newEnrollment);
    return newEnrollment;
}

export function unenrollUserFromCourse(userId, courseId) {
    const { enrollments } = Database;
    const initialLength = enrollments.length;

    console.log("Before unenroll - enrollments:", enrollments.length);
    console.log("Looking for enrollment with user:", userId, "course:", courseId);

    const enrollmentToRemove = enrollments.find(
        enrollment => enrollment.user === userId && enrollment.course === courseId
    );

    if (!enrollmentToRemove) {
        console.log("No enrollment found to remove for user", userId, "in course", courseId);
        return false;
    }

    console.log("Found enrollment to remove:", enrollmentToRemove);

    Database.enrollments = enrollments.filter(
        (enrollment) => !(enrollment.user === userId && enrollment.course === courseId)
    );

    const finalLength = Database.enrollments.length;
    console.log("After unenroll - enrollments:", finalLength);
    console.log("Removed", initialLength - finalLength, "enrollment(s)");

    return initialLength > finalLength;
}

export function checkEnrollmentExists(userId, courseId) {
    const { enrollments } = Database;
    const exists = enrollments.some(
        enrollment => enrollment.user === userId && enrollment.course === courseId
    );
    console.log("Enrollment exists check for user", userId, "in course", courseId, ":", exists);
    return exists;
}

export function findEnrollmentsForUser(userId) {
    const { enrollments } = Database;
    return enrollments.filter(enrollment => enrollment.user === userId);
}

export function findEnrollmentsForCourse(courseId) {
    const { enrollments } = Database;
    return enrollments.filter(enrollment => enrollment.course === courseId);
}