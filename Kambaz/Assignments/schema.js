import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
    _id: String,
    title: String,
    course: String,
    description: String,
    points: Number,
    due: Date,
    available: Date,
    until: Date,
    group: String,
    displayGradeAs: String,
    submissionType: String,
    onlineEntryOptions: {
        textEntry: Boolean,
        websiteUrl: Boolean,
        mediaRecordings: Boolean,
        studentAnnotation: Boolean,
        fileUploads: Boolean,
    },
    assignTo: String,
}, { collection: "assignments" });

export default assignmentSchema;