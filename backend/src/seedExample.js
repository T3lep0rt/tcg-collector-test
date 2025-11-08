/**
 * Example script showing how to use generateCards function
 *
 * This demonstrates various ways to fetch and store Pokemon cards
 * from the Pokemon TCG API into your database.
 */

import { generateCards } from './generateCards.js';

async function runExamples() {
  console.log('Pokemon Card Generator - Examples\n');
  console.log('=' .repeat(50));

  // Example 1: Generate 10 random cards
  console.log('\n📦 Example 1: Generate 10 random cards');
  console.log('-'.repeat(50));
  await generateCards({
    count: 10
  });

  // Example 2: Generate Charizard cards
  console.log('\n📦 Example 2: Generate Charizard cards');
  console.log('-'.repeat(50));
  await generateCards({
    query: 'name:Charizard',
    count: 5
  });

  // Example 3: Generate cards from a specific set
  console.log('\n📦 Example 3: Generate cards from Base Set');
  console.log('-'.repeat(50));
  await generateCards({
    query: 'set.name:"Base"',
    count: 20
  });

  // Example 4: Generate Fire-type Pokemon
  console.log('\n📦 Example 4: Generate Fire-type Pokemon');
  console.log('-'.repeat(50));
  await generateCards({
    query: 'types:fire',
    count: 15
  });

  // Example 5: Generate rare cards
  console.log('\n📦 Example 5: Generate rare cards');
  console.log('-'.repeat(50));
  await generateCards({
    query: 'rarity:"Rare Holo"',
    count: 10
  });

  // Example 6: Generate cards from recent sets
  console.log('\n📦 Example 6: Generate cards from recent sets');
  console.log('-'.repeat(50));
  await generateCards({
    query: 'set.releaseDate:[2023-01-01 TO *]',
    count: 25
  });

  console.log('\n' + '='.repeat(50));
  console.log('All examples completed! ✨\n');
}

// Run examples if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runExamples()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}

export { runExamples };
