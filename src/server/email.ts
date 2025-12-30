import dotenv from 'dotenv';

dotenv.config();

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const TEACHER_EMAIL = process.env.TEACHER_EMAIL || 'teacher@example.com'; // Fallback or from env

interface SubmissionData {
    ordenselev: string;
    date: string;
    weekNumber: number;
    completedTasks: string[];
    images: string[]; // base64 strings
}

export async function sendReport(data: SubmissionData): Promise<boolean> {
    if (!BREVO_API_KEY) {
        console.error('BREVO_API_KEY is missing');
        return false;
    }

    const htmlContent = `
    <h1>Ordenselev Rapport</h1>
    <p><strong>Dato:</strong> ${data.date}</p>
    <p><strong>Uke:</strong> ${data.weekNumber}</p>
    <p><strong>Ordenselev:</strong> ${data.ordenselev}</p>
    
    <h2>Fullførte oppgaver:</h2>
    <ul>
      ${data.completedTasks.map(task => `<li>${task}</li>`).join('')}
    </ul>

    <h2>Bilder:</h2>
    <p>Se vedlegg for bilder.</p>
  `;


    // Prepare attachments
    const attachments = data.images.map((img, index) => {
        // Remove data:image/png;base64, prefix
        const content = img.split(',')[1];
        return {
            content: content,
            name: `bilde_${index + 1}.jpg`,
        };
    });

    const attachmentsClean = attachments.length > 0 ? attachments : undefined;

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': BREVO_API_KEY,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: { name: "Ordenselev App", email: "elev399942@chamedia.no" },
                to: [{ email: TEACHER_EMAIL }],
                subject: `Ordenselev Rapport - Uke ${data.weekNumber} - ${data.date}`,
                htmlContent: htmlContent,
                attachment: attachmentsClean
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Brevo API Error:', errorText);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Failed to send email:', error);
        return false;
    }
}
