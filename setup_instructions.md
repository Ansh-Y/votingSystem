# Setting Up the Voting System

Follow these steps to properly set up the voting system and fix the registration functionality:

## 1. Set Up the Database

The "Unknown column 'email'" error occurs because your database tables haven't been properly created. Run the database setup script to create all necessary tables:

```
cd backend
npm run setup-db
```

This will:
- Create the voting_db database
- Create all required tables with the proper columns
- Add test users for admin, voters, and candidates

## 2. Restart the Backend Server

After setting up the database, restart your backend server:

```
cd backend
npm run dev
```

## 3. Start the Frontend

In a separate terminal:

```
cd C:\Users\lenovo\voting-system
npm start
```

## 4. Testing Registration

Now you can test the registration functionality:
1. Go to http://localhost:3000/register
2. Fill out the registration form with:
   - Name: Test User
   - Email: test@example.com (use a unique email)
   - Password: Password123 (must contain uppercase, lowercase, and numbers)
   - Role: Voter or Candidate
3. Click Register
4. You should be redirected to the login page

## 5. Using Test Accounts

For testing, you can also use these pre-created accounts:
- Admin: admin@example.com / Admin123
- Voter: voter1@example.com / Voter123
- Candidate: candidate1@example.com / Candidate123

## Troubleshooting

If you still encounter issues:

### Database Problems
- Check the backend console for SQL errors
- Verify that your MySQL server is running
- Make sure your .env file has the correct database credentials

### API Connection Issues
- Check that both servers are running
- Frontend should be on http://localhost:3000
- Backend should be on http://localhost:5000
- Check the browser console for CORS or API errors

### Registration Form Validation
- Passwords must be at least 8 characters and include:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
- Email must be in a valid format
- All fields are required 