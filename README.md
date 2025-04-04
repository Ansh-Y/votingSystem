# Voting System

A secure, modern, and responsive voting application built with React.js, Node.js, Express, and MySQL. This system provides a user-friendly platform for conducting polls with different role-based interfaces for administrators and voters.

## Features

- **User Authentication**: Secure login and registration with JWT and password hashing
- **Role-Based Access**: 
  - **Admin**: Create and manage polls, view results
  - **Voters**: Vote on active polls, view past polls and results
- **Modern UI**: Responsive design that works on all devices
- **Real-time Results**: View live results with visual progress bars
- **Poll Management**: Create, start, and end polls with specified durations

## Tech Stack

### Frontend
- React 18
- React Router v6 for navigation
- Axios for API requests
- CSS3 with custom variables and responsive design

### Backend
- Node.js with Express.js
- MySQL database for data storage
- JWT for authentication
- bcrypt for password security

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- Git

### Installation

1. Clone the repository:
```
git clone <repository-url>
cd voting-system
```

2. Install dependencies for both frontend and backend:
```
npm install
cd backend && npm install && cd ..
```

3. Set up the database:
```
npm run setup-db
```
This will create the database, tables, and sample users.

### Running the Application

#### Option 1: One-command startup (Windows)
```
npm run start-all
```
This will:
- Set up the database
- Start the backend server
- Start the React development server
- Open separate terminal windows for each process

#### Option 2: Manual startup
1. Start the backend server:
```
cd backend
node server.js
```

2. In a new terminal, start the frontend:
```
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3000/api

## Using the Application

### Test Accounts
The database setup includes these sample accounts:

| Role      | Email                   | Password    |
|-----------|-------------------------|-------------|
| Admin     | admin@example.com       | Admin123    |
| Voter     | voter1@example.com      | Voter123    |
| Voter     | voter2@example.com      | Voter123    |

### Admin Workflow
1. Login with admin credentials
2. Create new polls with options and set start/end dates
3. View and manage all polls in different states (pending, ongoing, ended)
4. Start pending polls or end active polls
5. View voting results for all polls

### Voter Workflow
1. Register as a new voter or login with existing credentials
2. View the list of ongoing polls
3. Select a poll to vote in
4. Cast your vote by selecting an option
5. View results of polls you've already voted in

## Application Structure

```
voting-system/
├── backend/             # Node.js/Express backend
│   ├── config/          # Database configuration
│   ├── middleware/      # Auth middleware
│   ├── routes/          # API routes
│   └── server.js        # Server entry point
├── public/              # Public assets
└── src/                 # React frontend
    ├── components/      # React components
    ├── context/         # Context providers (Auth)
    ├── services/        # API services
    ├── styles.css       # Global styles
    └── App.js           # Main app component
```

## Security Features

- JWT-based authentication with token expiration
- Password hashing with bcrypt
- Input validation and sanitization
- Role-based access control for API endpoints
- Protection against duplicate votes

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure MySQL is running
   - Check credentials in backend/.env file
   - Try running the setup script again: `npm run setup-db`

2. **Login Issues**
   - Make sure you're using the correct credentials
   - Check that the database was properly initialized
   - Try registering a new account

3. **API Connection Errors**
   - Verify both frontend and backend servers are running
   - Check the browser console for CORS errors
   - Ensure the API baseURL in src/services/api.js matches the backend port

## License

This project is licensed under the ISC License.