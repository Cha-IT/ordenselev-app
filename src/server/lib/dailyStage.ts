import { db, Days } from './db.js';


const dayToEnumMap: Record<number, Days> = {
    1: Days.Monday,
    2: Days.Tuesday,
    3: Days.Wednesday,
    4: Days.Thursday,
    5: Days.Friday,
};

export async function stageDaily() {
    try {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)

        // Map JS day to our enum
        const prismaDay = dayToEnumMap[dayOfWeek];

        if (!prismaDay) {
            console.log('Weekend - no staging needed');
            return;
        }

        // Get today's date at midnight for consistent comparison
        const todayMidnight = new Date(today);
        todayMidnight.setHours(0, 0, 0, 0);

        const tomorrow = new Date(todayMidnight);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Check if completion already exists
        const existingCompletion = await db.completions.findFirst({
            where: {
                date: {
                    gte: todayMidnight,
                    lt: tomorrow
                }
            }
        });

        if (existingCompletion) {
            console.log('Completion already exists for today');
            return;
        }

        // Get all tasks for the day
        const tasks = await db.tasks.findMany({
            where: {
                days: {
                    has: prismaDay
                }
            }
        });

        if (tasks.length === 0) {
            console.log('No tasks found for today');
            return;
        }

        // TODO: Implement logic to find the correct student based on a rotation or schedule
        // For now, defaulting to ID 1 as seen in other parts of the app
        const responsibleStudentId = 1;

        // Create the completion record
        // All tasks start as non-completed
        await db.completions.create({
            data: {
                date: todayMidnight,
                studentId: responsibleStudentId,
                submission: false, // Explicitly set to false to indicate not yet submitted
                nonCompletedTasks: {
                    connect: tasks.map(t => ({ id: t.id }))
                }
            }
        });

        console.log(`Staged daily tasks for ${prismaDay}. Created completion record with ${tasks.length} pending tasks.`);

    } catch (error) {
        console.error('Error staging daily tasks:', error);
    }
}