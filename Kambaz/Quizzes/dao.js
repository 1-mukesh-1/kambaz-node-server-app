import model from "./model.js";
import { v4 as uuidv4 } from "uuid";

export const findAllQuizzes = () => model.find();

export const findQuizById = (id) => model.findById(id);

export const findQuizzesForCourse = (courseId) => model.find({ course: courseId });

export const createQuiz = (quiz) => {
    const newQuiz = { 
        ...quiz, 
        _id: uuidv4(),
        questions: quiz.questions ? quiz.questions.map(q => ({
            ...q,
            _id: String(q._id || uuidv4()),
            choices: q.choices ? q.choices.map(c => ({
                ...c,
                _id: String(c._id || uuidv4()),
                isCorrect: c.isCorrect === true
            })) : undefined
        })) : [],
        createdAt: new Date(),
        updatedAt: new Date()
    };
    return model.create(newQuiz);
};

export const updateQuiz = (id, quiz) => {
    const updatedQuiz = {
        ...quiz,
        questions: quiz.questions ? quiz.questions.map(q => ({
            ...q,
            _id: String(q._id || uuidv4()),
            choices: q.choices ? q.choices.map(c => ({
                ...c,
                _id: String(c._id || uuidv4()),
                isCorrect: c.isCorrect === true
            })) : undefined
        })) : [],
        updatedAt: new Date()
    };
    return model.updateOne({ _id: id }, { $set: updatedQuiz });
};

export const deleteQuiz = (id) => model.deleteOne({ _id: id });

export const publishQuiz = (id, published) => {
    return model.updateOne(
        { _id: id }, 
        { 
            $set: { 
                published: published,
                updatedAt: new Date()
            } 
        }
    );
};

export const addQuestion = async (quizId, question) => {
    const newQuestion = {
        ...question,
        _id: String(uuidv4()),
        choices: question.choices ? question.choices.map(c => ({
            ...c,
            _id: String(c._id || uuidv4()),
            isCorrect: c.isCorrect === true
        })) : undefined
    };
    
    const quiz = await model.findById(quizId);
    if (!quiz) throw new Error("Quiz not found");
    
    quiz.questions.push(newQuestion);
    quiz.points = quiz.questions.reduce((sum, q) => sum + (q.points || 0), 0);
    quiz.updatedAt = new Date();
    
    await quiz.save();
    return newQuestion;
};

export const updateQuestion = async (quizId, questionId, questionUpdates) => {
    const quiz = await model.findById(quizId);
    if (!quiz) throw new Error("Quiz not found");
    
    const questionIndex = quiz.questions.findIndex(q => String(q._id) === String(questionId));
    if (questionIndex === -1) throw new Error("Question not found");
    
    if (questionUpdates.choices) {
        questionUpdates.choices = questionUpdates.choices.map(c => ({
            ...c,
            _id: String(c._id || uuidv4()),
            isCorrect: c.isCorrect === true
        }));
    }
    
    quiz.questions[questionIndex] = {
        ...quiz.questions[questionIndex].toObject(),
        ...questionUpdates
    };
    
    quiz.points = quiz.questions.reduce((sum, q) => sum + (q.points || 0), 0);
    quiz.updatedAt = new Date();
    
    await quiz.save();
    return quiz.questions[questionIndex];
};

export const deleteQuestion = async (quizId, questionId) => {
    const quiz = await model.findById(quizId);
    if (!quiz) throw new Error("Quiz not found");
    
    quiz.questions = quiz.questions.filter(q => String(q._id) !== String(questionId));
    quiz.points = quiz.questions.reduce((sum, q) => sum + (q.points || 0), 0);
    quiz.updatedAt = new Date();
    
    await quiz.save();
    return { deleted: true };
};