import * as quizzesDao from "./dao.js";
import * as attemptsDao from "../QuizAttempts/dao.js";

export default function QuizRoutes(app) {
    app.get("/api/quizzes", async (req, res) => {
        try {
            const quizzes = await quizzesDao.findAllQuizzes();
            res.json(quizzes);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get("/api/quizzes/:quizId", async (req, res) => {
        try {
            const { quizId } = req.params;
            const quiz = await quizzesDao.findQuizById(quizId);
            
            const currentUser = req.session["currentUser"];
            if (currentUser && currentUser.role === "STUDENT") {
                const latestAttempt = await attemptsDao.findLatestAttempt(currentUser._id, quizId);
                
                if (!latestAttempt || latestAttempt.status !== "SUBMITTED") {
                    if (quiz && quiz.questions) {
                        quiz.questions = quiz.questions.map(q => {
                            const question = q.toObject ? q.toObject() : q;
                            if (question.type === "MULTIPLE_CHOICE") {
                                question.choices = question.choices.map(c => ({
                                    _id: c._id,
                                    text: c.text
                                }));
                            } else if (question.type === "TRUE_FALSE") {
                                delete question.trueFalseAnswer;
                            } else if (question.type === "FILL_BLANK") {
                                delete question.blanks;
                            }
                            return question;
                        });
                    }
                }
            }
            
            res.json(quiz);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.post("/api/quizzes", async (req, res) => {
        try {
            const quiz = await quizzesDao.createQuiz(req.body);
            res.status(201).json(quiz);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.put("/api/quizzes/:quizId", async (req, res) => {
        try {
            const { quizId } = req.params;
            await quizzesDao.updateQuiz(quizId, req.body);
            const updatedQuiz = await quizzesDao.findQuizById(quizId);
            res.json(updatedQuiz);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.delete("/api/quizzes/:quizId", async (req, res) => {
        try {
            const { quizId } = req.params;
            await quizzesDao.deleteQuiz(quizId);
            res.sendStatus(204);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.put("/api/quizzes/:quizId/publish", async (req, res) => {
        try {
            const { quizId } = req.params;
            const { published } = req.body;
            await quizzesDao.publishQuiz(quizId, published);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.post("/api/quizzes/:quizId/questions", async (req, res) => {
        try {
            const { quizId } = req.params;
            const question = await quizzesDao.addQuestion(quizId, req.body);
            res.status(201).json(question);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.put("/api/quizzes/:quizId/questions/:questionId", async (req, res) => {
        try {
            const { quizId, questionId } = req.params;
            const question = await quizzesDao.updateQuestion(quizId, questionId, req.body);
            res.json(question);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.delete("/api/quizzes/:quizId/questions/:questionId", async (req, res) => {
        try {
            const { quizId, questionId } = req.params;
            await quizzesDao.deleteQuestion(quizId, questionId);
            res.sendStatus(204);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Course-specific quiz operations
    app.get("/api/courses/:courseId/quizzes", async (req, res) => {
        try {
            const { courseId } = req.params;
            const quizzes = await quizzesDao.findQuizzesForCourse(courseId);
            
            // Add attempt info for students
            const currentUser = req.session["currentUser"];
            if (currentUser && currentUser.role === "STUDENT") {
                const quizzesWithAttempts = await Promise.all(
                    quizzes.map(async (quiz) => {
                        const latestAttempt = await attemptsDao.findLatestAttempt(currentUser._id, quiz._id);
                        const attemptCount = await attemptsDao.countAttempts(currentUser._id, quiz._id);
                        return {
                            ...quiz.toObject(),
                            lastScore: latestAttempt?.score,
                            attemptsTaken: attemptCount,
                            lastAttemptStatus: latestAttempt?.status
                        };
                    })
                );
                res.json(quizzesWithAttempts);
            } else {
                res.json(quizzes);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Quiz attempt operations
    app.post("/api/quizzes/:quizId/attempts", async (req, res) => {
        try {
            const { quizId } = req.params;
            const currentUser = req.session["currentUser"];
            
            if (!currentUser) {
                return res.status(401).json({ error: "User not authenticated" });
            }
            
            const attempt = await attemptsDao.createAttempt(currentUser._id, quizId);
            res.status(201).json(attempt);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    app.get("/api/quizzes/:quizId/attempts", async (req, res) => {
        try {
            const { quizId } = req.params;
            const currentUser = req.session["currentUser"];
            
            if (!currentUser) {
                return res.status(401).json({ error: "User not authenticated" });
            }
            
            const attempts = await attemptsDao.findAttemptsByUserAndQuiz(currentUser._id, quizId);
            res.json(attempts);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get("/api/quizzes/:quizId/attempts/latest", async (req, res) => {
        try {
            const { quizId } = req.params;
            const currentUser = req.session["currentUser"];
            
            if (!currentUser) {
                return res.status(401).json({ error: "User not authenticated" });
            }
            
            const attempt = await attemptsDao.findLatestAttempt(currentUser._id, quizId);
            res.json(attempt);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.post("/api/attempts/:attemptId/submit", async (req, res) => {
        try {
            const { attemptId } = req.params;
            const { answers } = req.body;
            
            const submittedAttempt = await attemptsDao.submitAttempt(attemptId, answers);
            res.json(submittedAttempt);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    app.get("/api/attempts/:attemptId", async (req, res) => {
        try {
            const { attemptId } = req.params;
            const attempt = await attemptsDao.findAttemptById(attemptId);
            res.json(attempt);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.put("/api/attempts/:attemptId/answer", async (req, res) => {
        try {
            const { attemptId } = req.params;
            const { questionId, answer } = req.body;
            
            const attempt = await attemptsDao.saveAnswer(attemptId, questionId, answer);
            res.json(attempt);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });
}