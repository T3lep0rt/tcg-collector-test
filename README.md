# TCG Collector

A beautiful full-stack application for managing trading card game (TCG) collections with a Pokemon TCG Pocket-inspired design.

## Features

- 🎨 **Pokemon TCG Pocket-Style UI** - Beautiful card display with holographic effects
- ✨ **3D Hover Effects** - Interactive card animations with shimmer effects
- 🔍 **Advanced Filtering** - Filter by set, rarity, and sort options
- 📊 **Collection Stats** - Track your total cards, sets, and rare cards
- 💫 **Responsive Design** - Works perfectly on desktop and mobile
- 🎯 **Card Details Modal** - Click any card to view detailed information
- 🌈 **Gradient Backgrounds** - Modern, eye-catching color schemes

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
│   │   ├── components/
│   │   │   ├── Card.jsx          # Individual card component with 3D effects
│   │   │   └── CardGrid.jsx      # Grid layout with filters and stats
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── backend/            # Node.js backend API
│   ├── src/
│   │   ├── index.js    # Express server with card endpoints
│   │   └── db.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js     # Sample Pokemon cards seed data
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

# (Optional) Seed the database with sample Pokemon cards
npm run prisma:seed
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
- `npm run prisma:seed` - Seed database with sample Pokemon cards

## Database Schema

The application includes models for:
- **User** - User accounts (for future authentication)
- **Card** - TCG card collection items with fields:
  - `name` - Card name
  - `set` - Card set/collection
  - `rarity` - Card rarity (Common, Uncommon, Rare Holo, etc.)
  - `condition` - Card condition (Mint, Near Mint, Lightly Played, etc.)
  - `quantity` - Number of copies owned
  - `imageUrl` - URL to card image
  - `notes` - Additional notes

See `backend/prisma/schema.prisma` for the complete schema.

## API Endpoints

### System
- `GET /api/health` - Health check endpoint
- `GET /api` - Welcome message

### Cards
- `GET /api/cards` - Get all cards in collection
- `GET /api/cards/:id` - Get a specific card by ID
- `POST /api/cards` - Create a new card
- `PUT /api/cards/:id` - Update a card
- `DELETE /api/cards/:id` - Delete a card

## Development

The frontend is configured to proxy API requests to the backend server. All requests to `/api/*` will be forwarded to `http://localhost:3000`.

### Demo Mode

The application includes demo data that will be displayed if the backend is not running. This allows you to preview the UI without setting up the database.

## UI Features

### Card Display
- **Holographic Effects**: Cards shimmer with a rainbow gradient on hover
- **3D Transforms**: Cards scale and lift when you hover over them
- **Rarity Badges**: Special badges for rare and holographic cards
- **Quantity Indicators**: Shows how many copies you own
- **Responsive Grid**: Adapts from 2 columns on mobile to 6 on large screens

### Filtering & Sorting
- Filter by **Set** (Base Set, Fossil, etc.)
- Filter by **Rarity** (Common, Rare Holo, etc.)
- Sort by **Name**, **Set**, **Rarity**, or **Quantity**

### Collection Stats
- Total number of cards
- Number of unique sets
- Count of rare cards
- Total quantity across all cards

## Troubleshooting

### Frontend shows "Using demo data" message
- This means the backend server is not running or not accessible
- Start the backend server with `npm run dev` from the `backend/` directory
- Make sure the backend is running on port 3000

### Database connection errors
- Check that PostgreSQL is running
- Verify your `DATABASE_URL` in the `.env` file
- Make sure you've run `npm run prisma:migrate`

### Cards not displaying images
- The seed data uses Pokemon TCG API images
- If images don't load, check your internet connection
- You can add custom cards with your own image URLs

## Future Enhancements

- User authentication and multiple collections
- Advanced search functionality
- Card value tracking
- Export collection to CSV/PDF
- Mobile app version
- Trading/wishlist features

## License

MIT
