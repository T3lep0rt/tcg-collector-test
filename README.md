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
- **SQLite** - Database (easily swappable with PostgreSQL/MySQL)

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

## Database Schema

The application includes example models for:
- **User** - User accounts
- **Card** - TCG card collection items

See `backend/prisma/schema.prisma` for the complete schema.

## API Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api` - Welcome message

## Development

The frontend is configured to proxy API requests to the backend server. All requests to `/api/*` will be forwarded to `http://localhost:3000`.

## License

MIT
