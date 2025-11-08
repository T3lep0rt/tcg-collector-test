import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Fetches all card links from an expansion page
 * @param {string} url - The expansion page URL (e.g., https://www.pokemon-zone.com/sets/a1/)
 * @returns {Promise<string[]>} Array of card URLs
 */
async function fetchCardLinks(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive'
      }
    });

    if (!response.ok) {
      console.error(`Error fetching URL: ${url} - HTTP ${response.status} ${response.statusText}`);
      return [];
    }

    const html = await response.text();

    // Extract all card links matching /cards/ pattern
    const linkRegex = /href="(\/cards\/[^"]+)"/g;
    const links = [];
    let match;

    while ((match = linkRegex.exec(html)) !== null) {
      const href = match[1];
      // Make sure it's a full URL
      const fullUrl = href.startsWith('http') ? href : `https://www.pokemon-zone.com${href}`;
      links.push(fullUrl);
    }

    // Return unique links
    return [...new Set(links)];
  } catch (error) {
    console.error(`Error fetching card links from ${url}:`, error.message);
    return [];
  }
}

/**
 * Fetches all available sets from the main sets page
 * @returns {Promise<Array<{url: string, name: string, slug: string}>>} Array of set objects
 */
async function fetchAllSets() {
  try {
    const setsUrl = 'https://www.pokemon-zone.com/sets/';
    console.log(`Fetching available sets from: ${setsUrl}`);

    const response = await fetch(setsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive'
      }
    });

    if (!response.ok) {
      console.error(`Error fetching sets page: ${setsUrl} - HTTP ${response.status} ${response.statusText}`);
      return [];
    }

    const html = await response.text();

    // Extract all set links - looking for links to /sets/[slug]/
    const setLinkRegex = /href="(\/sets\/([a-z0-9-]+)\/)"/g;
    const sets = [];
    let match;

    while ((match = setLinkRegex.exec(html)) !== null) {
      const setPath = match[1];
      const setSlug = match[2];
      const fullUrl = `https://www.pokemon-zone.com${setPath}`;

      // Try to extract the set name from the surrounding HTML
      // Look for the text content near this link
      const linkIndex = match.index;
      const contextBefore = html.substring(Math.max(0, linkIndex - 500), linkIndex);
      const contextAfter = html.substring(linkIndex, Math.min(html.length, linkIndex + 500));

      // Try to find a heading or title near the link
      let setName = setSlug; // Default to slug if we can't find a name

      // Look for text content in the same card/div
      const nameMatch = contextAfter.match(/<[^>]*>([^<]+)<\/[^>]*>/);
      if (nameMatch && nameMatch[1].trim() && !nameMatch[1].includes('<')) {
        const potentialName = nameMatch[1].trim();
        // Make sure it's not just a number or very short
        if (potentialName.length > 2 && !potentialName.match(/^[0-9]+$/)) {
          setName = potentialName;
        }
      }

      sets.push({
        url: fullUrl,
        name: setName,
        slug: setSlug
      });
    }

    // Remove duplicates based on URL
    const uniqueSets = [...new Map(sets.map(set => [set.url, set])).values()];

    console.log(`Found ${uniqueSets.length} sets`);
    return uniqueSets;
  } catch (error) {
    console.error(`Error fetching sets list:`, error.message);
    return [];
  }
}

/**
 * Extracts text content from an HTML tag
 * @param {string} html - HTML content
 * @param {RegExp} regex - Regular expression to match the tag
 * @returns {string|null} Extracted text or null
 */
function extractText(html, regex) {
  const match = html.match(regex);
  return match ? match[1].replace(/<[^>]*>/g, '').trim() : null;
}

/**
 * Extracts rarity from rarity icon classes
 * @param {string} html - HTML content
 * @returns {number} Rarity number (0-7)
 */
function extractRarity(html) {
  // Find all rarity-icon spans
  const rarityRegex = /<span[^>]*class="([^"]*rarity-icon[^"]*)"/g;
  let countFound = 0;
  let symbol = '';

  let match;
  while ((match = rarityRegex.exec(html)) !== null) {
    const classes = match[1].split(' ');
    if (classes[0] === 'rarity-icon') {
      symbol = classes[1] || '';
      countFound++;
    }
  }

  if (!symbol) return 0;

  let rarityMultiplier = 0;
  switch (symbol.toLowerCase()) {
    case 'icon-diamond':
      rarityMultiplier = 0;
      break;
    case 'icon-star':
      rarityMultiplier = 4;
      break;
    case 'icon-crown':
      rarityMultiplier = 7;
      break;
  }

  return rarityMultiplier + countFound;
}

/**
 * Generates cards for a specific expansion
 * @param {string} url - The expansion page URL
 * @param {string} expansionName - Name of the expansion (e.g., "Genetic Apex")
 * @param {string} setSlug - Set slug identifier (e.g., "a1", "promo-a")
 */
async function generateCardsForExpansion(url, expansionName, setSlug) {
  console.log(`\n--- Processing expansion: ${expansionName} ---`);
  console.log(`Set slug: ${setSlug}`);
  console.log(`Fetching card links from: ${url}`);

  const urls = await fetchCardLinks(url);
  console.log(`Found ${urls.length} card links`);

  const results = [];

  for (let i = 0; i < urls.length; i++) {
    const cardUrl = urls[i];
    console.log(`\nProcessing card ${i + 1}/${urls.length}: ${cardUrl}`);

    try {
      const response = await fetch(cardUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Connection': 'keep-alive'
        }
      });

      if (!response.ok) {
        console.error(`Could not fetch URL: ${cardUrl} - HTTP ${response.status} ${response.statusText}`);
        results.push({ error: 'Could not fetch URL: ' + cardUrl });
        continue;
      }

      const html = await response.text();

      // Extract Pokemon name from h1 with class "fs-1 text-break"
      const nameMatch = html.match(/<h1[^>]*class="[^"]*fs-1[^"]*text-break[^"]*"[^>]*>([^<]+)<\/h1>/);
      const pokemonName = nameMatch ? nameMatch[1].trim() : 'Unknown';

      // Extract rarity
      const rarity = extractRarity(html);

      // Extract card metadata from div.card-collection-summary__meta
      const metaRegex = /<div[^>]*class="[^"]*card-collection-summary__meta[^"]*"[^>]*>([\s\S]*?)<\/div>/;
      const metaMatch = html.match(metaRegex);

      let number = null;
      let booster = null;

      if (metaMatch) {
        const metaContent = metaMatch[1];

        // Extract spans within the meta div
        const spanRegex = /<span[^>]*>([^<]+)<\/span>/g;
        const spans = [];
        let spanMatch;

        while ((spanMatch = spanRegex.exec(metaContent)) !== null) {
          spans.push(spanMatch[1].trim());
        }

        if (spans.length > 0) {
          number = spans[0]; // First span is the card number
        }

        if (spans.length > 2) {
          booster = spans[2].replace(/\s+/g, ''); // Third span is the booster pack
        }
      }

      // Extract image URL (look for .webp images)
      const imgRegex = /<img[^>]+src="([^"]*\.webp[^"]*)"/;
      const imgMatch = html.match(imgRegex);
      let imageUrl = imgMatch ? imgMatch[1] : '';

      // Make sure image URL is absolute
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = `https://www.pokemon-zone.com${imageUrl}`;
      }

      const cardData = {
        name: pokemonName,
        number: number,
        booster: booster,
        imageUrl: imageUrl,
        rarity: rarity,
        expansion: expansionName,
        setSlug: setSlug
      };

      console.log(`  Name: ${pokemonName}`);
      console.log(`  Number: ${number}`);
      console.log(`  Rarity: ${rarity}`);
      console.log(`  Booster: ${booster || 'N/A'}`);

      // Check if card already exists (using set slug for more precise matching)
      const existingCard = await prisma.card.findFirst({
        where: {
          name: cardData.name,
          number: cardData.number,
          set: setSlug  // Use slug for consistent filtering
        }
      });

      if (!existingCard) {
        // Insert the card into the database
        // Use setSlug for the 'set' field for consistent filtering
        const newCard = await prisma.card.create({
          data: {
            name: cardData.name,
            set: setSlug,  // Use slug for filtering
            setName: cardData.expansion,  // Use full name for display
            number: cardData.number,
            rarity: cardData.rarity.toString(),
            imageUrl: cardData.imageUrl,
            notes: cardData.booster ? `Booster: ${cardData.booster}` : null,
            condition: 'Near Mint',
            quantity: 1
          }
        });

        console.log(`  ✓ Created card: ${newCard.name} (${newCard.number})`);
        results.push(cardData);
      } else {
        console.log(`  ○ Card already exists: ${cardData.name} (${cardData.number})`);
        results.push({ ...cardData, skipped: true });
      }

      // Add a small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error(`  Error processing card: ${error.message}`);
      results.push({ error: 'Error processing URL: ' + cardUrl, message: error.message });
    }
  }

  console.log(`\n✓ Finished processing ${expansionName}`);
  console.log(`  Total cards processed: ${results.length}`);
  console.log(`  New cards added: ${results.filter(r => !r.error && !r.skipped).length}`);
  console.log(`  Skipped (already exist): ${results.filter(r => r.skipped).length}`);
  console.log(`  Errors: ${results.filter(r => r.error).length}`);

  return results;
}

/**
 * Main seed function
 */
async function main() {
  console.log('===== Starting Pokemon Zone Card Seeder =====\n');

  // Optional: Clear existing cards (uncomment if you want to start fresh)
  // console.log('Clearing existing cards...');
  // await prisma.card.deleteMany({});
  // console.log('Existing cards cleared\n');

  // Fetch all available sets from pokemon-zone.com
  const sets = await fetchAllSets();

  if (sets.length === 0) {
    console.error('No sets found. Exiting...');
    return;
  }

  console.log('\n📦 Sets to process:');
  sets.forEach((set, index) => {
    console.log(`  ${index + 1}. ${set.name} (${set.slug}) - ${set.url}`);
  });
  console.log('');

  // Track overall statistics
  const overallStats = {
    totalSets: sets.length,
    processedSets: 0,
    totalCards: 0,
    newCards: 0,
    skippedCards: 0,
    errors: 0
  };

  // Generate cards for each discovered expansion
  for (const set of sets) {
    try {
      const results = await generateCardsForExpansion(set.url, set.name, set.slug);

      overallStats.processedSets++;
      overallStats.totalCards += results.length;
      overallStats.newCards += results.filter(r => !r.error && !r.skipped).length;
      overallStats.skippedCards += results.filter(r => r.skipped).length;
      overallStats.errors += results.filter(r => r.error).length;

      // Add a delay between sets to be respectful to the server
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Failed to process set ${set.name}:`, error.message);
      overallStats.errors++;
    }
  }

  // Print overall summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 OVERALL SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Sets Found:      ${overallStats.totalSets}`);
  console.log(`Sets Processed:        ${overallStats.processedSets}`);
  console.log(`Total Cards Processed: ${overallStats.totalCards}`);
  console.log(`New Cards Added:       ${overallStats.newCards}`);
  console.log(`Cards Skipped:         ${overallStats.skippedCards}`);
  console.log(`Errors:                ${overallStats.errors}`);
  console.log('='.repeat(60));
  console.log('\n✅ Seeding Complete!');
  console.log('\n💡 Tip: You can now filter cards by set using the "set" field (slug format)');
  console.log('   Example sets: a1, promo-a, a1a');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
