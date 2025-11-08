# Pokemon Zone Card Seeder

This script fetches Pokemon TCG Pocket card data from [pokemon-zone.com](https://www.pokemon-zone.com) and populates your database.

## Overview

The script **automatically discovers and scrapes** all available sets from Pokemon Zone's sets page, then fetches card information from each expansion and creates card entries in your database. It's adapted from the original PHP script to work with the Node.js/Prisma framework.

## Features

- **Automatic Set Discovery**: Automatically fetches all available sets from pokemon-zone.com/sets/
- **Web Scraping**: Fetches card data from all discovered expansion pages
- **HTML Parsing**: Extracts card details including:
  - Pokemon name
  - Card number
  - Rarity (0-7 scale based on icon symbols)
  - Booster pack information
  - Card images (webp format)
- **Duplicate Detection**: Skips cards that already exist in the database
- **Set-Based Filtering**: Stores cards with set slugs (e.g., "a1", "promo-a") for easy filtering
- **Rate Limiting**: Includes 500ms delay between cards and 1s delay between sets
- **Progress Tracking**: Real-time progress reporting and overall statistics

## Supported Expansions

The script automatically discovers **all available sets** from pokemon-zone.com including:
- **Genetic Apex** (a1)
- **Promo A** (promo-a)
- **Mythical Island** (a1a)
- And any new sets added to the website in the future!

## Important: Cloudflare Protection

Pokemon-zone.com is protected by **Cloudflare bot detection** which blocks simple HTTP requests. We provide two versions of the script:

### ✅ Recommended: Puppeteer Version (Bypasses Cloudflare)

Uses a headless Chrome browser to bypass Cloudflare's protection.

**Pros:**
- ✅ Works reliably with Cloudflare protection
- ✅ Handles JavaScript challenges automatically
- ✅ More robust against anti-bot measures

**Cons:**
- Slower (launches a browser)
- Higher resource usage
- Requires Chromium installation

### ⚠️ Alternative: Fetch Version (May be blocked)

Uses Node.js native fetch - faster but blocked by Cloudflare.

**Pros:**
- Faster execution
- Lower resource usage

**Cons:**
- ❌ Currently blocked by Cloudflare (HTTP 403)
- May work if Cloudflare protection is relaxed

## Usage

### Prerequisites

1. **Install dependencies** (including Puppeteer):
   ```bash
   npm install
   ```

   Note: Puppeteer will automatically download Chromium (~170-280MB)

2. **Ensure database is set up and migrated:**
   ```bash
   npm run prisma:migrate
   ```

### Running the Script

**Recommended (Puppeteer version):**
```bash
npm run seed:pokemon-zone
```

**Alternative (Fetch version - currently blocked by Cloudflare):**
```bash
npm run seed:pokemon-zone:fetch
```

### Output

The script provides detailed console output:
```
===== Starting Pokemon Zone Card Seeder =====

Fetching available sets from: https://www.pokemon-zone.com/sets/
Found 3 sets

📦 Sets to process:
  1. Genetic Apex (a1) - https://www.pokemon-zone.com/sets/a1/
  2. Promo A (promo-a) - https://www.pokemon-zone.com/sets/promo-a/
  3. Mythical Island (a1a) - https://www.pokemon-zone.com/sets/a1a/

--- Processing expansion: Genetic Apex ---
Set slug: a1
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

============================================================
📊 OVERALL SUMMARY
============================================================
Total Sets Found:      3
Sets Processed:        3
Total Cards Processed: 450
New Cards Added:       450
Cards Skipped:         0
Errors:                0
============================================================

✅ Seeding Complete!

💡 Tip: You can now filter cards by set using the "set" field (slug format)
   Example sets: a1, promo-a, a1a
```

## Database Schema Mapping

The script maps pokemon-zone.com data to the Prisma Card model:

| Pokemon Zone | Prisma Field | Notes |
|--------------|--------------|-------|
| Pokemon Name | `name` | Extracted from `<h1>` tag |
| Card Number | `number` | From card metadata |
| Set Slug | `set` | E.g., "a1", "promo-a", "a1a" (for filtering) |
| Expansion Name | `setName` | E.g., "Genetic Apex" (for display) |
| Rarity Icons | `rarity` | Converted to 0-7 scale |
| Image URL | `imageUrl` | WebP format, full URL |
| Booster Pack | `notes` | Stored as "Booster: {pack name}" |
| - | `condition` | Defaults to "Near Mint" |
| - | `quantity` | Defaults to 1 |

## Filtering by Set

Cards are now stored with **set slugs** for easy filtering. You can filter cards by set in your API queries:

### Example API Query
```javascript
// Get all cards from Genetic Apex set
const geneticApexCards = await prisma.card.findMany({
  where: {
    set: 'a1'
  }
});

// Get all promo cards
const promoCards = await prisma.card.findMany({
  where: {
    set: 'promo-a'
  }
});

// Get all cards from Mythical Island
const mythicalIslandCards = await prisma.card.findMany({
  where: {
    set: 'a1a'
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

## Automatic Set Discovery

The script automatically discovers all sets from pokemon-zone.com/sets/ - **no manual configuration needed!**

When new sets are added to Pokemon Zone, simply run the script again and it will automatically:
1. Discover the new sets
2. Fetch all cards from those sets
3. Add them to your database

You don't need to modify any code to support new expansions.

## Optional: Clear Existing Data

To start with a fresh database, uncomment these lines in the `main()` function:

```javascript
// console.log('Clearing existing cards...');
// await prisma.card.deleteMany({});
// console.log('Existing cards cleared\n');
```

## Technical Details

### Two Implementations

**1. seedFromPokemonZonePuppeteer.js** (Recommended)
- **Browser Automation**: Uses Puppeteer with headless Chrome
- **Cloudflare Bypass**: Executes JavaScript to pass bot challenges
- **React Content Waiting**: Waits for `.card-grid` elements to ensure client-side rendered content loads
- **HTML Parsing**: Regex-based parsing after page load
- **Database**: Prisma ORM with PostgreSQL
- **Performance**: Slower but reliable

**2. seedFromPokemonZone.js** (Fallback)
- **HTTP Requests**: Uses Node.js built-in `fetch()` (Node 18+)
- **HTML Parsing**: Regex-based parsing for specific HTML patterns
- **Database**: Prisma ORM with PostgreSQL
- **Performance**: Fast but blocked by Cloudflare
- **Error Handling**: Continues processing on individual card failures

### Functions

#### `fetchAllSets()`
Automatically discovers all available sets from pokemon-zone.com/sets/.

**Returns:** Array of set objects with `{ url, name, slug }` properties

#### `fetchCardLinks(url)`
Fetches all card links from an expansion page.

**Parameters:**
- `url` - Expansion page URL

**Returns:** Array of card URLs

#### `generateCardsForExpansion(url, expansionName, setSlug)`
Processes all cards from an expansion and adds them to the database.

**Parameters:**
- `url` - Expansion page URL
- `expansionName` - Display name for the expansion
- `setSlug` - Set identifier slug (e.g., "a1", "promo-a")

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

### "Cannot find package '@prisma/client'" or "Cannot find module 'puppeteer'"
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
**This is Cloudflare bot protection.** Solutions:

1. **Use the Puppeteer version (recommended):**
   ```bash
   npm run seed:pokemon-zone
   ```

2. **If Puppeteer fails:**
   - Ensure Chromium downloaded successfully (check during `npm install`)
   - Try running with visible browser (change `headless: 'new'` to `headless: false` in code)
   - Check system has enough resources (~500MB RAM for browser)

3. **If both versions fail:**
   - Website may have updated their protection
   - Try running at different times (off-peak hours)
   - Contact site administrators for API access

### Puppeteer "Error: Failed to launch the browser process"
**Linux users:** Install required dependencies:
```bash
sudo apt-get install -y \
  chromium-browser \
  libx11-xcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxi6 \
  libxtst6 \
  libnss3 \
  libcups2 \
  libxss1 \
  libxrandr2 \
  libasound2 \
  libatk1.0-0 \
  libgtk-3-0
```

**Windows/Mac:** Puppeteer should work out of the box with `npm install`

### Cards not being created
- Check console output for specific errors
- Verify the database is accessible
- Ensure Prisma migrations are up to date: `npm run prisma:migrate`

## Notes

- The script **automatically discovers all sets** - no manual updates needed when new sets are released
- **Puppeteer version is recommended** to bypass Cloudflare bot protection
- Card filtering by set is easy using the `set` field (slug format)
- The script respects the source website with appropriate delays (500ms between cards, 2s between sets for Puppeteer)
- Card images are linked (not downloaded) to save space
- The script is idempotent - safe to run multiple times
- Progress is logged in real-time for monitoring
- Overall statistics are provided at the end of the run
- Puppeteer will download ~170-280MB of Chromium on first install

## Future Enhancements

Potential improvements:
- Parallel fetching with concurrency limits
- Download and store images locally
- Support for additional card attributes (HP, attacks, etc.)
- Progress resumption on interruption
- Export/import functionality
- Better set name extraction (currently uses basic pattern matching)
- Support for filtering sets before processing (e.g., only process specific sets)
