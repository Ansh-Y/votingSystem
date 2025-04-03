 # Voting System

A secure, full-stack voting application built with React.js, Node.js, Express, and MySQL. The system allows for electronic voting with role-based access control for administrators, candidates, and voters.

## Features

- **User Authentication**: Secure login and registration system with JWT
- **Role-Based Access**: Different interfaces for administrators, candidates, and voters
- **Poll Management**: Create, edit, and close polls (Admin)
- **Voting**: Secure voting process with duplicate vote prevention
- **Results**: Real-time vote counting and result display
- **Security**: Password hashing, input validation, and protected routes

## Tech Stack

### Frontend
- React.js
- React Router for navigation
- Axios for API requests
- CSS for styling

### Backend
- Node.js
- Express.js
- MySQL for database
- JSON Web Tokens (JWT) for authentication
- bcrypt for password hashing

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)

### Installation

1. Clone the repository:
```
git clone https://github.com/yourusername/voting-system.git
cd voting-system
```

2. Install dependencies for frontend and backend:
```
npm install
cd backend && npm install
```

3. Set up the database:
   - Create a MySQL database
   - Use the schema in `backend/config/schema.sql` to set up tables
   - Configure your database connection in `backend/.env`

4. Start the development server:
```
npm run dev
```

This will start both the frontend (React) and backend (Express) servers.

## Database Structure

- **users**: Stores user information with roles (admin, candidate, voter)
- **polls**: Stores poll information (title, description, dates, status)
- **poll_candidates**: Maps candidates to specific polls
- **votes**: Records each vote

## Environment Variables

Create a `.env` file in the backend directory with the following variables:
```
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=voting_db
JWT_SECRET=your_secure_jwt_secret_key
```

## Application Flow

1. **Authentication**:
   - Users register with name, email, password, and role
   - Login generates a JWT token used for protected routes

2. **Admin Dashboard**:
   - Create new polls with title, description, dates, and candidates
   - View active polls and results
   - End ongoing polls

3. **Voter Dashboard**:
   - View active polls
   - Cast votes for candidates
   - View poll results after voting

4. **Candidate Dashboard**:
   - View polls they are participating in
   - Track voting progress and results

## Security Considerations

- Passwords are hashed using bcrypt
- Strict input validation on both client and server
- JWT tokens with expiration
- API rate limiting to prevent brute force attacks
- SQL query parameterization to prevent injection

## License

This project is licensed under the ISC License.