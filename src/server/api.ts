import express from 'express';
import { db, Days } from './lib/db.js';
// import { stageDaily } from './lib/dailyStage.js';
// import { getStudentToday, prepareStudents } from './lib/quickFunctions.js';


const router = express.Router();

// API Routes
router.get('/api/tasks/all', async (_req, res) => {
    try {
        const tasks = await db.tasks.findMany();
        res.json(tasks);
    } catch (error) {
        console.error('Fetch all tasks error:', error);
        res.status(500).json({ message: 'Intern serverfeil' });
    }
});

router.get('/api/completions', async (_req, res) => {
    try {
        const completions = await db.completions.findMany({
            include: {
                student: true,
                completedTasks: true,
                nonCompletedTasks: true
                //submission: true
            },
            orderBy: {
                date: 'desc'
            }
        });
        res.json(completions);
    } catch (error) {
        console.error('Fetch completions error:', error);
        res.status(500).json({ message: 'Intern serverfeil' });
    }
});

router.get('/api/CompletionImage', async (req, res) => {
    try {
        const id = parseInt(req.query.id as string);
        const imgNum = req.query.img as string;

        if (isNaN(id) || !['1', '2'].includes(imgNum)) {
            return res.status(400).json({ message: 'Ugyldige parametere' });
        }

        const completion = await db.completions.findUnique({
            where: { id }
        });

        if (!completion) {
            return res.status(404).json({ message: 'Fant ikke registrering' });
        }

        const imageData = imgNum === '1' ? completion.image1 : completion.image2;

        if (!imageData) {
            return res.status(404).json({ message: 'Bilde finnes ikke' });
        }

        // Assuming images are stored as base64 data URLs
        // If they are just the raw base64, we might need to prepend the prefix
        res.send(imageData);
    } catch (error) {
        console.error('Image fetch error:', error);
        res.status(500).json({ message: 'Intern serverfeil' });
    }
});

const dayToEnumMap: Record<number, Days> = {
    1: Days.Monday,
    2: Days.Tuesday,
    3: Days.Wednesday,
    4: Days.Thursday,
    5: Days.Friday,
};

// API Routes
router.get('/api/tasks', async (req, res) => {
    console.log("test");
    try {
        const className = req.headers['x-class'] as string;
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)

        // Map JS day to our enum (we only handle Mon-Fri)
        const prismaDay = dayToEnumMap[dayOfWeek];

        if (!prismaDay) {
            return res.json({
                tasks: [],
                ordenselev: "Ingen ansvarlig i helgen",
                message: "Helg - ingen oppgaver"
            });
        }

        const tasks = await db.tasks.findMany({
            where: {
                days: {
                    has: prismaDay
                }
            }
        });

        // Get today's date at midnight for consistent comparison
        const todayMidnight = new Date(today);
        todayMidnight.setHours(0, 0, 0, 0);

        const tomorrow = new Date(todayMidnight);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Find existing completion for today
        const completion = await db.completions.findFirst({
            where: {
                date: {
                    gte: todayMidnight,
                    lt: tomorrow
                }
            },
            include: {
                completedTasks: true,
                nonCompletedTasks: true
            }
        });

        // Map tasks with completion status
        const tasksWithStatus = tasks.map((t: any) => {
            let completed = null; // null = not yet marked

            if (completion) {
                const isCompleted = completion.completedTasks.some((ct: any) => ct.id === t.id);
                const isNotCompleted = completion.nonCompletedTasks.some((nct: any) => nct.id === t.id);

                if (isCompleted) {
                    completed = true;
                } else if (isNotCompleted) {
                    completed = false;
                }
            }

            return {
                id: t.id,
                task: t.task,
                completed: completed
            };
        });

        res.json({
            tasks: tasksWithStatus,
            ordenselev: "Ola Nordmann" // Hardcoded for now
        });
    } catch (error) {
        console.error('Fetch tasks error:', error);
        res.status(500).json({ message: 'Intern serverfeil ved henting av oppgaver' });
    }
});

router.post('/api/submit', async (req, res) => {
    try {
        const {
            completedTaskIds = [],
            nonCompletedTaskIds = [],
            image1 = null,
            image2 = null,
            comment = "",
            studentId = 1
        } = req.body;

        // Get today's date at midnight for consistent comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Find existing completion for today
        let completion = await db.completions.findFirst({
            where: {
                date: {
                    gte: today,
                    lt: tomorrow
                }
            }
        });

        // Safety check to ensure we have arrays
        const safeCompletedTaskIds = Array.isArray(completedTaskIds) ? completedTaskIds : [];
        const safeNonCompletedTaskIds = Array.isArray(nonCompletedTaskIds) ? nonCompletedTaskIds : [];

        // Update or create the completion record
        if (completion) {
            // Update existing completion
            completion = await db.completions.update({
                where: { id: completion.id },
                data: {
                    studentId: studentId,
                    completedTasks: {
                        set: safeCompletedTaskIds.map((id: number) => ({ id }))
                    },
                    nonCompletedTasks: {
                        set: safeNonCompletedTaskIds.map((id: number) => ({ id }))
                    },
                    image1: image1 || null,
                    image2: image2 || null,
                    comment: comment || null,
                    submission: true
                }
            });
        } else {
            // Create new completion
            completion = await db.completions.create({
                data: {
                    date: today,
                    studentId: studentId,
                    completedTasks: {
                        connect: safeCompletedTaskIds.map((id: number) => ({ id }))
                    },
                    nonCompletedTasks: {
                        connect: safeNonCompletedTaskIds.map((id: number) => ({ id }))
                    },
                    image1: image1 || null,
                    image2: image2 || null,
                    comment: comment || null,
                    submission: true
                }
            });
        }

        res.status(200).json({
            message: 'Rapport lagret',
            completionId: completion.id
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Intern serverfeil' });
    }
});

// Temporary code for testing
/* 
router.get('/api/test/dailyStage', async (req, res) => {
    try {
        const student = await stageDaily();
        res.json({ student });
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({ message: 'Intern serverfeil' });
    }
});

router.get('/api/test/getStudentToday', async (req, res) => {
    try {
        const student = await getStudentToday();
        res.json({ student });
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({ message: 'Intern serverfeil' });
    }
});

router.get('/api/test/prepareStudents', async (req, res) => {
    try {
        const student = await prepareStudents();
        res.json({ student });
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({ message: 'Intern serverfeil' });
    }
}); */

export default router;