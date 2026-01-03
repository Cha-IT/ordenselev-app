# Ordenselev App

A comprehensive web application designed to manage and track daily student duties ("ordenselev"). This app facilitates the assignment of students to daily tasks, allows for task completion tracking with image verification, and provides a history view for administrators.

## Features

- **Automated Assignment**: Automatically assigns students to daily duties based on their class schedule and past assignment history ensuring fair distribution.
- **Daily Checklists**: Provides a checklist of tasks specific to the current day of the week.
- **Proof of Completion**: Allows students to upload images as proof of task completion.
- **History Tracking**: Keeps a record of all completed duties, including submitted images and comments.
- **Admin/Teacher View**: Secure history view to monitor performance over time.
- **Responsive Design**: Built with Chakra UI for a modern, mobile-friendly interface.

## Tech Stack

- **Frontend**: React, Vite, Chakra UI, Framer Motion
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Prisma ORM
- **Utilities**: `node-cron` for scheduling, `sharp` for image processing

## Prerequisites

Before you begin, ensure you have multiple terminals available and the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [PostgreSQL](https://www.postgresql.org/)

## Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd ordenselev-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env` file in the root directory based on `.envexample`.
    ```bash
    cp .envexample .env
    ```
    Update the `.env` file with your specific configuration:
    - `DATABASE_URL`: Your PostgreSQL connection string.
    - `TEACHER_EMAIL`: Email for notifications (if enabled).
    - `BREVO_API_KEY`: API key for email services (if enabled).
    - `VITE_API_BASE_URL`: URL for the backend API (default: `http://localhost:3000/api`).
    - `VITE_HISTORY_PASSCODE`: Passcode for accessing the history page.

4.  **Database Setup:**
    Push the schema to your database.
    ```bash
    npx prisma db push
    ```
    (Optional) Seed the database if a seed script is provided or use Prisma Studio to add initial data.

## Running the Application

You need to run both the backend server and the frontend client.

1.  **Start the Backend Server:**
    ```bash
    npm run server
    ```
    The server typically runs on port 3000.

2.  **Start the Frontend Client:**
    In a new terminal window:
    ```bash
    npm run dev
    ```
    The client will typically run on `http://localhost:5173`.

3.  **Manage Database (Optional):**
    To view and edit database validation records directly:
    ```bash
    npx prisma studio
    ```

## Project Structure

- `src/client`: React frontend application code.
- `src/server`: Express backend server code.
- `prisma`: Database schema and migrations.
- `public`: Static assets.

## Scripts

- `npm run dev`: Start the Vite dev server.
- `npm run server`: Start the backend Express server.
- `npm run build`: Build the frontend for production.
- `npm run lint`: Run ESLint.
