# Pokemon Card Data Generator

This guide explains how to use the `generateCards` function to populate your database with Pokemon card data from the official Pokemon TCG API.

## Overview

The `generateCards` function fetches real Pokemon card data from the [Pokemon TCG API](https://pokemontcg.io/) and stores it in your PostgreSQL database. It includes features like:

- Fetch cards by name, set, type, rarity, and more
- Automatic duplicate detection
- Rate limiting to respect API limits
- Comprehensive card data including images, stats, and pricing
- Progress logging and statistics

## Quick Start

### Using npm scripts

```bash
# Generate 50 random Pokemon cards
npm run seed

# Run example scenarios
npm run seed:examples
```

### Using the CLI directly

```bash
# Generate 100 random cards
node src/generateCards.js --count 100

# Generate Pikachu cards
node src/generateCards.js --query "name:Pikachu" --count 20

# Generate cards from a specific set
node src/generateCards.js --query "set.name:Base" --count 50

# Show help
node src/generateCards.js --help
```

## Usage Examples

### 1. Generate Random Cards

```javascript
import { generateCards } from './generateCards.js';

await generateCards({
  count: 50
});
```

### 2. Search by Pokemon Name

```javascript
await generateCards({
  query: 'name:Charizard',
  count: 10
});
```

### 3. Filter by Set

```javascript
// Base Set cards
await generateCards({
  query: 'set.name:"Base"',
  count: 20
});

// Sword & Shield series
await generateCards({
  query: 'set.series:"Sword & Shield"',
  count: 50
});
```

### 4. Filter by Type

```javascript
// Fire-type Pokemon
await generateCards({
  query: 'types:fire',
  count: 25
});

// Water-type Pokemon
await generateCards({
  query: 'types:water',
  count: 25
});
```

### 5. Filter by Rarity

```javascript
// Rare Holo cards
await generateCards({
  query: 'rarity:"Rare Holo"',
  count: 15
});

// Ultra Rare cards
await generateCards({
  query: 'rarity:"Ultra Rare"',
  count: 10
});
```

### 6. Filter by Supertype

```javascript
// Only Pokemon cards (not Trainer or Energy)
await generateCards({
  query: 'supertype:Pokemon',
  count: 100
});

// Trainer cards
await generateCards({
  query: 'supertype:Trainer',
  count: 20
});
```

### 7. Combine Multiple Filters

```javascript
// Fire-type rare Pokemon from recent sets
await generateCards({
  query: 'types:fire rarity:"Rare Holo" set.releaseDate:[2023-01-01 TO *]',
  count: 30
});
```

### 8. Filter by HP

```javascript
// High HP Pokemon (100+)
await generateCards({
  query: 'hp:[100 TO *]',
  count: 50
});
```

## API Query Syntax

The Pokemon TCG API supports rich query syntax:

### Basic Queries
- `name:Pikachu` - Search by name
- `supertype:Pokemon` - Filter by supertype
- `types:fire` - Filter by type
- `subtypes:EX` - Filter by subtype
- `hp:100` - Exact HP value

### Set Queries
- `set.name:"Base"` - Exact set name
- `set.series:"XY"` - Set series
- `set.releaseDate:2023-01-01` - Specific release date

### Range Queries
- `hp:[100 TO 200]` - HP between 100-200
- `set.releaseDate:[2023-01-01 TO *]` - From date onwards
- `set.total:[1 TO 100]` - Sets with 1-100 cards

### Rarity Values
- `Common`
- `Uncommon`
- `Rare`
- `Rare Holo`
- `Rare Ultra`
- `Rare Secret`
- And more...

### Combining Queries
Use spaces to combine multiple conditions (AND logic):
```
types:fire rarity:"Rare Holo" hp:[100 TO *]
```

## Function Options

```javascript
generateCards({
  query: '',              // Search query (default: '')
  count: 50,              // Number of cards to fetch (default: 50)
  skipDuplicates: true    // Skip cards that already exist (default: true)
})
```

## Card Data Schema

Each card includes the following data:

| Field | Type | Description |
|-------|------|-------------|
| cardId | String | Pokemon TCG API unique ID |
| name | String | Card name |
| set | String | Set ID |
| setName | String | Set name |
| number | String | Card number in set |
| rarity | String | Card rarity |
| types | JSON | Pokemon types (e.g., ["Fire", "Flying"]) |
| supertype | String | Pokemon, Trainer, or Energy |
| subtypes | JSON | Subtypes (e.g., ["Stage 2", "EX"]) |
| hp | String | Hit points |
| artist | String | Card artist |
| flavorText | String | Flavor text |
| attacks | JSON | Attack data |
| weaknesses | JSON | Weakness data |
| resistances | JSON | Resistance data |
| retreatCost | JSON | Retreat cost |
| prices | JSON | TCGPlayer pricing data |
| imageUrl | String | Small image URL |
| imageUrlHiRes | String | Large image URL |

## Command Line Options

```bash
node src/generateCards.js [options]

Options:
  -q, --query <query>     Search query
  -c, --count <number>    Number of cards to generate (default: 50)
  --no-skip               Don't skip duplicate cards
  -h, --help              Show help message
```

## Tips

1. **Start Small**: Test with a small count first (10-20 cards) to ensure everything works
2. **Use Specific Queries**: Targeted queries are faster and more efficient
3. **Check for Duplicates**: The script automatically skips duplicates by default
4. **Rate Limiting**: The script includes automatic rate limiting between API calls
5. **Monitor Progress**: Watch the console output for detailed progress information

## API Documentation

For more query options and details, see the official [Pokemon TCG API documentation](https://docs.pokemontcg.io/).

## Troubleshooting

### No cards found
- Check your query syntax
- Try a broader search
- Verify the Pokemon TCG API is accessible

### Duplicate key errors
- The script skips duplicates by default
- Use `--no-skip` flag only if you want to allow duplicates

### Network errors
- The API may be rate limiting
- Wait a few minutes and try again
- Reduce the count value

## Examples in Code

Check `src/seedExample.js` for comprehensive examples of different query patterns and use cases.
