import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    _id: String,
    type: {
        type: String,
        enum: ["MULTIPLE_CHOICE", "TRUE_FALSE", "FILL_BLANK"],
        default: "MULTIPLE_CHOICE"
    },
    title: String,
    question: String,
    points: { type: Number, default: 1 },
    choices: [{
        _id: String,
        text: String,
        isCorrect: Boolean
    }],
    trueFalseAnswer: Boolean,
    blanks: [String]
}, { _id: false });

const quizSchema = new mongoose.Schema({
    _id: String,
    title: String,
    course: { type: String, ref: "CourseModel" },
    description: String,
    quizType: {
        type: String,
        enum: ["GRADED_QUIZ", "PRACTICE_QUIZ", "GRADED_SURVEY", "UNGRADED_SURVEY"],
        default: "GRADED_QUIZ"
    },
    points: { type: Number, default: 0 },
    assignmentGroup: {
        type: String,
        enum: ["QUIZZES", "EXAMS", "ASSIGNMENTS", "PROJECT"],
        default: "QUIZZES"
    },
    shuffleAnswers: { type: Boolean, default: true },
    timeLimit: { type: Number, default: 20 },
    multipleAttempts: { type: Boolean, default: false },
    howManyAttempts: { type: Number, default: 1 },
    showCorrectAnswers: { type: Boolean, default: true },
    accessCode: String,
    oneQuestionAtATime: { type: Boolean, default: true },
    webcamRequired: { type: Boolean, default: false },
    lockQuestionsAfterAnswering: { type: Boolean, default: false },
    dueDate: Date,
    availableDate: Date,
    untilDate: Date,
    published: { type: Boolean, default: false },
    questions: [questionSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { collection: "quizzes" });

export default quizSchema;