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

export const createAttempt = async (userId, quizId) => {
    const attemptCount = await countAttempts(userId, quizId);
    const quiz = await QuizModel.findById(quizId);
    
    if (!quiz) throw new Error("Quiz not found");
    
    const existingInProgress = await model.findOne({ 
        user: userId, 
        quiz: quizId, 
        status: "IN_PROGRESS" 
    });
    
    if (existingInProgress) {
        console.log("Found existing in-progress attempt:", existingInProgress._id);
        return existingInProgress;
    }
    
    const submittedCount = await model.countDocuments({ 
        user: userId, 
        quiz: quizId, 
        status: "SUBMITTED" 
    });
    
    if (!quiz.multipleAttempts && submittedCount > 0) {
        throw new Error("Multiple attempts not allowed for this quiz");
    }
    
    if (quiz.multipleAttempts && submittedCount >= quiz.howManyAttempts) {
        throw new Error(`Maximum attempts (${quiz.howManyAttempts}) reached`);
    }
    
    const newAttempt = {
        _id: uuidv4(),
        quiz: quizId,
        user: userId,
        attemptNumber: submittedCount + 1,
        startedAt: new Date(),
        status: "IN_PROGRESS",
        answers: [],
        score: 0,
        totalPoints: quiz.points || 0
    };
    
    console.log("Creating new attempt:", newAttempt._id);
    return model.create(newAttempt);
};

export const submitAttempt = async (attemptId, answers) => {
    console.log("Submitting attempt:", attemptId);
    
    const attempt = await model.findById(attemptId);
    if (!attempt) throw new Error("Attempt not found");
    
    if (attempt.status === "SUBMITTED") {
        console.log("Attempt already submitted");
        throw new Error("This attempt has already been submitted");
    }
    
    const quiz = await QuizModel.findById(attempt.quiz);
    if (!quiz) throw new Error("Quiz not found");
    
    let totalScore = 0;
    const evaluatedAnswers = [];
    
    for (const answer of answers) {
        const question = quiz.questions.find(q => String(q._id) === String(answer.questionId));
        if (!question) {
            continue;
        }
        
        let isCorrect = false;
        let earnedPoints = 0;
        
        switch (question.type) {
            case "MULTIPLE_CHOICE":
                const correctChoice = question.choices.find(c => c.isCorrect === true);
                if (correctChoice) {
                    isCorrect = String(correctChoice._id) === String(answer.answer);
                }
                break;
                
            case "TRUE_FALSE":
                const userAnswer = answer.answer === true || answer.answer === "true" || answer.answer === 1;
                const correctAnswer = question.trueFalseAnswer === true;
                isCorrect = userAnswer === correctAnswer;
                break;
                
            case "FILL_BLANK":
                if (question.blanks && question.blanks.length > 0 && answer.answer) {
                    const userAnswerLower = String(answer.answer).trim().toLowerCase();
                    isCorrect = question.blanks.some(blank => 
                        String(blank).trim().toLowerCase() === userAnswerLower
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
    
    const timeSpent = Math.round((new Date() - new Date(attempt.startedAt)) / (1000 * 60));
    
    attempt.answers = evaluatedAnswers;
    attempt.score = totalScore;
    attempt.submittedAt = new Date();
    attempt.timeSpent = timeSpent;
    attempt.status = "SUBMITTED";
    
    const savedAttempt = await attempt.save();
    
    console.log("Attempt submitted successfully. Status:", savedAttempt.status);
    
    return savedAttempt;
};

export const findAttemptById = async (attemptId) => {
    const attempt = await model.findById(attemptId);
    return attempt;
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