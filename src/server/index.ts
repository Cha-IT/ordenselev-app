import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './api.js';
import { initCronJobs } from './lib/cron.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Increase limit for base64 images
app.use(express.json({ limit: '10mb' }));
app.use(cors());

app.use(apiRoutes);
initCronJobs();

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
