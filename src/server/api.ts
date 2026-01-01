import express from 'express';
import { db, Days } from './lib/db.js';
// import { stageDaily } from './lib/dailyStage.js';
import { getStudentToday, prepareStudents } from './lib/quickFunctions.js';
import { env } from 'process';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { processImage } from './lib/processImage.js';

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

        // Determine folder name based on image number
        const folderName = imgNum === '1' ? 'image1' : 'image2';

        // Construct absolute path to the image
        // Structure: /_imageStorage/completions/image{1|2}/{id}.jpg
        const imagePath = path.join(process.cwd(), '_imageStorage', 'completions', folderName, `${id}.jpg`);

        if (!fs.existsSync(imagePath)) {
            return res.status(404).json({ message: 'Bilde finnes ikke' });
        }

        res.sendFile(imagePath);
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

        // Get name of today's ordenselev
        const student = await getStudentToday();
        const ordenselevName = student ? student.name : "Ingen ansvarlig funnet";

        res.json({
            tasks: tasksWithStatus,
            ordenselev: ordenselevName
        });
    } catch (error) {
        console.error('Fetch tasks error:', error);
        res.status(500).json({ message: 'Intern serverfeil ved henting av oppgaver' });
    }
});

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    }
});


router.post('/api/submit', async (req, res) => {
    try {
        const {
            completedTaskIds = [],
            nonCompletedTaskIds = [],
            hasImages = false, // Client tells us if they have images
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
                    image: hasImages,
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
                    image: hasImages,
                    comment: comment || null,
                    submission: true
                }
            });
        }

        res.status(200).json({
            message: 'Rapport lagret',
            completionId: completion.id,
            shouldUploadImages: hasImages // Tell client if they should proceed to upload
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Intern serverfeil' });
    }
});

router.post('/api/upload-images', upload.fields([{ name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }]), async (req, res) => {
    try {
        const { completionId } = req.body;
        // Cast req.files to dictionary of file arrays
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        if (!completionId) {
            return res.status(400).json({ message: 'Mangler completionId' });
        }

        const id = parseInt(completionId as string);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Ugyldig completionId' });
        }

        // Check if completion exists
        const completion = await db.completions.findUnique({
            where: { id: id }
        });

        if (!completion) {
            return res.status(404).json({ message: 'Fant ikke rapporten' });
        }

        // Define base storage path
        const baseStoragePath = path.join(process.cwd(), '_imageStorage', 'completions');
        const dirImage1 = path.join(baseStoragePath, 'image1');
        const dirImage2 = path.join(baseStoragePath, 'image2');

        // Ensure directories exist
        if (!fs.existsSync(dirImage1)) fs.mkdirSync(dirImage1, { recursive: true });
        if (!fs.existsSync(dirImage2)) fs.mkdirSync(dirImage2, { recursive: true });

        // Save Image 1
        if (files['image1'] && files['image1'][0]) {
            try {
                const processedBuffer = await processImage(files['image1'][0].buffer);
                const filePath1 = path.join(dirImage1, `${id}.jpg`);
                fs.writeFileSync(filePath1, processedBuffer);
            } catch (err) {
                console.error(`Failed to process image 1 for completion ${id}`, err);
                // Continue or fail? Letting it fail for that specific image but continue request? 
                // Better to throw so client knows something went wrong.
                throw err;
            }
        }

        // Save Image 2
        if (files['image2'] && files['image2'][0]) {
            try {
                const processedBuffer = await processImage(files['image2'][0].buffer);
                const filePath2 = path.join(dirImage2, `${id}.jpg`);
                fs.writeFileSync(filePath2, processedBuffer);
            } catch (err) {
                console.error(`Failed to process image 2 for completion ${id}`, err);
                throw err;
            }
        }

        res.status(200).json({ message: 'Bilder lastet opp' });
    } catch (error) {
        console.error('Image upload error:', error);
        res.status(500).json({ message: 'Feil ved opplasting av bilder' });
    }
});

router.get('/api/daily-person', async (req, res) => {
    try {
        const student = await getStudentToday();

        if (!student) {
            return res.status(404).json({ message: 'Ingen ordenselev funnet for i dag' });
        }

        res.json({
            id: student.id,
            name: student.name,
            class: student.class
        });
    } catch (error) {
        console.error('Error fetching daily person:', error);
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