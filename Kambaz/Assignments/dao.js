import model from "./model.js";
import { v4 as uuidv4 } from "uuid";

export const findAllAssignments = () => model.find();
export const findAssignmentById = (id) => model.findById(id);
export const findAssignmentsForCourse = (courseId) => model.find({ course: courseId });
export const createAssignment = (assignment) => {
    const newAssignment = { ...assignment, _id: uuidv4() };
    return model.create(newAssignment);
};
export const updateAssignment = (id, assignment) => model.updateOne({ _id: id }, { $set: assignment });
export const deleteAssignment = (id) => model.deleteOne({ _id: id });