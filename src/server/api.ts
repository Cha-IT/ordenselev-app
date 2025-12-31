import express from 'express';
import { sendReport } from './email.js';

const router = express.Router();

// API Routes
router.post('/submit', async (req, res) => {
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

export default router;