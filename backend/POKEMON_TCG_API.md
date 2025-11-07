# Pokemon TCG API Integration

This backend now includes complete integration with the Pokemon TCG API to fetch card data, artworks, and set information.

## Features

- Fetch all Pokemon TCG cards with pagination and filters
- Search cards by name
- Get card details by ID
- Fetch all Pokemon TCG sets
- Get cards from specific sets
- Filter cards by rarity
- Full card data including images, stats, abilities, attacks, and market prices

## API Endpoints

### 1. Get All Cards
```
GET /api/pokemon-tcg/cards
```

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `pageSize` (number, default: 250, max: 250) - Number of cards per page
- `q` (string) - Search query using Pokemon TCG API syntax
- `orderBy` (string, default: 'name') - Sort field

**Examples:**
```bash
# Get first 250 cards
GET /api/pokemon-tcg/cards

# Get cards from page 2 with 100 cards per page
GET /api/pokemon-tcg/cards?page=2&pageSize=100

# Search for Charizard cards
GET /api/pokemon-tcg/cards?q=name:charizard

# Get cards from Base Set
GET /api/pokemon-tcg/cards?q=set.id:base1

# Get Fire-type Pokemon
GET /api/pokemon-tcg/cards?q=types:fire

# Sort by release date (newest first)
GET /api/pokemon-tcg/cards?orderBy=-set.releaseDate
```

**Response:**
```json
{
  "success": true,
  "cards": [
    {
      "id": "base1-4",
      "name": "Charizard",
      "supertype": "Pokémon",
      "subtypes": ["Stage 2"],
      "hp": "120",
      "types": ["Fire"],
      "abilities": [],
      "attacks": [
        {
          "name": "Energy Burn",
          "cost": ["Fire", "Fire"],
          "convertedEnergyCost": 2,
          "damage": "",
          "text": "As often as you like during your turn..."
        }
      ],
      "weaknesses": [{"type": "Water", "value": "×2"}],
      "retreatCost": ["Colorless", "Colorless", "Colorless"],
      "set": {
        "id": "base1",
        "name": "Base",
        "series": "Base",
        "printedTotal": 102,
        "total": 102,
        "releaseDate": "1999/01/09",
        "images": {
          "symbol": "https://images.pokemontcg.io/base1/symbol.png",
          "logo": "https://images.pokemontcg.io/base1/logo.png"
        }
      },
      "number": "4",
      "artist": "Mitsuhiro Arita",
      "rarity": "Rare Holo",
      "images": {
        "small": "https://images.pokemontcg.io/base1/4.png",
        "large": "https://images.pokemontcg.io/base1/4_hires.png"
      },
      "tcgplayer": {
        "url": "https://prices.pokemontcg.io/tcgplayer/base1-4",
        "prices": {...}
      }
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 250,
    "count": 250,
    "totalCount": 15000
  }
}
```

### 2. Get Card by ID
```
GET /api/pokemon-tcg/cards/:id
```

**Example:**
```bash
GET /api/pokemon-tcg/cards/base1-4
```

**Response:**
```json
{
  "success": true,
  "card": {
    "id": "base1-4",
    "name": "Charizard",
    // ... full card details
  }
}
```

### 3. Search Cards by Name
```
GET /api/pokemon-tcg/cards/search/:name
```

**Query Parameters:**
- `page` (number, default: 1)
- `pageSize` (number, default: 50)

**Examples:**
```bash
# Search for Pikachu
GET /api/pokemon-tcg/cards/search/pikachu

# Search with pagination
GET /api/pokemon-tcg/cards/search/charizard?page=2&pageSize=20
```

### 4. Get All Sets
```
GET /api/pokemon-tcg/sets
```

**Response:**
```json
{
  "success": true,
  "sets": [
    {
      "id": "base1",
      "name": "Base",
      "series": "Base",
      "printedTotal": 102,
      "total": 102,
      "legalities": {
        "unlimited": "Legal"
      },
      "ptcgoCode": "BS",
      "releaseDate": "1999/01/09",
      "updatedAt": "2022/10/10 15:12:00",
      "images": {
        "symbol": "https://images.pokemontcg.io/base1/symbol.png",
        "logo": "https://images.pokemontcg.io/base1/logo.png"
      }
    }
  ]
}
```

### 5. Get Cards from a Specific Set
```
GET /api/pokemon-tcg/sets/:setId/cards
```

**Query Parameters:**
- `page` (number, default: 1)
- `pageSize` (number, default: 250)

**Examples:**
```bash
# Get all cards from Base Set
GET /api/pokemon-tcg/sets/base1/cards

# Get cards with pagination
GET /api/pokemon-tcg/sets/swsh1/cards?page=1&pageSize=100
```

### 6. Get Cards by Rarity
```
GET /api/pokemon-tcg/cards/rarity/:rarity
```

**Query Parameters:**
- `page` (number, default: 1)
- `pageSize` (number, default: 250)

**Rarity Options:**
- Common
- Uncommon
- Rare
- Rare Holo
- Rare Ultra
- Rare Secret
- And more...

**Examples:**
```bash
# Get all Ultra Rare cards
GET /api/pokemon-tcg/cards/rarity/Rare%20Ultra

# Get Rare Holo cards
GET /api/pokemon-tcg/cards/rarity/Rare%20Holo
```

## Card Data Structure

Each card includes:
- **Basic Info**: id, name, supertype, subtypes, level, HP
- **Types**: Pokemon types (Fire, Water, etc.)
- **Evolution**: evolvesFrom field
- **Abilities**: Special abilities with descriptions
- **Attacks**: Attack names, costs, damage, and effects
- **Weaknesses/Resistances**: Type matchups
- **Retreat Cost**: Energy required to retreat
- **Set Information**: Set name, series, release date, symbols
- **Collection Info**: Card number, artist, rarity
- **Images**: Small and large high-quality artwork URLs
- **Market Data**: TCGPlayer and Cardmarket pricing (when available)
- **Legalities**: Format legality information
- **Flavor Text**: Card descriptions
- **Pokedex Numbers**: National Pokedex numbers

## Query Syntax for Advanced Filtering

The `q` parameter supports Pokemon TCG API query syntax:

```
# Search by exact name
q=name:charizard

# Search by type
q=types:fire

# Search by set
q=set.id:base1

# Search by rarity
q=rarity:"Rare Holo"

# Search by HP range
q=hp:[70 TO 120]

# Combine multiple conditions
q=name:pikachu types:electric set.series:base

# Wildcards
q=name:char*  # Cards starting with "char"
```

## Setup

1. The service uses Node.js built-in `fetch` API (Node 18+)
2. No API key required for basic usage
3. No additional dependencies needed beyond existing Express setup

## Testing

Start the backend server:
```bash
cd backend
npm install
npm run dev
```

Test endpoints using curl or your browser:
```bash
# Health check
curl http://localhost:3000/api/health

# Get first page of cards
curl http://localhost:3000/api/pokemon-tcg/cards

# Search for Pikachu
curl http://localhost:3000/api/pokemon-tcg/cards/search/pikachu

# Get all sets
curl http://localhost:3000/api/pokemon-tcg/sets
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Failed to fetch Pokemon TCG cards",
  "details": "Network error details..."
}
```

HTTP Status Codes:
- `200` - Success
- `404` - Card not found
- `500` - Server or external API error

## Rate Limiting

The Pokemon TCG API has rate limits:
- 1000 requests per hour per IP
- For higher limits, get a free API key from https://pokemontcg.io

To add API key support, set environment variable:
```env
POKEMON_TCG_API_KEY=your-api-key-here
```

Then update the service to include the key in request headers.

## Future Enhancements

Potential improvements:
- Add caching layer (Redis) for frequently requested cards
- Implement API key support for higher rate limits
- Add batch import functionality to save cards to database
- Create favorites/wishlist features
- Add price tracking and alerts
- Implement advanced filtering UI
