# Pokemon TCG Pocket Card Seeder - TCGdex API

This seed script fetches Pokemon TCG Pocket card data from the **TCGdex API** and populates your database.

## Why TCGdex API?

**TCGdex API is the recommended solution** for seeding Pokemon TCG Pocket cards:

✅ **Free & Fast** - No authentication required, instant responses
✅ **No Cloudflare** - No bot detection or rate limiting issues
✅ **Official Data** - Comprehensive, accurate card information
✅ **Well-Maintained** - Active community and regular updates
✅ **Complete Coverage** - All Pokemon TCG Pocket sets and cards
✅ **High-Quality Images** - Card images in multiple resolutions
✅ **Multilingual** - Supports 9 languages

## Quick Start

```bash
cd backend
npm run seed:tcgdex
```

That's it! The script will:
1. Fetch all Pokemon TCG Pocket sets from TCGdex
2. Process each set and download card data
3. Save cards to your PostgreSQL database

## What Gets Seeded

The script automatically fetches **all Pokemon TCG Pocket cards** including:

- **Sets**: A1 (Genetic Apex), A2, A3, A4, Promo-A, Promo-B, etc.
- **Card Data**: Name, ID, number, rarity, types, HP, attacks, weaknesses, resistances
- **Images**: Standard and high-resolution card images
- **Metadata**: Artist, retreat cost, set information

## Database Schema Mapping

TCGdex data maps to your Prisma schema as follows:

| TCGdex Field | Prisma Field | Notes |
|--------------|--------------|-------|
| `id` | `cardId` | Unique TCGdex identifier (e.g., "tcgp-A1-001") |
| `name` | `name` | Card name |
| `localId` | `number` | Card number in set (e.g., "001") |
| Set ID | `set` | For filtering (e.g., "A1", "A2") |
| Set name | `setName` | Display name (e.g., "Genetic Apex") |
| `rarity` | `rarity` | Card rarity |
| `types` | `types` | JSON array of types |
| `category` | `supertype` | Pokemon, Trainer, Energy |
| `hp` | `hp` | Hit points |
| `illustrator` | `artist` | Card artist name |
| `attacks` | `attacks` | JSON array of attack data |
| `weaknesses` | `weaknesses` | JSON object |
| `resistances` | `resistances` | JSON object |
| `retreat` | `retreatCost` | JSON array |
| `image` | `imageUrl` | Standard resolution |
| `image` (high) | `imageUrlHiRes` | High resolution |

## Features

### Automatic Set Discovery
The script automatically discovers all sets in the Pokemon TCG Pocket series - no manual configuration needed!

### Duplicate Prevention
Cards are checked by their unique `cardId` before insertion. Re-running the script is safe and will only add new cards.

### Progress Tracking
Real-time console output shows:
- Sets being processed
- Cards being added
- Skipped duplicates
- Any errors encountered
- Final statistics summary

### Error Handling
- Continues processing if individual cards fail
- Reports errors without stopping the entire process
- Provides detailed error messages for debugging

## Example Output

```
===== Pokemon TCG Pocket Seeder (TCGdex API) =====

Fetching Pokemon TCG Pocket series data...
  Fetching: https://api.tcgdex.net/v2/en/series/tcgp

Found 14 sets in Pokemon TCG Pocket series:
  1. Genetic Apex (A1)
  2. Mythical Island (A2)
  3. Cosmic Guardians (A3)
  ...

--- Processing set: Genetic Apex (A1) ---
  Fetching: https://api.tcgdex.net/v2/en/sets/A1
  Found 226 cards in set
  Processing: Bulbasaur (001)
    ✓ Added to database
  Processing: Ivysaur (002)
    ✓ Added to database
  ...

✓ Finished Genetic Apex
  Total: 226 | Added: 226 | Skipped: 0 | Errors: 0

============================================================
📊 SEEDING SUMMARY
============================================================
Sets Found:            14
Sets Processed:        14
Total Cards:           1,200
Cards Added:           1,200
Cards Skipped:         0
Errors:                0
============================================================

✅ Seeding Complete!
```

## Filtering Cards by Set

After seeding, you can filter cards by set:

```javascript
// Get all cards from Genetic Apex (A1)
const cards = await prisma.card.findMany({
  where: {
    set: 'A1'
  }
});

// Get all promo cards
const promos = await prisma.card.findMany({
  where: {
    set: {
      startsWith: 'promo'
    }
  }
});

// Get unique list of all sets
const sets = await prisma.card.findMany({
  select: {
    set: true,
    setName: true
  },
  distinct: ['set']
});
```

## Comparison: TCGdex vs Web Scraping

| Feature | TCGdex API | Web Scraping |
|---------|-----------|--------------|
| Speed | ⚡ Very Fast (~2-3 min) | 🐌 Slow (~30-60 min) |
| Reliability | ✅ Always works | ⚠️ Cloudflare blocks |
| Data Quality | ✅ Structured & accurate | ⚠️ Parsing required |
| Maintenance | ✅ Zero maintenance | ❌ Breaks with site updates |
| Rate Limits | ✅ None | ⚠️ Must add delays |
| Legal | ✅ Official API | ⚠️ Gray area |

## Alternative: Web Scraping

If you still want to use web scraping (not recommended), two scripts are available:

```bash
# Puppeteer-based (bypasses Cloudflare but slow)
npm run seed:pokemon-zone

# Fetch-based (fast but blocked by Cloudflare)
npm run seed:pokemon-zone:fetch
```

See `POKEMON_ZONE_SEED_README.md` for web scraping documentation.

## API Reference

**TCGdex API Documentation**: https://tcgdex.dev

**Key Endpoints Used**:
- `GET /v2/en/series/tcgp` - Get all Pokemon TCG Pocket sets
- `GET /v2/en/sets/{setId}` - Get set with card list
- `GET /v2/en/cards/{cardId}` - Get full card details

**No authentication required!**

## Troubleshooting

### "Cannot find package '@prisma/client'"
```bash
npm install
npm run prisma:generate
```

### "Database connection error"
Check your `.env` file has a valid `DATABASE_URL`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/tcg_collector?schema=public"
```

### API Request Failures
TCGdex is very reliable, but if you encounter issues:
- Check your internet connection
- Verify https://api.tcgdex.net is accessible
- Check TCGdex status: https://tcgdex.dev/discord

## Contributing

Found an issue or want to improve the seeder? Contributions are welcome!

## Credits

- **TCGdex**: https://tcgdex.dev - Free Pokemon TCG API
- **Pokemon TCG Pocket**: Official mobile game by The Pokemon Company
- **Prisma**: Modern ORM for database access

## License

This seed script is part of your TCG Collector application. Card data and images are provided by TCGdex and belong to their respective copyright holders.
