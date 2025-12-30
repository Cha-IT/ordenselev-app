import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendReport } from './email.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Increase limit for base64 images
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// API Routes
app.post('/api/submit', async (req, res) => {
    try {
        const data = req.body;
        console.log('Received submission:', data.ordenselev);

        const success = await sendReport(data);

        if (success) {
            res.status(200).json({ message: 'Rapport sendt' });
        } else {
            res.status(500).json({ message: 'Kunne ikke sende e-post' });
        }
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Intern serverfeil' });
    }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    // Assuming dist is at root level relative to where script runs
    // Adjust path as needed based on build structure
    app.use(express.static(path.join(__dirname, '../../dist')));

    app.get('*', (_req, res) => {
        res.sendFile(path.join(__dirname, '../../dist/index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
