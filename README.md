# NameKartAssignment

A modern task management application with real-time notifications, AI-powered insights using Google's Gemini AI, and an intuitive drag-and-drop interface.

## Features

- 📋 Task Management with drag-and-drop functionality
- 📅 Calendar view for task scheduling
- 🔔 Real-time notifications using Socket.IO
- 🤖 AI-powered task insights and suggestions using Gemini AI
- 📱 Responsive design for all devices
- 🌙 Modern Material UI interface
- 🔐 User authentication and authorization

## Tech Stack

### Frontend
- React.js
- Material-UI (MUI)
- React Beautiful DnD
- Socket.IO Client
- Axios
- React Router DOM
- React Hot Toast

### Backend
- Node.js
- Express.js
- MongoDB
- Socket.IO
- JWT Authentication
- Google's Gemini AI API (for intelligent task insights) (through Google AI Studio)
- Node-cron (for scheduled notifications)

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- MongoDB
- npm or yarn
- Git
- Google Cloud account for Gemini AI API access

## Environment Setup

### Backend (.env)
Create a `.env` file in the `backend` directory with the following variables:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
```

### Frontend (.env)
Create a `.env` file in the `frontend` directory with:
```env
VITE_API_URL=http://localhost:5000
```

## AI Insights Feature

The application uses Google's Gemini AI to provide intelligent insights about your tasks. Gemini analyzes your task patterns, deadlines, and completion rates to offer:

- Task prioritization suggestions
- Time management recommendations
- Productivity insights
- Pattern recognition in task completion
- Workload distribution analysis

To use this feature:
1. Get a Gemini API key from Google AI Studio (https://makersuite.google.com/app/apikey)
2. Add the API key to your backend `.env` file
3. Access AI insights through the "Get AI Insights" button in the dashboard

## Installation & Setup

1. Clone the repository:
```bash
git clone https://github.com/AshwinJharia/NameKartAssignment.git
cd NameKartAssignment
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
```

4. Start MongoDB service (if not already running):
```bash
# On Windows
net start MongoDB

# On macOS/Linux
sudo service mongod start
```

5. Start the backend server:
```bash
cd backend
npm run dev
```

6. Start the frontend development server:
```bash
cd frontend
npm run dev
```

The application should now be running at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user

### Tasks
- GET `/api/tasks` - Get all tasks
- POST `/api/tasks` - Create new task
- PUT `/api/tasks/:id` - Update task
- DELETE `/api/tasks/:id` - Delete task
- PATCH `/api/tasks/:id/status` - Update task status
- GET `/api/tasks/insights` - Get AI insights

### Notifications
- GET `/api/notifications` - Get user notifications
- PATCH `/api/notifications/:id/read` - Mark notification as read
- GET `/api/users/notification-settings` - Get notification settings
- PUT `/api/users/notification-settings` - Update notification settings

## Project Structure

```
NameKartAssignment/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   └── App.jsx
│   └── index.html
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request to the [NameKartAssignment repository](https://github.com/AshwinJharia/NameKartAssignment)

## Acknowledgments

- Material-UI for the beautiful components
- React Beautiful DnD for the drag-and-drop functionality
- Google's Gemini AI for intelligent task insights 

## Deployment on Render

### Prerequisites for Deployment
1. Create a [Render](https://render.com) account
2. Create a MongoDB Atlas cluster (for production database)

### Steps to Deploy

1. **Prepare MongoDB Atlas:**
   - Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a database user and get your connection string
   - Whitelist all IP addresses (0.0.0.0/0) for initial testing

2. **Deploy to Render:**
   - Fork this repository to your GitHub account
   - Go to your Render dashboard
   - Click on "New +" and select "Web Service"
   - Connect your GitHub repository
   - Configure the service:
     - Name: `namekart-task-manager-backend`
     - Environment: `Node`
     - Build Command: `cd backend && npm install`
     - Start Command: `cd backend && node server.js`
     - Select the branch to deploy

3. **Set Environment Variables:**
   Add the following environment variables in Render dashboard:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Your secret key for JWT
   - `GEMINI_API_KEY`: Your Gemini AI API key
   - `NODE_ENV`: `production`
   - `PORT`: `10000`

4. **Update Frontend Configuration:**
   Update your frontend `.env` file to point to the Render backend:
   ```env
   VITE_API_URL=https://your-render-service-url
   ```

5. **Deploy Updates:**
   - Any push to the main branch will automatically trigger a new deployment
   - Monitor the deployment in Render dashboard

### Troubleshooting Deployment
- Check Render logs for any deployment errors
- Ensure all environment variables are set correctly
- Verify MongoDB Atlas connection string and network access
- Check if the service is running on the correct port 