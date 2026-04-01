# pulse-video-processing-app# PULSE - Secure Video Analytics & Sensitivity Streaming

PULSE is a full-stack video processing platform that enables users to upload videos, analyze content sensitivity, and stream videos efficiently with real-time progress tracking.

---

## 🚀 Live Application

🔗  https://pulse-app-v0x9.onrender.com
🔗  https://pulse-frontend-1wzo.onrender.com

---

## ✨ Features

* 🎥 Video Upload with Progress Tracking
* ⚡ Real-time Processing using Socket.io
* 🛡️ Sensitivity Classification (Safe / Flagged)
* 🔐 JWT Authentication & Authorization
* 👥 Role-Based Access Control (RBAC)
* 📡 Secure Video Streaming (HTTP Range Requests)
* 🧠 Multi-tenant Data Isolation

---

## 🏗️ Architecture & Design

The application follows a **full-stack client-server architecture**:

### Frontend (React + Vite)

* Built with Tailwind CSS
* Uses Axios for API communication
* Real-time UI updates via Socket.io client

### Backend (Node.js + Express)

* RESTful API architecture
* Handles authentication, uploads, processing, and streaming
* Uses Multer for file uploads

### Real-Time Layer

* Socket.io enables live progress tracking during video processing

### Streaming Engine

* Implements **HTTP 206 Range Requests**
* Streams video in chunks for smooth playback and fast seeking

---

## 🛡️ Security

* JWT-based authentication for protected routes
* Password hashing using bcrypt
* Role-based access control (Admin, Editor, Viewer)
* Strict user-level data isolation

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint           | Description   |
| ------ | ------------------ | ------------- |
| POST   | /api/auth/register | Register user |
| POST   | /api/auth/login    | Login user    |

### Video Management

| Method | Endpoint                | Description         |
| ------ | ----------------------- | ------------------- |
| GET    | /api/videos/list        | Get all user videos |
| POST   | /api/videos/upload      | Upload video        |
| POST   | /api/videos/process/:id | Start processing    |
| DELETE | /api/videos/:id         | Delete video        |

### Streaming

| Method | Endpoint                     | Description  |
| ------ | ---------------------------- | ------------ |
| GET    | /api/videos/stream/:filename | Stream video |

---

## ⚙️ Environment Variables

Create a `.env` file in the backend:

```
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secret
UPLOAD_DIR=./uploads
```

---

## 💻 Local Development

### Backend

```
cd backend
npm install
node server.js
```

### Frontend

```
cd frontend
npm install
npm run dev
```

---

## 🚀 Deployment

The application follows a decoupled architecture, deployed on Render as two separate services: a Vite-React frontend (Static Site) and a Node.js/Express backend (Web Service), communicating via a secure REST API with CORS configuration.

---

## 💡 Usage Notes

### Page Refresh & Video Status
- **Refresh Behavior:** If you refresh the Dashboard, the video player may temporarily reset to a "Select a Video" state. This is expected as the application re-authenticates and re-fetches the latest safety status from the database.
- **Verification:** After a refresh, simply select the video from your library again to see its updated **Safe** or **Flagged** status.
- **Routing:** If you encounter a 404 on refresh in a production environment, ensure your hosting provider (e.g., Render) is configured to redirect all traffic to `index.html`.

 ---


## 🧠 Interview Explanation

This project demonstrates:

* Full-stack application development
* Real-time systems using WebSockets (Socket.io)
* Secure authentication and RBAC implementation
* Efficient video streaming using HTTP range requests
* Cloud database integration using MongoDB Atlas
* End-to-end deployment on Render

---
