# TCG Collector

A full-stack application for managing trading card game (TCG) collections.

## Tech Stack

### Frontend
- **Vite** - Fast build tool and dev server
- **React** - UI library
- **Tailwind CSS** - Utility-first CSS framework

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **Prisma** - Modern database ORM
- **PostgreSQL** - Database

## Project Structure

```
tcg-collector-test/
├── frontend/           # React frontend application
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── backend/            # Node.js backend API
│   ├── src/
│   │   ├── index.js
│   │   └── db.js
│   ├── prisma/
│   │   └── schema.prisma
│   ├── .env
│   ├── .env.example
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL (v12 or higher)

### Installation

1. **Install Frontend Dependencies**
```bash
cd frontend
npm install
```

2. **Install Backend Dependencies**
```bash
cd backend
npm install
```

3. **Set Up Database**
```bash
cd backend
# Copy environment variables
cp .env.example .env

# Update DATABASE_URL in .env with your PostgreSQL connection string
# Example: postgresql://user:password@localhost:5432/tcg_collector?schema=public

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate
```

### Running the Application

1. **Start Backend Server** (from `backend/` directory)
```bash
npm run dev
```
Server will run on http://localhost:3000

2. **Start Frontend Dev Server** (from `frontend/` directory)
```bash
npm run dev
```
Frontend will run on http://localhost:5173

### Available Scripts

#### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

#### Backend
- `npm run dev` - Start development server with hot reload
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)

## Features

- **User Authentication** - Secure registration and login with bcrypt password hashing
- **User Profiles** - Each user has their own profile with username, bio, and avatar
- **Personal Collections** - Each user maintains their own private card collection
- **Session Management** - Persistent login sessions stored in PostgreSQL
- **Protected Routes** - Collection pages require authentication
- **Card Management** - Add, view, and delete cards in your collection
- **Collection Statistics** - Track total cards, unique cards, and sets

## Database Schema

The application includes the following models:

### User
- `id` - UUID primary key
- `email` - Unique email address
- `password` - Hashed password
- `name` - Optional display name
- `username` - Optional unique username
- `bio` - Optional biography
- `avatar` - Optional avatar image URL
- `createdAt` - Account creation timestamp
- `updatedAt` - Last update timestamp
- Relationship: One-to-many with Cards

### Card
- `id` - UUID primary key
- `name` - Card name
- `set` - Set identifier
- `rarity` - Card rarity
- `condition` - Card condition
- `quantity` - Number of copies
- `imageUrl` - Optional card image URL
- `notes` - Optional notes
- `userId` - Foreign key to User
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

See `backend/prisma/schema.prisma` for the complete schema.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/:id` - Get user profile (public)
- `PUT /api/users/profile` - Update own profile (protected)
- `GET /api/users/:id/collection` - Get user's collection (public)

### Cards (All Protected)
- `GET /api/cards` - Get current user's cards
- `GET /api/cards/:id` - Get single card
- `POST /api/cards` - Add card to collection
- `PUT /api/cards/:id` - Update card
- `DELETE /api/cards/:id` - Delete card
- `GET /api/cards/stats/summary` - Get collection statistics

### System
- `GET /api/health` - Health check endpoint
- `GET /api` - Welcome message

## Environment Variables

### Backend (.env)
```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://user:password@localhost:5432/tcg_collector?schema=public"
SESSION_SECRET="your-secret-key-here"
FRONTEND_URL="http://localhost:5173"
```

## Development

The frontend is configured to proxy API requests to the backend server. All requests to `/api/*` will be forwarded to `http://localhost:3000`.

### First Time Setup

After running migrations, you'll need to run `npm install` in both the frontend and backend directories to install all dependencies including:

**Backend:**
- bcrypt - Password hashing
- express-session - Session management
- connect-pg-simple - PostgreSQL session store
- pg - PostgreSQL client

**Frontend:**
- react-router-dom - Routing

### Running Migrations

The migrations in `backend/prisma/migrations/` will:
1. Add authentication fields to User model (password, username, bio, avatar)
2. Create session table for express-session

Run migrations with:
```bash
cd backend
npm run prisma:migrate
```

## License

MIT
