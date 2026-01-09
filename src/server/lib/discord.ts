
import { env } from "process";
import { db, Days } from "./db.js";
import { getStudentToday } from "./quickFunctions.js";

const APP_URL = env.APP_URL || "http://localhost:3000";

const dayToEnumMap: Record<number, Days> = {
    1: Days.Monday,
    2: Days.Tuesday,
    3: Days.Wednesday,
    4: Days.Thursday,
    5: Days.Friday,
};

/**
 * Helper to get the ISO week number.
 */
function getISOWeek(date: Date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return weekNo;
}

/**
 * Helper to send a raw payload to the Discord webhook.
 * Allows selecting between webhook 1, 2, or 3.
 */
async function sendDiscordMessage(payload: any, webhookIndex: 1 | 2 | 3 = 1) {
    let webhookUrl;
    switch (webhookIndex) {
        case 1:
            webhookUrl = env.DISCORD_WEBHOOK_URL || env.DISCORD_WEBHOOK_URL_1;
            break;
        case 2:
            webhookUrl = env.DISCORD_WEBHOOK_URL_2;
            break;
        case 3:
            webhookUrl = env.DISCORD_WEBHOOK_URL_3;
            break;
        default:
            webhookUrl = env.DISCORD_WEBHOOK_URL;
    }

    if (!webhookUrl) {
        console.warn(`DISCORD_WEBHOOK_URL_${webhookIndex} is not set. Skipping Discord notification.`);
        return;
    }

    try {
        const response = await fetch(webhookUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            console.error(`Failed to send Discord message: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error("Response body:", text);
        }
    } catch (error) {
        console.error("Error sending Discord message:", error);
    }
}

/**
 * Sends a daily update with the name of the responsible student and their tasks.
 * Fetches data directly from the database.
 */
export async function sendDailyUpdate(webhookIndex: 1 | 2 | 3 = 1) {
    try {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
        const prismaDay = dayToEnumMap[dayOfWeek];

        if (!prismaDay) {
            console.log("It's the weekend, no update sent.");
            return;
        }

        const [student, tasks] = await Promise.all([
            getStudentToday(),
            db.tasks.findMany({
                where: {
                    days: {
                        has: prismaDay
                    }
                }
            })
        ]);

        if (!student) {
            console.warn("No student found for today.");
            return;
        }

        const dateStr = today.toLocaleDateString('no-NO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const capitalizedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

        const taskList = tasks.map(t => `• ${t.task}`).join("\n");

        const payload = {
            embeds: [
                {
                    title: `📅 Dagens Ordenselev - ${capitalizedDate}`,
                    color: 0x3498db, // Blue
                    fields: [
                        {
                            name: "Ansvarlig",
                            value: `**${student.name}** (${student.class})`,
                            inline: true
                        },
                        {
                            name: "Oppgaver",
                            value: taskList || "Ingen oppgaver registrert.",
                            inline: false
                        }
                    ],
                    footer: {
                        text: "Ordenselev System"
                    },
                    timestamp: today.toISOString()
                }
            ],
            components: [
                {
                    type: 1, // Action Row
                    components: [
                        {
                            type: 2, // Button
                            style: 5, // Link
                            label: "Åpne App",
                            url: APP_URL
                        }
                    ]
                }
            ]
        };

        await sendDiscordMessage(payload, webhookIndex);
    } catch (error) {
        console.error("Error generating daily update:", error);
    }
}

/**
 * Sends a weekly update with the names of the students responsible for each day of the current week.
 */
export async function sendWeeklyUpdate(webhookIndex: 1 | 2 | 3 = 1) {
    try {
        const today = new Date();
        const weekNumber = getISOWeek(today);

        // Find Monday of the current week
        const day = today.getDay();
        const monday = new Date(today);
        const diff = today.getDate() - day + (day === 0 ? -6 : 1);
        monday.setDate(diff);
        monday.setHours(0, 0, 0, 0);

        const assignments = [];
        for (let i = 0; i < 5; i++) {
            const currentDate = new Date(monday);
            currentDate.setDate(monday.getDate() + i);

            const dayPerson = await db.dailyPerson.findUnique({
                where: {
                    date: currentDate
                },
                include: {
                    person: true
                }
            });

            const dateStr = currentDate.toLocaleDateString('no-NO', { weekday: 'long' });
            const capitalizedDay = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

            if (dayPerson && dayPerson.person) {
                assignments.push(`${capitalizedDay}: **${dayPerson.person.name}** (${dayPerson.person.class})`);
            } else {
                assignments.push(`${capitalizedDay}: *Ingen tildelt*`);
            }
        }

        const payload = {
            embeds: [
                {
                    title: `🗓️ Ukeplan for uke ${weekNumber}`,
                    description: "Her er en oversikt over hvem som skal være ordenselever denne uken:",
                    color: 0x9b59b6, // Purple
                    fields: [
                        {
                            name: "Ukeplan",
                            value: assignments.join("\n"),
                            inline: false
                        }
                    ],
                    footer: {
                        text: "Ordenselev System"
                    },
                    timestamp: new Date().toISOString()
                }
            ],
            components: [
                {
                    type: 1, // Action Row
                    components: [
                        {
                            type: 2, // Button
                            style: 5, // Link
                            label: "Åpne App",
                            url: APP_URL
                        }
                    ]
                }
            ]
        };

        await sendDiscordMessage(payload, webhookIndex);
    } catch (error) {
        console.error("Error sending weekly update:", error);
    }
}

/**
 * Sends a notification when a completion report is submitted.
 * Fetches the specific completion record to ensure we have all task details.
 */
export async function sendCompletion(completionId: number, webhookIndex: 1 | 2 | 3 = 1) {
    try {
        const completion = await db.completions.findUnique({
            where: { id: completionId },
            include: {
                completedTasks: true,
                nonCompletedTasks: true,
                student: true
            }
        });

        if (!completion || !completion.student) {
            console.error(`Completion with ID ${completionId} not found or missing student data.`);
            return;
        }

        const completedTasks = completion.completedTasks || [];
        const nonCompletedTasks = completion.nonCompletedTasks || [];
        const nonCompletedCount = nonCompletedTasks.length;

        let statusColor = 0x2ecc71; // Green
        let title = "✅ Oppgaver fullført!";

        if (nonCompletedCount > 0) {
            statusColor = 0xe74c3c; // Red
            title = "⚠️ Oppgaver delvis utført";
        }

        // Combine all tasks into one list with status
        const allTaskLines = [
            ...completedTasks.map((t: any) => `✅ ${t.task}`),
            ...nonCompletedTasks.map((t: any) => `❌ ${t.task}`)
        ];

        const fields = [
            {
                name: "Utført av",
                value: `**${completion.student.name}** (${completion.student.class})`,
                inline: true
            },
            {
                name: "Oppgaver",
                value: allTaskLines.join("\n") || "Ingen oppgaver markert.",
                inline: false
            }
        ];

        if (completion.comment) {
            fields.push({
                name: "Kommentar",
                value: completion.comment,
                inline: false
            });
        }

        const payload: any = {
            embeds: [
                {
                    title: title,
                    color: statusColor,
                    fields: fields,
                    footer: {
                        text: "Ordenselev System"
                    },
                    timestamp: new Date().toISOString()
                }
            ]
        };

        // Add images if they exist
        if (completion.image) {
            // Discord embeds only support one image directly. 
            // To show multiple, we can either use multiple embeds or just one main one.
            // But we can also use "image" property for the primary one.
            payload.embeds[0].image = {
                url: `${APP_URL}/api/CompletionImage?id=${completion.id}&img=1`
            };

            // If there's a second image, we can add a second embed linked to the first one
            // or just add it as a thumbnail. Let's add a second embed for the second image
            // to make them both visible in the same message.
            payload.embeds.push({
                url: APP_URL, // Common URL to group them
                image: {
                    url: `${APP_URL}/api/CompletionImage?id=${completion.id}&img=2`
                }
            });
        }

        await sendDiscordMessage(payload, webhookIndex);
    } catch (error) {
        console.error("Error sending completion notification:", error);
    }
}
