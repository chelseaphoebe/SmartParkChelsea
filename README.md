# SmartPark-Chelsea

SmartPark-Chelsea is a fullstack Smart Parking Web Application prototype built for a Fullstack Developer Intern case study.  
It helps users find available parking slots and allows admins to manage parking lots and simulate real-time slot status changes.

---

## Table of Contents
- Project Overview
- Tech Stack
- Application's Architecture
- Database Schema
- Technology Choices
- API Design
- Error Handling
- Challenges & Future Improvements

## Project Overview
SmartPark-Chelsea implements the MVP for a smart parking system:
- Users can register, login, view parking lots and slot availability, and book available slots.
- Admins can create/update/delete parking lots, create slots, update slot status (AVAILABLE / RESERVED / OCCUPIED), clear slots, and view analytics.

Bonus features implemented:
- Admin analytics
- Booking System

## Application's Architecture
+=====================================================================================+
|                                      Frontend                                        |
+=====================================================================================+
| - React (Vite)                                                                       |
| - React Router DOM                                                                   |
| - Tailwind CSS                                                                       |
| - Context API (Authentication State)                                                 |
|                                                                                      |
| Responsibilities:                                                                    |
| • Renders UI for login, parking lots, slot details, and admin pages                  |
| • Calls REST API using fetch() / Axios                                               |
| • Stores JWT token in memory via Context API                                         |
| • Sends Authorization: Bearer <token> with protected requests                        |
+---------------------------------------------▲---------------------------------------+
                                              | HTTP (JSON)
                                              | Authorization Header (JWT)
                                              ▼
+=====================================================================================+
|                                      Backend                                        |
+=====================================================================================+
| - Node.js + Express                                                                  |
| - REST API Endpoints (Auth, Lots, Slots, Admin)                                      |
| - JWT Authentication & Role-Based Access Control                                     |
| - Controllers + Routes + Middleware                                                  |
| - Socket.io (real-time "slot-updated" events)                                        |
| - Mongoose Models (User, ParkingLot, ParkingSlot)                                    |
|                                                                                      |
| Responsibilities:                                                                    |
| • Validates requests and enforces access rules                                       |
| • Handles booking, check-in, clear-slot workflows                                    |
| • Communicates with MongoDB through Mongoose                                         |
| • Emits real-time updates when slot status changes                                   |
+---------------------------------------------▲---------------------------------------+
                                              | Mongoose ODM
                                              |
                                              ▼
+=====================================================================================+
|                                      Database                                        |
+=====================================================================================+
|                                      MongoDB                                         |
|--------------------------------------------------------------------------------------|
| Collections:                                                                         |
| • users                                                                              |
| • parking_lots                                                                       |
| • parking_slots                                                                      |
|                                                                                      |
| Responsibilities:                                                                    |
| • Stores user information, hashed passwords, and roles                               |
| • Stores parking lots and their metadata                                             |
| • Stores slot states, reservations, and expiry times                                 |
+=====================================================================================+

## Database Schema
+------------------+                               +----------------------------+
|    parking_lots  | 1                           N |      parking_slots         |
+------------------+-------------------------------+----------------------------+
| PK  _id          |                               | PK  _id                    |
|     name         |                               |     lot (FK → parking_lots)| 
|     capacity     |<------------------------------|     code (String)          |
|     description  |   (1 parking lot has many     |     status (String)        |
|     createdAt    |            slots)             |     bookedBy (FK → users)  |
|     updatedAt    |                               |     bookingExpiry (Date)   |
+------------------+                               |     createdAt              |
                                                   |     updatedAt              |
                                                   +----------------------------+
+------------------+
|      users       |
+------------------+
| PK  _id          |
|     name         |
|     email        |
|     passwordHash |
|     role         |
|     createdAt    |
|     updatedAt    |
+------------------+

(Users do not have direct FK links to lots,
but can be associated to parking_slots via bookedBy.)

## Technology Choices

### Overall Stack: MERN (MongoDB, Express, React, Node.js)

I chose the MERN stack because it cleanly separates the backend and frontend, which fits the architecture required for this project and makes development easier to manage. MERN also allows me to work entirely in JavaScript end-to-end, making API development and integration with React more seamless.

### Backend
- Node.js + Express — I chose Express because it’s one of the most widely used backend frameworks, and it's well-suited for building REST APIs. I found it straightforward to learn and flexible enough to handle authentication, routing, and admin/user permissions cleanly.
- MongoDB + Mongoose — I selected MongoDB because its document-based structure fits naturally with the parking lot and parking slot data model. Mongoose helped simplify schema definitions and database queries. 
- JWT Authentication — I implemented JWT because it integrates smoothly with SPAs and keeps the backend stateless. It also aligns well with modern authentication patterns.
- bcryptjs — I used bcryptjs for secure password hashing. It’s lightweight, easy to set up, and commonly used in Node-based applications.
- dotenv & cors — These are essential utilities for managing environment variables and enabling secure cross-origin requests, especially when developing frontend and backend separately.

### Frontend
- React — I’ve used React in several of my past projects, so it allows me to build pages quickly with a structure I’m already comfortable with.
- Vite — I prefer Vite because it’s extremely fast and I’ve consistently had a smooth development with it.
- React Router DOM 
- React Context API
- Tailwind CSS — I use Tailwind often, and its utility-first approach helps me style UI faster and more consistently across components.
- Axios

## API Design

This project uses a RESTful API design. Each controller manages a single resource (auth, lots, slots, admin). All endpoints return JSON responses.
Authentication uses JWT, passed in Authorization: Bearer <token>.

### AUTH ROUTES — /api/auth
- POST /api/auth/register
Register a new user.

Body Example
{
  "name": "Chelsea",
  "email": "chelsea@example.com",
  "password": "password123"
}

Response
{
  "message": "User registered successfully",
  "user": {
    "id": "67a0b4...",
    "name": "Chelsea",
    "email": "chelsea@example.com",
    "role": "USER"
  }
}

- POST /api/auth/login
Authenticate user and return JWT token.

Body Example
{
  "email": "admin@example.com",
  "password": "admin123"
}

Response
{
  "user": {
    "id": "67a0c1...",
    "name": "Admin",
    "email": "admin@example.com",
    "role": "ADMIN"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI..."
}

### PARKING LOT ROUTES — /api/lots
- GET /api/lots
List all parking lots with summarized availability.

Response Example
[
  {
    "_id": "67a0d...",
    "name": "Mall A - Floor 1",
    "capacity": 15,
    "totalSlots": 15,
    "availableSlots": 12
  }
]

- POST /api/lots (ADMIN)
Create a new parking lot and auto-generate its slots.

Body Example
{
  "name": "Mall C - Level 2",
  "capacity": 20
}

- PUT /api/lots/:lotId (ADMIN)
Update lot details (name, capacity).
Automatically adds or removes slots based on capacity.

Body Example
{
  "name": "Mall C - Updated Level",
  "capacity": 25
}

- DELETE /api/lots/:lotId (ADMIN)
Delete a parking lot (only allowed if no slots are OCCUPIED).

### PARKING SLOT ROUTES — /api/slots
- GET /api/slots/lot/:lotId
Get all slots for a specific lot.
Returns bookedBy (populated) and bookingExpiry.

Response Example
[
  {
    "_id": "67a0ef...",
    "code": "A1",
    "status": "AVAILABLE"
  },
  {
    "_id": "67a0f1...",
    "code": "A2",
    "status": "RESERVED",
    "bookedBy": {
      "_id": "67a04c...",
      "username": "chelsea"
    },
    "bookingExpiry": "2025-01-21T12:30:00.000Z"
  }
]

- POST /api/slots/lot/:lotId (ADMIN)
Create multiple slots for a lot.

Body Example
{
  "slots": [
    { "code": "C1" },
    { "code": "C2" }
  ]
}

- PUT /api/slots/:slotId/book (USER)
Book an AVAILABLE slot → sets:
status = "RESERVED"
bookedBy = userId
bookingExpiry = +30 minutes

Response Example
{
  "_id": "67a0f1...",
  "code": "A3",
  "status": "RESERVED",
  "bookedBy": {
    "_id": "67a04c...",
    "username": "chelsea"
  },
  "bookingExpiry": "2025-01-21T12:30:00.000Z"
}

- PUT /api/slots/:slotId/occupy (ADMIN)
Mark a slot as occupied (Check-in).
Allowed for AVAILABLE or RESERVED slots.

Response Example
{
  "_id": "67a0f1...",
  "code": "A3",
  "status": "OCCUPIED"
}

- PUT /api/slots/:slotId (ADMIN)
Manually update slot status.

Body Example
{
  "status": "AVAILABLE"
}

- PUT /api/slots/:slotId/clear (ADMIN)
Reset slot → AVAILABLE
Removes:
bookedBy
bookingExpiry

### ADMIN ROUTES — /api/admin
- GET /api/admin/statistics (ADMIN)
Returns occupancy data per lot + overall totals.

Response Example
{
  "lotStatistics": [
    {
      "lotId": "67a0d...",
      "lotName": "Mall A - Floor 1",
      "totalSlots": 15,
      "occupiedSlots": 3,
      "availableSlots": 12,
      "occupancyPercentage": 20
    }
  ],
  "overallStatistics": {
    "totalSlots": 27,
    "totalOccupied": 5,
    "totalAvailable": 22,
    "occupancyPercentage": 18
  }
}

## Error Handling

My application handles errors consistently using structured JSON messages across all API endpoints. The main categories of errors include:

1. Unauthenticated User
If a user accesses a protected route without a valid JWT:
Missing token → 401 Unauthorized
Invalid or expired token → 401 Unauthorized
Token refers to a deleted user → 401 Unauthorized

Examples:

{ "error": "No token provided" }

{ "error": "Unauthorized" }

2. Unauthorized Role Access
If a USER tries to access an ADMIN-only endpoint:
Returns 403 Forbidden

Example:

{ "error": "Forbidden" }

3. Invalid Payload / Missing Fields
Triggered when required data is missing or invalid:
Missing name/email/password → 400 Bad Request
Email already used → 400 Bad Request
Invalid login credentials → 400 Bad Request
Invalid slot status → 400 Bad Request
Trying to reduce lot capacity below safe level → 400 Bad Request

Examples:

{ "error": "Missing fields" }

{ "error": "Invalid credentials" }

{ "error": "Invalid status" }

4. Resource Not Found
For invalid IDs or deleted items:
Lot not found → 404 Not Found
Slot not found → 404 Not Found

Example:

{ "error": "Lot not found" }

5. Business Rule Violations
Handled properly with 400 Bad Request:
Booking a slot that is not AVAILABLE
Deleting a lot that still has OCCUPIED slots
Occupying a slot that cannot transition to OCCUPIED

Examples:

{ "error": "Slot is not available" }

{ "error": "Cannot delete lot. Some slots are still occupied." }

6. Internal Server Errors
All unexpected errors fall into a consistent catch-all:
Returns 500 Internal Server Error

Example:

{ "error": "Server error" }

## Challenges & Future Improvements

If I had another week, I would refine and extend the booking system that I’ve already implemented. While users can currently book a slot, I would expand this into a complete Booking & Check-in/Check-out flow, including dedicated endpoints and a bookings table to properly track which user owns each reservation. I would also enhance the UI/UX—especially on the lot details and booking screens—to make the experience smoother, clearer, and more intuitive, with better visual feedback and interaction design.

# How to Run the Application

1. Clone the Repository
git clone https://github.com/chelseaphoebe/SmartPark-Chelsea
cd SmartPark-Chelsea

2. Install Dependencies
Backend
cd backend
npm install

Frontend
cd ../frontend
npm install

3. Set Up Environment Variables
Create a .env file inside the backend folder:
backend/.env
MONGO_URI=mongodb://127.0.0.1:27017/smartpark
JWT_SECRET=yourjwtsecret

If you use a cloud DB (MongoDB Atlas), replace MONGO_URI accordingly.
No env variables are needed for the frontend.

4. Run the Database Seed
The seed script creates:
1 Admin → admin@example.com / admin123
1 User → user@example.com / user123
Sample Parking Lots
Auto-generated Parking Slots

Run:
cd backend
npm run seed

If successful, you’ll see:
MongoDB connected
Admin user created
Regular user created
Sample parking lots and slots created
Seed completed safely.

5. Start the Backend Server
From the backend folder:
npm run dev

Backend runs on:
http://localhost:5000

6. Start the Frontend Server
From the frontend folder:
npm run dev

Frontend runs on:
http://localhost:5173

7. Access the Application
Frontend: http://localhost:5173
Backend API: http://localhost:5000

Login as Admin or User to test the full flow.
