import model from "./model.js";
import QuizModel from "../Quizzes/model.js";
import { v4 as uuidv4 } from "uuid";

export const findAttemptsByUserAndQuiz = (userId, quizId) => {
    return model.find({ user: userId, quiz: quizId }).sort({ attemptNumber: -1 });
};

export const findLatestAttempt = (userId, quizId) => {
    return model.findOne({ user: userId, quiz: quizId }).sort({ attemptNumber: -1 });
};

export const countAttempts = (userId, quizId) => {
    return model.countDocuments({ user: userId, quiz: quizId });
};

export const saveAnswer = async (attemptId, questionId, answer) => {
    const attempt = await model.findById(attemptId);
    if (!attempt) throw new Error("Attempt not found");
    
    if (attempt.status === "SUBMITTED") {
        throw new Error("Cannot modify a submitted attempt");
    }

    const existingAnswerIndex = attempt.answers.findIndex(
        a => a.questionId === questionId
    );
    
    if (existingAnswerIndex >= 0) {
        attempt.answers[existingAnswerIndex].answer = answer;
    } else {
        attempt.answers.push({
            questionId,
            answer,
            isCorrect: false,
            points: 0
        });
    }
    
    await attempt.save();
    return attempt;
};

export const createAttempt = async (userId, quizId) => {
    const attemptCount = await countAttempts(userId, quizId);
    const quiz = await QuizModel.findById(quizId);
    
    if (!quiz) throw new Error("Quiz not found");
    
    if (!quiz.multipleAttempts && attemptCount > 0) {
        throw new Error("Multiple attempts not allowed for this quiz");
    }
    
    if (quiz.multipleAttempts && attemptCount >= quiz.howManyAttempts) {
        throw new Error(`Maximum attempts (${quiz.howManyAttempts}) reached`);
    }
    
    const newAttempt = {
        _id: uuidv4(),
        quiz: quizId,
        user: userId,
        attemptNumber: attemptCount + 1,
        startedAt: new Date(),
        status: "IN_PROGRESS",
        answers: [],
        score: 0,
        totalPoints: quiz.points || 0
    };
    
    return model.create(newAttempt);
};

export const submitAttempt = async (attemptId, answers) => {
    const attempt = await model.findById(attemptId);
    if (!attempt) throw new Error("Attempt not found");
    
    if (attempt.status === "SUBMITTED") {
        throw new Error("This attempt has already been submitted");
    }
    
    const quiz = await QuizModel.findById(attempt.quiz);
    if (!quiz) throw new Error("Quiz not found");

    let totalScore = 0;
    const evaluatedAnswers = [];
    
    for (const answer of answers) {
        const question = quiz.questions.find(q => q._id === answer.questionId);
        if (!question) continue;
        
        let isCorrect = false;
        let earnedPoints = 0;
        
        switch (question.type) {
            case "MULTIPLE_CHOICE":
                const correctChoice = question.choices.find(c => c.isCorrect);
                isCorrect = correctChoice && correctChoice._id === answer.answer;
                break;
                
            case "TRUE_FALSE":
                isCorrect = question.trueFalseAnswer === answer.answer;
                break;
                
            case "FILL_BLANK":
                if (question.blanks && question.blanks.length > 0) {
                    isCorrect = question.blanks.some(blank => 
                        blank.toLowerCase() === (answer.answer || "").toLowerCase()
                    );
                }
                break;
        }
        
        if (isCorrect) {
            earnedPoints = question.points || 0;
            totalScore += earnedPoints;
        }
        
        evaluatedAnswers.push({
            questionId: answer.questionId,
            answer: answer.answer,
            isCorrect: isCorrect,
            points: earnedPoints
        });
    }
    
    const timeSpent = Math.round((new Date() - attempt.startedAt) / (1000 * 60)); // in minutes
    
    return model.findByIdAndUpdate(
        attemptId,
        {
            $set: {
                answers: evaluatedAnswers,
                score: totalScore,
                submittedAt: new Date(),
                timeSpent: timeSpent,
                status: "SUBMITTED"
            }
        },
        { new: true }
    );
};

export const findAttemptById = (attemptId) => {
    return model.findById(attemptId);
};