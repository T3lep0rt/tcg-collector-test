import { PrismaClient } from '@prisma/client';
import puppeteer from 'puppeteer';

const prisma = new PrismaClient();

/**
 * Fetches HTML content using Puppeteer to bypass Cloudflare protection
 * @param {import('puppeteer').Page} page - Puppeteer page instance
 * @param {string} url - The URL to fetch
 * @returns {Promise<string>} HTML content
 */
async function fetchWithPuppeteer(page, url) {
  console.log(`  Navigating to: ${url}`);

  try {
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    // Wait a bit for Cloudflare challenge to potentially complete
    console.log(`  ⏳ Waiting for Cloudflare challenge (if any)...`);
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Check if we're stuck on a Cloudflare page
    const html = await page.content();
    const isCloudflare = html.includes('cloudflare.com') && html.includes('challenge');
    if (isCloudflare) {
      console.log(`  ⚠️  Detected Cloudflare challenge page - waiting longer...`);
      await new Promise(resolve => setTimeout(resolve, 10000));
    }

    // Wait for React-rendered content (card grid or card links)
    let selectorFound = 'none';
    try {
      // Try to wait for the card grid first
      await page.waitForSelector('.card-grid', { timeout: 15000 });
      selectorFound = '.card-grid';
      console.log(`  ✓ Found selector: .card-grid`);
    } catch (e) {
      console.log(`  ✗ Selector not found: .card-grid`);
      // If no card grid, try waiting for card links
      try {
        await page.waitForSelector('a[href*="/cards/"]', { timeout: 15000 });
        selectorFound = 'a[href*="/cards/"]';
        console.log(`  ✓ Found selector: a[href*="/cards/"]`);
      } catch (e2) {
        console.log(`  ✗ Selector not found: a[href*="/cards/"]`);
        // If neither exists, just wait a bit for any dynamic content
        console.log(`  ⏳ Waiting 5 seconds for dynamic content...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    const finalHtml = await page.content();
    console.log(`  📄 HTML length: ${finalHtml.length} characters`);

    // Final check for Cloudflare
    if (finalHtml.includes('cloudflare.com') && finalHtml.includes('challenge')) {
      console.log(`  ❌ Still on Cloudflare challenge page after waiting`);
    }

    return finalHtml;
  } catch (error) {
    console.error(`  Error fetching ${url}:`, error.message);
    return '';
  }
}

/**
 * Fetches all card links from an expansion page
 * @param {import('puppeteer').Page} page - Puppeteer page instance
 * @param {string} url - The expansion page URL
 * @returns {Promise<string[]>} Array of card URLs
 */
async function fetchCardLinks(page, url) {
  const html = await fetchWithPuppeteer(page, url);

  if (!html) {
    console.log(`  ⚠️  No HTML content received`);
    return [];
  }

  console.log(`  🔍 Searching for card links in HTML...`);

  // DEBUG: Check if HTML contains any card-related elements
  const hasCardGrid = html.includes('card-grid');
  const hasCardsInHref = html.includes('/cards/');
  console.log(`  DEBUG: HTML contains "card-grid": ${hasCardGrid}`);
  console.log(`  DEBUG: HTML contains "/cards/": ${hasCardsInHref}`);

  // DEBUG: Show a sample of hrefs in the HTML
  const allHrefsRegex = /href="([^"]+)"/g;
  const sampleHrefs = [];
  let sampleMatch;
  let count = 0;
  while ((sampleMatch = allHrefsRegex.exec(html)) !== null && count < 5) {
    sampleHrefs.push(sampleMatch[1]);
    count++;
  }
  console.log(`  DEBUG: Sample hrefs found:`, sampleHrefs);

  // Extract all card links matching /cards/ pattern
  const linkRegex = /href="(\/cards\/[^"]+)"/g;
  const links = [];
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1];
    const fullUrl = href.startsWith('http') ? href : `https://www.pokemon-zone.com${href}`;
    links.push(fullUrl);
  }

  console.log(`  📊 Regex matched ${links.length} card links`);

  // Return unique links
  const uniqueLinks = [...new Set(links)];
  console.log(`  ✓ Returning ${uniqueLinks.length} unique card links`);
  return uniqueLinks;
}

/**
 * Fetches all available sets from the main sets page
 * @param {import('puppeteer').Page} page - Puppeteer page instance
 * @returns {Promise<Array<{url: string, name: string, slug: string}>>} Array of set objects
 */
async function fetchAllSets(page) {
  const setsUrl = 'https://www.pokemon-zone.com/sets/';
  console.log(`Fetching available sets from: ${setsUrl}`);

  const html = await fetchWithPuppeteer(page, setsUrl);

  if (!html) {
    return [];
  }

  // Extract all set links - looking for links to /sets/[slug]/
  const setLinkRegex = /href="(\/sets\/([a-z0-9-]+)\/)"/g;
  const sets = [];
  let match;

  while ((match = setLinkRegex.exec(html)) !== null) {
    const setPath = match[1];
    const setSlug = match[2];
    const fullUrl = `https://www.pokemon-zone.com${setPath}`;

    // Try to extract the set name from the surrounding HTML
    const linkIndex = match.index;
    const contextAfter = html.substring(linkIndex, Math.min(html.length, linkIndex + 500));

    let setName = setSlug; // Default to slug if we can't find a name

    // Look for text content in the same card/div
    const nameMatch = contextAfter.match(/<[^>]*>([^<]+)<\/[^>]*>/);
    if (nameMatch && nameMatch[1].trim() && !nameMatch[1].includes('<')) {
      const potentialName = nameMatch[1].trim();
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
}

/**
 * Extracts rarity from rarity icon classes
 * @param {string} html - HTML content
 * @returns {number} Rarity number (0-7)
 */
function extractRarity(html) {
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
 * @param {import('puppeteer').Page} page - Puppeteer page instance
 * @param {string} url - The expansion page URL
 * @param {string} expansionName - Name of the expansion
 * @param {string} setSlug - Set slug identifier
 */
async function generateCardsForExpansion(page, url, expansionName, setSlug) {
  console.log(`\n--- Processing expansion: ${expansionName} ---`);
  console.log(`Set slug: ${setSlug}`);
  console.log(`Fetching card links from: ${url}`);

  const urls = await fetchCardLinks(page, url);
  console.log(`Found ${urls.length} card links`);

  const results = [];

  for (let i = 0; i < urls.length; i++) {
    const cardUrl = urls[i];
    console.log(`\nProcessing card ${i + 1}/${urls.length}: ${cardUrl}`);

    try {
      const html = await fetchWithPuppeteer(page, cardUrl);

      if (!html) {
        results.push({ error: 'Could not fetch URL: ' + cardUrl });
        continue;
      }

      // Extract Pokemon name from h1 with class "fs-1 text-break"
      const nameMatch = html.match(/<h1[^>]*class="[^"]*fs-1[^"]*text-break[^"]*"[^>]*>([^<]+)<\/h1>/);
      const pokemonName = nameMatch ? nameMatch[1].trim() : 'Unknown';

      // Extract rarity
      const rarity = extractRarity(html);

      // Extract card metadata
      const metaRegex = /<div[^>]*class="[^"]*card-collection-summary__meta[^"]*"[^>]*>([\s\S]*?)<\/div>/;
      const metaMatch = html.match(metaRegex);

      let number = null;
      let booster = null;

      if (metaMatch) {
        const metaContent = metaMatch[1];
        const spanRegex = /<span[^>]*>([^<]+)<\/span>/g;
        const spans = [];
        let spanMatch;

        while ((spanMatch = spanRegex.exec(metaContent)) !== null) {
          spans.push(spanMatch[1].trim());
        }

        if (spans.length > 0) {
          number = spans[0];
        }

        if (spans.length > 2) {
          booster = spans[2].replace(/\s+/g, '');
        }
      }

      // Extract image URL
      const imgRegex = /<img[^>]+src="([^"]*\.webp[^"]*)"/;
      const imgMatch = html.match(imgRegex);
      let imageUrl = imgMatch ? imgMatch[1] : '';

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

      // Check if card already exists
      const existingCard = await prisma.card.findFirst({
        where: {
          name: cardData.name,
          number: cardData.number,
          set: setSlug
        }
      });

      if (!existingCard) {
        const newCard = await prisma.card.create({
          data: {
            name: cardData.name,
            set: setSlug,
            setName: cardData.expansion,
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

      // Small delay between cards
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
  console.log('===== Starting Pokemon Zone Card Seeder (Puppeteer) =====\n');

  // Launch browser with enhanced anti-detection
  console.log('Launching browser with anti-detection measures...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--window-size=1920,1080',
      '--start-maximized'
    ]
  });

  const page = await browser.newPage();

  // Set realistic viewport
  await page.setViewport({
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1
  });

  // Set realistic user agent
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');

  // Set extra headers to appear more like a real browser
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Cache-Control': 'max-age=0'
  });

  // Override webdriver and automation flags
  await page.evaluateOnNewDocument(() => {
    // Overwrite the navigator.webdriver property
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false
    });

    // Mock plugins
    Object.defineProperty(navigator, 'plugins', {
      get: () => [1, 2, 3, 4, 5]
    });

    // Mock languages
    Object.defineProperty(navigator, 'languages', {
      get: () => ['en-US', 'en']
    });

    // Remove automation indicators
    window.chrome = {
      runtime: {}
    };

    // Mock permissions
    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (parameters) => (
      parameters.name === 'notifications' ?
        Promise.resolve({ state: Notification.permission }) :
        originalQuery(parameters)
    );
  });

  try {
    // Optional: Clear existing cards
    // await prisma.card.deleteMany({});

    // Fetch all available sets
    const sets = await fetchAllSets(page);

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
        const results = await generateCardsForExpansion(page, set.url, set.name, set.slug);

        overallStats.processedSets++;
        overallStats.totalCards += results.length;
        overallStats.newCards += results.filter(r => !r.error && !r.skipped).length;
        overallStats.skippedCards += results.filter(r => r.skipped).length;
        overallStats.errors += results.filter(r => r.error).length;

        // Delay between sets
        await new Promise(resolve => setTimeout(resolve, 2000));
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

  } finally {
    await browser.close();
    console.log('\nBrowser closed.');
  }
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
