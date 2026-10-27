# Student Course Management System

A course-learning application with student registration and login, course browsing and enrollment, learning modules and quizzes, progress tracking, profiles, certificates, and administrative course management.

## Stack

- React, JavaScript, and CSS with Vite and React Router
- Axios for API requests
- Node.js, Express, and MongoDB with Mongoose
- jsPDF for course certificate downloads

## Requirements

- Node.js and npm
- MongoDB available to the backend

## Setup

Install frontend dependencies in the project root:

```sh
npm install
```

Configure `backend/.env` with `MONGO_URI` and optionally `PORT` (defaults to `5001`). Then install backend dependencies:

```sh
cd backend
npm install
```

## Create an Admin Account

To create an admin account, configure these values in your local `backend/.env` file (replace the placeholders with your own values):

```dotenv
MONGO_URI=<your-MongoDB-connection-string>
ADMIN_EMAIL=<admin-email-address>
ADMIN_PASSWORD=<private-password-of-at-least-12-characters>
```

Use an email address for the admin and a password of at least 12 characters. The `.env` file is ignored by Git; do not commit it or share its values.

From the `backend` directory, run:

```sh
node scripts/createAdmin.js
```

The script creates an admin only when the normalized email is not already registered. If an account already exists, it makes no changes; it does not promote the account or reset its password. The script does not print the password or its hash.

Run the backend and frontend in separate terminals:

```sh
cd backend
npm run dev
```

```sh
npm run dev
```

Vite serves the frontend at the URL printed in its terminal, normally `http://localhost:5173`.

## Checks

From the project root:

```sh
npm run build
npm run lint
```

## Security Notes

Student authentication and password reset currently use browser local storage and are not suitable for production accounts. Do not commit `.env` files, credentials, tokens, or real student data. Review authentication, authorization, and password storage before production deployment.
