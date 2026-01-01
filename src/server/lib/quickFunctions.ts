import { db, Days, Class } from './db.js';


const dayToEnumMap: Record<number, Days> = {
    1: Days.Monday,
    2: Days.Tuesday,
    3: Days.Wednesday,
    4: Days.Thursday,
    5: Days.Friday,
};

// Schedule mapping: Day (1=Mon ... 5=Fri) -> Class
const SCHEDULE: Record<number, Class> = {
    1: Class.IM1,
    2: Class.IT2,
    3: Class.IM2,
    4: Class.IT1,
    5: Class.IT2
};

export async function getStudentToday() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dailyPerson = await db.dailyPerson.findUnique({
            where: {
                date: today
            },
            include: {
                person: true
            }
        });

        if (dailyPerson) {
            return dailyPerson.person;
        }

        return null;
    } catch (error) {
        console.error('Error fetching student for today:', error);
        return null;
    }
}

export async function prepareStudents() {
    try {
        const today = new Date();
        // Calculate start of the week (Monday)
        // JS getDay(): 0=Sun, 1=Mon, ..., 6=Sat
        const currentDay = today.getDay() || 7; // Convert Sun(0) to 7
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - (currentDay - 1));
        startOfWeek.setHours(0, 0, 0, 0);

        // Iterate through Monday (0) to Friday (4) relative to startOfWeek
        for (let i = 0; i < 5; i++) {
            const checkDate = new Date(startOfWeek);
            checkDate.setDate(startOfWeek.getDate() + i);

            // Map loop index to day number (1=Mon ... 5=Fri)
            const dayNum = i + 1;
            const targetClass = SCHEDULE[dayNum];

            if (!targetClass) continue;

            // Check if already assigned
            const existing = await db.dailyPerson.findUnique({
                where: { date: checkDate }
            });

            if (existing) continue;

            // Find best student for this class
            const student = await selectStudentForClass(targetClass);

            if (student) {
                await db.dailyPerson.create({
                    data: {
                        date: checkDate,
                        personId: student.id
                    }
                });
                console.log(`Assigned ${student.name} (${targetClass}) for ${checkDate.toDateString()}`);
            } else {
                console.warn(`No students found for class ${targetClass} on ${checkDate.toDateString()}`);
            }
        }
    } catch (error) {
        console.error('Error preparing students:', error);
    }
}

async function selectStudentForClass(className: Class) {
    // 1. Get all students in the class
    const students = await db.people.findMany({
        where: { class: className }
    });

    if (students.length === 0) return null;

    // 2. Count usage in the last 180 days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 180);

    const usage = await db.dailyPerson.groupBy({
        by: ['personId'],
        where: {
            date: { gte: cutoffDate },
            person: { class: className }
        },
        _count: { personId: true }
    });

    // Create a map of ID -> Count
    const usageMap = new Map<number, number>();
    usage.forEach(u => usageMap.set(u.personId, u._count.personId));

    // 3. Sort students by usage count (ascending)
    // If counts are equal, this effectively performs a random/stable choice based on DB order
    // To randomize ties, we could add a random factor, but simple round-robin is usually sufficient
    students.sort((a, b) => {
        const countA = usageMap.get(a.id) || 0;
        const countB = usageMap.get(b.id) || 0;
        return countA - countB;
    });

    return students[0];
}