import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
    questionId: String,
    answer: mongoose.Schema.Types.Mixed,
    isCorrect: Boolean,
    points: Number
}, { _id: false });

const quizAttemptSchema = new mongoose.Schema({
    _id: String,
    quiz: { type: String, ref: "QuizModel" },
    user: { type: String, ref: "UserModel" },
    attemptNumber: { type: Number, default: 1 },
    answers: [answerSchema],
    score: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 },
    startedAt: Date,
    submittedAt: Date,
    timeSpent: Number,
    status: {
        type: String,
        enum: ["IN_PROGRESS", "SUBMITTED"],
        default: "IN_PROGRESS"
    }
}, { collection: "quizAttempts" });

export default quizAttemptSchema;