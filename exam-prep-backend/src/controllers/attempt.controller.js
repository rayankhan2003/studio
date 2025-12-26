
import Attempt from '../models/Attempt.js';
import Test from '../models/Test.js';
import Question from '../models/Question.js';
import User from '../models/User.js';

export const startAttempt = async (req, res, next) => {
    try {
        const { testId } = req.body;
        const userId = req.user.id;

        const test = await Test.findById(testId);
        if (!test) return res.status(404).json({ message: "Test not found." });

        // Check if student has access to this test (based on section)
        const student = await User.findById(userId);
        if (test.section && student.section?.toString() !== test.section.toString()) {
            return res.status(403).json({ message: "You are not authorized to take this test." });
        }
        
        // Allow re-taking tests for this implementation
        const attempt = await Attempt.create({
            user: userId,
            test: testId,
            testName: test.title,
            curriculum: test.level,
            testType: test.isPublished ? 'Past Paper' : 'Custom',
            startedAt: new Date(),
            totalQuestions: test.questionIds.length,
            status: 'in-progress',
        });

        res.status(201).json({ attemptId: attempt._id, message: "Test started successfully." });
    } catch (e) {
        next(e);
    }
};

export const submitAttempt = async (req, res, next) => {
    try {
        const { attemptId, responses } = req.body;
        const userId = req.user.id;

        const attempt = await Attempt.findOne({ _id: attemptId, user: userId, status: 'in-progress' });
        if (!attempt) return res.status(404).json({ message: "Active attempt not found." });

        const questionIds = responses.map(r => r.questionId);
        const questions = await Question.find({ '_id': { $in: questionIds } }).lean();
        const questionMap = new Map(questions.map(q => [q._id.toString(), q]));

        let correctCount = 0;
        const subjectScores = {};
        const chapterScores = {};
        const processedAnswers = [];

        for (const response of responses) {
            const question = questionMap.get(response.questionId);
            if (!question) continue;

            const isCorrect = JSON.stringify(response.selectedAnswer) === JSON.stringify(question.correctAnswer);

            if (isCorrect) correctCount++;
            
            // Subject scores
            subjectScores[question.subject] = subjectScores[question.subject] || { correct: 0, total: 0 };
            subjectScores[question.subject].total++;
            if (isCorrect) subjectScores[question.subject].correct++;

            // Chapter scores
            chapterScores[question.subject] = chapterScores[question.subject] || {};
            chapterScores[question.subject][question.chapter] = chapterScores[question.subject][question.chapter] || { correct: 0, total: 0 };
            chapterScores[question.subject][question.chapter].total++;
            if (isCorrect) chapterScores[question.subject][question.chapter].correct++;

            processedAnswers.push({
                questionId: question._id,
                selectedAnswer: response.selectedAnswer,
                isCorrect: isCorrect,
            });
        }
        
        attempt.answers = processedAnswers;
        attempt.score = correctCount;
        attempt.scorePercentage = (correctCount / attempt.totalQuestions) * 100;
        attempt.completedAt = new Date();
        attempt.timeTaken = (attempt.completedAt.getTime() - attempt.startedAt.getTime()) / 1000;
        attempt.status = 'completed';

        // Calculate percentages for subjects
        for (const subject in subjectScores) {
            const scores = subjectScores[subject];
            scores.percentage = (scores.correct / scores.total) * 100;
        }
        attempt.subjectScores = subjectScores;

        // Calculate percentages for chapters
        for (const subject in chapterScores) {
            for (const chapter in chapterScores[subject]) {
                const scores = chapterScores[subject][chapter];
                scores.percentage = (scores.correct / scores.total) * 100;
            }
        }
        attempt.chapterScores = chapterScores;


        await attempt.save();

        res.json({ message: "Test submitted successfully.", attemptId: attempt._id });
    } catch (e) {
        next(e);
    }
};

export const analyticsForUser = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const attempts = await Attempt.find({ user: userId, status: 'completed' })
            .sort({ completedAt: -1 })
            .lean();
        
        if (!attempts.length) {
            return res.json({
                averageScore: 0,
                testsTaken: 0,
                subjectPerformance: {},
                chapterPerformance: {},
                scoreProgression: []
            });
        }

        const totalScore = attempts.reduce((acc, a) => acc + a.scorePercentage, 0);
        const averageScore = totalScore / attempts.length;

        // Aggregate performance
        const subjectPerformance = {};
        const chapterPerformance = {};
        
        attempts.forEach(attempt => {
            // subject scores
             for(const [subject, scores] of attempt.subjectScores.entries()) {
                subjectPerformance[subject] = subjectPerformance[subject] || { correct: 0, total: 0 };
                subjectPerformance[subject].correct += scores.correct;
                subjectPerformance[subject].total += scores.total;
             }
             // chapter scores
              for(const [subject, chapters] of attempt.chapterScores.entries()) {
                chapterPerformance[subject] = chapterPerformance[subject] || {};
                for (const [chapter, scores] of chapters.entries()) {
                    chapterPerformance[subject][chapter] = chapterPerformance[subject][chapter] || { correct: 0, total: 0 };
                    chapterPerformance[subject][chapter].correct += scores.correct;
                    chapterPerformance[subject][chapter].total += scores.total;
                }
             }
        });
        
         // Calculate percentages
        for(const subject in subjectPerformance) {
            const perf = subjectPerformance[subject];
            perf.percentage = perf.total > 0 ? (perf.correct / perf.total) * 100 : 0;
        }
        for(const subject in chapterPerformance) {
            for(const chapter in chapterPerformance[subject]) {
                const perf = chapterPerformance[subject][chapter];
                perf.percentage = perf.total > 0 ? (perf.correct / perf.total) * 100 : 0;
            }
        }

        const scoreProgression = attempts.map(a => ({
            testName: a.testName,
            date: a.completedAt,
            score: a.scorePercentage,
            subjectScores: Object.fromEntries(a.subjectScores)
        })).reverse();


        res.json({
            averageScore,
            testsTaken: attempts.length,
            subjectPerformance,
            chapterPerformance,
            scoreProgression
        });

    } catch (e) {
        next(e);
    }
};
