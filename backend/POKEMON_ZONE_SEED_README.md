# Pokemon Zone Card Seeder

This script fetches Pokemon TCG Pocket card data from [pokemon-zone.com](https://www.pokemon-zone.com) and populates your database.

## Overview

The script scrapes card information from Pokemon Zone's expansion pages and creates card entries in your database. It's adapted from the original PHP script to work with the Node.js/Prisma framework.

## Features

- **Web Scraping**: Automatically fetches card data from pokemon-zone.com
- **HTML Parsing**: Extracts card details including:
  - Pokemon name
  - Card number
  - Rarity (0-7 scale based on icon symbols)
  - Booster pack information
  - Card images (webp format)
- **Duplicate Detection**: Skips cards that already exist in the database
- **Multiple Expansions**: Supports fetching from multiple expansion sets
- **Rate Limiting**: Includes 500ms delay between requests to avoid overwhelming the server

## Supported Expansions

Currently configured to fetch from:
- **Genetic Apex** (A1) - `https://www.pokemon-zone.com/sets/a1/`
- **Promo A** - `https://www.pokemon-zone.com/sets/promo-a/`
- **Mythical Island** (A1a) - `https://www.pokemon-zone.com/sets/a1a/`

## Usage

### Prerequisites

1. Ensure dependencies are installed:
   ```bash
   npm install
   ```

2. Ensure database is set up and migrated:
   ```bash
   npm run prisma:migrate
   ```

### Running the Script

```bash
node prisma/seedFromPokemonZone.js
```

### Output

The script provides detailed console output:
```
===== Starting Pokemon Zone Card Seeder =====

--- Processing expansion: Genetic Apex ---
Fetching card links from: https://www.pokemon-zone.com/sets/a1/
Found 226 card links

Processing card 1/226: https://www.pokemon-zone.com/cards/001
  Name: Bulbasaur
  Number: #1
  Rarity: 1
  Booster: Charizard
  ✓ Created card: Bulbasaur (#1)

...

✓ Finished processing Genetic Apex
  Total cards processed: 226
  New cards added: 226
  Skipped (already exist): 0
  Errors: 0

===== Seeding Complete =====
```

## Database Schema Mapping

The script maps pokemon-zone.com data to the Prisma Card model:

| Pokemon Zone | Prisma Field | Notes |
|--------------|--------------|-------|
| Pokemon Name | `name` | Extracted from `<h1>` tag |
| Card Number | `number` | From card metadata |
| Expansion Name | `set` and `setName` | E.g., "Genetic Apex" |
| Rarity Icons | `rarity` | Converted to 0-7 scale |
| Image URL | `imageUrl` | WebP format, full URL |
| Booster Pack | `notes` | Stored as "Booster: {pack name}" |
| - | `condition` | Defaults to "Near Mint" |
| - | `quantity` | Defaults to 1 |

## Rarity Calculation

The script calculates rarity based on icon symbols:

- **Diamond Icon** (`icon-diamond`): Base multiplier = 0
- **Star Icon** (`icon-star`): Base multiplier = 4
- **Crown Icon** (`icon-crown`): Base multiplier = 7

Final rarity = Base multiplier + Number of icons shown

Examples:
- 1 diamond = 0 + 1 = 1 (Common)
- 3 diamonds = 0 + 3 = 3 (Uncommon)
- 1 star = 4 + 1 = 5 (Rare)
- 2 stars = 4 + 2 = 6 (Very Rare)
- 1 crown = 7 + 1 = 8 (Ultra Rare)

## Adding More Expansions

To add additional expansions, edit the `main()` function in `seedFromPokemonZone.js`:

```javascript
async function main() {
  console.log('===== Starting Pokemon Zone Card Seeder =====\n');

  // Add new expansions here:
  await generateCardsForExpansion('https://www.pokemon-zone.com/sets/YOUR_SET/', 'Your Set Name');

  console.log('\n===== Seeding Complete =====');
}
```

## Optional: Clear Existing Data

To start with a fresh database, uncomment these lines in the `main()` function:

```javascript
// console.log('Clearing existing cards...');
// await prisma.card.deleteMany({});
// console.log('Existing cards cleared\n');
```

## Technical Details

### Implementation

- **HTTP Requests**: Uses Node.js built-in `fetch()` (Node 18+)
- **HTML Parsing**: Regex-based parsing for specific HTML patterns
- **Database**: Prisma ORM with PostgreSQL
- **Error Handling**: Continues processing on individual card failures

### Functions

#### `fetchCardLinks(url)`
Fetches all card links from an expansion page.

**Parameters:**
- `url` - Expansion page URL

**Returns:** Array of card URLs

#### `generateCardsForExpansion(url, expansionName)`
Processes all cards from an expansion and adds them to the database.

**Parameters:**
- `url` - Expansion page URL
- `expansionName` - Display name for the expansion

**Returns:** Array of results (card data or errors)

#### `extractRarity(html)`
Extracts rarity value from HTML based on rarity icon classes.

**Parameters:**
- `html` - HTML content

**Returns:** Rarity number (0-7)

## Comparison with Original PHP Script

The original PHP script functionality has been preserved:

| Feature | PHP Script | Node.js Script |
|---------|-----------|----------------|
| HTML Fetching | `file_get_contents()` | `fetch()` |
| HTML Parsing | DOMDocument, DOMXPath | RegEx |
| Database | PDO (MySQL) | Prisma (PostgreSQL) |
| Duplicate Check | `SELECT COUNT(*)` | `prisma.card.findFirst()` |
| Error Handling | Try/catch with `@` suppression | Try/catch with logging |
| Rate Limiting | None | 500ms delay |

## Troubleshooting

### "Cannot find package '@prisma/client'"
Ensure dependencies are installed:
```bash
cd backend
npm install
npm run prisma:generate
```

### "Database connection error"
Check your `.env` file contains a valid `DATABASE_URL`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/tcg_collector?schema=public"
```

### "403 Forbidden" from pokemon-zone.com
The script includes User-Agent headers, but the site may be blocking requests. Try:
- Adding more delay between requests (increase timeout in the code)
- Running the script at different times
- Checking if the website structure has changed

### Cards not being created
- Check console output for specific errors
- Verify the database is accessible
- Ensure Prisma migrations are up to date: `npm run prisma:migrate`

## Notes

- The script respects the source website with appropriate delays
- Card images are linked (not downloaded) to save space
- The script is idempotent - safe to run multiple times
- Progress is logged in real-time for monitoring

## Future Enhancements

Potential improvements:
- Parallel fetching with concurrency limits
- Download and store images locally
- Support for additional card attributes (HP, attacks, etc.)
- Progress resumption on interruption
- Export/import functionality
