# 🚀 Mini CRM Web App with AI Assist

A full-stack **Mini CRM (Customer Relationship Management) web application** designed for small businesses to manage contacts, track deals, and use AI to generate personalized follow-up emails.

The application provides a simple **Kanban-style deal pipeline** along with AI-powered assistance to help sales teams save time and improve follow-ups.

---

## 📌 Features

### 🔐 Authentication

* User sign-up and login
* Secure password hashing
* JWT-based authentication
* Protected routes
* Logout functionality

### 👥 Contact Management

* Add new contacts
* Edit contact information
* Delete contacts
* Search contacts
* View contact details
* Store notes and contact information

### 📊 Deal Pipeline

Manage deals using a drag-and-drop Kanban board:

```text
┌─────────┐  ┌────────────┐  ┌───────────┐  ┌──────┐  ┌──────┐
│   New   │→ │ Contacted  │→ │ Qualified │→ │ Won  │  │ Lost │
└─────────┘  └────────────┘  └───────────┘  └──────┘  └──────┘
```

Users can move deals between stages using drag and drop.

Available stages:

* 🆕 New
* 📞 Contacted
* ⭐ Qualified
* ✅ Won
* ❌ Lost

### 🤖 AI Follow-Up Assistant

An AI button generates a personalized follow-up email based on:

* Contact name
* Contact notes
* Deal stage
* Previous context
* Deal information

Example:

```text
Contact:
Rahul Kumar

Deal Stage:
Qualified

Notes:
Interested in our premium plan and asked about pricing.

AI Generated Email:

Subject: Following up on our discussion

Hi Rahul,

Thank you for your interest in our premium plan.
I wanted to follow up regarding the pricing information
we discussed.

Please let me know if you have any questions or if you'd
like to schedule a quick call.

Best regards,
Sales Team
```

### 🔎 Search

Search contacts by:

* Name
* Email
* Company
* Phone number

### 🛡️ REST API

The backend provides REST APIs with:

* Request validation
* Authentication
* Authorization
* Error handling
* Proper HTTP status codes
* Secure API endpoints

---

# 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │      React /         │
                    │      Next.js         │
                    │      Frontend        │
                    └──────────┬───────────┘
                               │
                            REST API
                               │
                               ↓
                    ┌──────────────────────┐
                    │   Node.js + Express  │
                    │      Backend         │
                    └──────┬───────┬───────┘
                           │       │
                           ↓       ↓
                 ┌─────────────┐  ┌─────────────┐
                 │ PostgreSQL/ │  │  LLM API    │
                 │  MongoDB    │  │   (AI)      │
                 └─────────────┘  └─────────────┘
```

---

# 🛠️ Tech Stack

## Frontend

* React.js / Next.js
* JavaScript
* HTML5
* CSS3
* Tailwind CSS
* Axios / Fetch API
* React DnD or dnd-kit

## Backend

* Node.js
* Express.js
* REST API
* JWT Authentication
* bcrypt / Argon2
* API validation

## Database

Choose one:

* PostgreSQL
* MongoDB

## AI

* OpenAI API / Gemini API / other LLM API

## Development Tools

* Git
* GitHub
* VS Code
* Postman
* npm

---

# 📁 Project Structure

```text
mini-crm-ai/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ContactCard.jsx
│   │   │   ├── ContactForm.jsx
│   │   │   ├── KanbanBoard.jsx
│   │   │   ├── DealCard.jsx
│   │   │   └── AIEmailButton.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Contacts.jsx
│   │   │   └── ContactDetails.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   │
│   │   └── App.jsx
│   │
│   └── package.json
│
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── contactController.js
│   │   ├── dealController.js
│   │   └── aiController.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Contact.js
│   │   └── Deal.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── contactRoutes.js
│   │   ├── dealRoutes.js
│   │   └── aiRoutes.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── validationMiddleware.js
│   │
│   ├── services/
│   │   └── aiService.js
│   │
│   ├── config/
│   │   └── database.js
│   │
│   ├── server.js
│   └── package.json
│
├── .gitignore
├── README.md
└── package.json
```

---

# 🗄️ Database Design

## User

```text
User
├── id
├── name
├── email
├── password
└── createdAt
```

## Contact

```text
Contact
├── id
├── userId
├── name
├── email
├── phone
├── company
├── notes
└── createdAt
```

## Deal

```text
Deal
├── id
├── contactId
├── title
├── value
├── stage
├── notes
└── updatedAt
```

### Deal Stages

```text
NEW
CONTACTED
QUALIFIED
WON
LOST
```

---

# 🔗 REST API

## Authentication

### Register

```http
POST /api/auth/register
```

Creates a new user.

### Login

```http
POST /api/auth/login
```

Authenticates the user and returns a JWT token.

---

## Contacts

### Get Contacts

```http
GET /api/contacts
```

Returns all contacts belonging to the authenticated user.

### Get Single Contact

```http
GET /api/contacts/:id
```

Returns a specific contact.

### Create Contact

```http
POST /api/contacts
```

Creates a new contact.

### Update Contact

```http
PUT /api/contacts/:id
```

Updates an existing contact.

### Delete Contact

```http
DELETE /api/contacts/:id
```

Deletes a contact.

### Search Contacts

```http
GET /api/contacts/search?q=rahul
```

Searches contacts.

---

# 💼 Deal APIs

### Get Deals

```http
GET /api/deals
```

Returns deals for the authenticated user.

### Create Deal

```http
POST /api/deals
```

Creates a new deal.

### Update Deal Stage

```http
PATCH /api/deals/:id/stage
```

Updates the Kanban stage.

Example:

```json
{
  "stage": "QUALIFIED"
}
```

### Delete Deal

```http
DELETE /api/deals/:id
```

Deletes a deal.

---

# 🤖 AI API

### Generate Follow-Up Email

```http
POST /api/ai/follow-up
```

Example request:

```json
{
  "contactId": "123",
  "dealId": "456"
}
```

The backend collects the contact and deal information and sends relevant context to the LLM.

Example response:

```json
{
  "subject": "Following up on your interest",
  "email": "Hi Rahul, Thank you for..."
}
```

---

# 🔐 Authentication Flow

The application uses JWT authentication.

```text
User
 ↓
Login
 ↓
Backend verifies credentials
 ↓
Generate JWT
 ↓
Frontend stores authentication state
 ↓
API request
 ↓
JWT Middleware
 ↓
Verify Token
 ↓
Access Protected Resource
```

Passwords are never stored in plain text.

They are hashed before being stored in the database.

---

# 🤖 AI Workflow

The AI follow-up feature works as follows:

```text
User clicks "AI Follow-Up"
            ↓
Frontend sends contact/deal ID
            ↓
Backend authenticates request
            ↓
Fetch contact + deal information
            ↓
Build structured AI prompt
            ↓
Send request to LLM API
            ↓
Validate AI response
            ↓
Return email draft
            ↓
User reviews and edits
            ↓
Send email manually
```

The AI is designed to **draft** the message rather than automatically sending it.

---

# ⚙️ Installation

## 1. Clone the Repository

```bash
git clone https://github.com/yourusername/mini-crm-ai.git
```

```bash
cd mini-crm-ai
```

---

# Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=5000

DATABASE_URL=your_database_url

JWT_SECRET=your_jwt_secret

LLM_API_KEY=your_llm_api_key
```

Start the backend:

```bash
npm run dev
```

Backend will run on:

```text
http://localhost:5000
```

---

# Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

The frontend will run on the URL provided by Vite/Next.js.

---

# 🔑 Environment Variables

Never commit API keys or secrets to GitHub.

Example:

```env
DATABASE_URL=
JWT_SECRET=
LLM_API_KEY=
```

Add `.env` to `.gitignore`:

```gitignore
node_modules/
.env
.env.local
dist/
```

---

# 🧪 Testing

The REST API can be tested using **Postman**.

Test cases should include:

* User registration
* User login
* Invalid credentials
* Create contact
* Update contact
* Delete contact
* Search contact
* Create deal
* Change deal stage
* Generate AI email
* Invalid API requests
* Unauthorized requests

Example:

```text
POST /api/auth/login
        ↓
200 OK

POST /api/contacts
        ↓
201 Created

GET /api/contacts
        ↓
200 OK
```

---

# 🛡️ Error Handling

The backend uses centralized error handling.

Example response:

```json
{
  "success": false,
  "message": "Contact not found"
}
```

Common HTTP status codes:

```text
200 → Success
201 → Created
400 → Bad Request
401 → Unauthorized
403 → Forbidden
404 → Not Found
409 → Conflict
429 → Too Many Requests
500 → Internal Server Error
```

---

# 📊 Stretch Goals

## 1. AI Contact Summary

Generate an AI summary of all interactions with a contact.

Example:

```text
Contact Summary

Rahul is interested in the premium plan.
He contacted the company twice and requested
pricing information. Current deal stage is Qualified.
```

## 2. Analytics Dashboard

Add a dashboard showing:

* Total contacts
* Total deals
* Deals won
* Deals lost
* Conversion rate
* Deals won per month
* Total pipeline value

Example:

```text
Total Contacts       250
Active Deals          48
Deals Won             21
Deals Lost             9
Conversion Rate      42%
```

---

# 🚀 Future Improvements

* Email integration
* WhatsApp notifications
* Calendar integration
* AI lead scoring
* AI-generated contact summaries
* Sales activity timeline
* Role-based access control
* Team management
* Real-time notifications
* Advanced analytics
* Export contacts to CSV
* Import contacts from CSV
* Automated follow-up reminders

---

# 🔒 Security Considerations

The application should:

* Hash passwords using bcrypt/Argon2
* Use HTTPS in production
* Validate all user input
* Protect API routes
* Use JWT expiration
* Store secrets in environment variables
* Configure CORS properly
* Apply API rate limiting
* Sanitize database queries
* Never expose LLM API keys to the frontend

---

# 🌐 Deployment

A possible production setup:

```text
                GitHub
                   │
          ┌────────┴────────┐
          ↓                 ↓
      Frontend            Backend
      Vercel              Render/AWS
                            │
                            ↓
                       PostgreSQL
                      Supabase/Neon
                            │
                            ↓
                         LLM API
```

---

# 🎯 Project Objective

The goal of this project is to demonstrate how a modern full-stack application can combine:

* Authentication
* CRUD operations
* REST APIs
* Database management
* Drag-and-drop UI
* AI integration
* API validation
* Error handling
* Analytics

into a practical CRM solution for small businesses.

---

# 👨‍💻 Author

**Debasish Pradhan**

B.Tech Computer Science Engineering

### Technologies

`React` `Node.js` `Express.js` `PostgreSQL` `MongoDB` `REST API` `JWT` `AI/LLM` `Git` `GitHub`

---

# ⭐ If You Like This Project

If you find this project useful, consider giving the repository a ⭐ on GitHub.

```text
Built with ❤️ using JavaScript, Node.js, React and AI.
```
