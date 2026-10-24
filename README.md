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
