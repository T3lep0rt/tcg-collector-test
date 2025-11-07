import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleCards = [
  {
    name: 'Charizard',
    set: 'Base Set',
    rarity: 'Rare Holo',
    condition: 'Near Mint',
    quantity: 1,
    imageUrl: 'https://images.pokemontcg.io/base1/4_hires.png',
    notes: 'Classic first edition look'
  },
  {
    name: 'Pikachu',
    set: 'Base Set',
    rarity: 'Common',
    condition: 'Mint',
    quantity: 3,
    imageUrl: 'https://images.pokemontcg.io/base1/58_hires.png',
    notes: 'Starter collection'
  },
  {
    name: 'Blastoise',
    set: 'Base Set',
    rarity: 'Rare Holo',
    condition: 'Near Mint',
    quantity: 1,
    imageUrl: 'https://images.pokemontcg.io/base1/2_hires.png',
    notes: 'Water-type powerhouse'
  },
  {
    name: 'Venusaur',
    set: 'Base Set',
    rarity: 'Rare Holo',
    condition: 'Lightly Played',
    quantity: 1,
    imageUrl: 'https://images.pokemontcg.io/base1/15_hires.png',
    notes: 'Grass-type classic'
  },
  {
    name: 'Mewtwo',
    set: 'Base Set',
    rarity: 'Rare Holo',
    condition: 'Near Mint',
    quantity: 1,
    imageUrl: 'https://images.pokemontcg.io/base1/10_hires.png',
    notes: 'Legendary psychic Pokemon'
  },
  {
    name: 'Gyarados',
    set: 'Base Set',
    rarity: 'Rare Holo',
    condition: 'Near Mint',
    quantity: 1,
    imageUrl: 'https://images.pokemontcg.io/base1/6_hires.png',
    notes: 'Evolution of Magikarp'
  },
  {
    name: 'Machamp',
    set: 'Base Set',
    rarity: 'Rare Holo',
    condition: 'Mint',
    quantity: 1,
    imageUrl: 'https://images.pokemontcg.io/base1/8_hires.png',
    notes: 'Fighting-type favorite'
  },
  {
    name: 'Alakazam',
    set: 'Base Set',
    rarity: 'Rare Holo',
    condition: 'Near Mint',
    quantity: 1,
    imageUrl: 'https://images.pokemontcg.io/base1/1_hires.png',
    notes: 'Psychic powerhouse'
  },
  {
    name: 'Raichu',
    set: 'Base Set',
    rarity: 'Rare Holo',
    condition: 'Lightly Played',
    quantity: 2,
    imageUrl: 'https://images.pokemontcg.io/base1/14_hires.png',
    notes: 'Pikachu evolution'
  },
  {
    name: 'Ninetales',
    set: 'Base Set',
    rarity: 'Rare Holo',
    condition: 'Near Mint',
    quantity: 1,
    imageUrl: 'https://images.pokemontcg.io/base1/12_hires.png',
    notes: 'Fire-type beauty'
  },
  {
    name: 'Dragonite',
    set: 'Fossil',
    rarity: 'Rare Holo',
    condition: 'Mint',
    quantity: 1,
    imageUrl: 'https://images.pokemontcg.io/base3/4_hires.png',
    notes: 'Dragon-type powerhouse'
  },
  {
    name: 'Articuno',
    set: 'Fossil',
    rarity: 'Rare Holo',
    condition: 'Near Mint',
    quantity: 1,
    imageUrl: 'https://images.pokemontcg.io/base3/2_hires.png',
    notes: 'Legendary ice bird'
  },
  {
    name: 'Zapdos',
    set: 'Fossil',
    rarity: 'Rare Holo',
    condition: 'Near Mint',
    quantity: 1,
    imageUrl: 'https://images.pokemontcg.io/base3/15_hires.png',
    notes: 'Legendary electric bird'
  },
  {
    name: 'Moltres',
    set: 'Fossil',
    rarity: 'Rare Holo',
    condition: 'Mint',
    quantity: 1,
    imageUrl: 'https://images.pokemontcg.io/base3/12_hires.png',
    notes: 'Legendary fire bird'
  },
  {
    name: 'Gengar',
    set: 'Fossil',
    rarity: 'Rare Holo',
    condition: 'Near Mint',
    quantity: 1,
    imageUrl: 'https://images.pokemontcg.io/base3/5_hires.png',
    notes: 'Ghost-type favorite'
  },
  {
    name: 'Lapras',
    set: 'Fossil',
    rarity: 'Rare Holo',
    condition: 'Lightly Played',
    quantity: 1,
    imageUrl: 'https://images.pokemontcg.io/base3/10_hires.png',
    notes: 'Water/Ice transport Pokemon'
  }
];

async function main() {
  console.log('Start seeding...');

  // Clear existing cards
  await prisma.card.deleteMany({});
  console.log('Cleared existing cards');

  // Create cards
  for (const card of sampleCards) {
    const created = await prisma.card.create({
      data: card
    });
    console.log(`Created card: ${created.name}`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
