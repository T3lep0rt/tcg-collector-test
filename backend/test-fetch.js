// Quick test to diagnose fetch issues with pokemon-zone.com

async function testFetch() {
  const testUrl = 'https://www.pokemon-zone.com/sets/a1/';

  console.log(`Testing fetch to: ${testUrl}\n`);

  try {
    console.log('Attempting fetch with basic headers...');
    const response = await fetch(testUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    console.log(`\nResponse Status: ${response.status} ${response.statusText}`);
    console.log(`Response OK: ${response.ok}`);
    console.log('\nResponse Headers:');
    for (const [key, value] of response.headers) {
      console.log(`  ${key}: ${value}`);
    }

    if (response.ok) {
      const text = await response.text();
      console.log(`\nResponse body length: ${text.length} characters`);
      console.log(`Contains "/cards/": ${text.includes('/cards/')}`);

      // Try to extract some card links
      const linkRegex = /href="(\/cards\/[^"]+)"/g;
      const matches = text.match(linkRegex);
      console.log(`\nFound ${matches ? matches.length : 0} card link matches`);
      if (matches) {
        console.log('First few matches:', matches.slice(0, 5));
      }
    } else {
      const errorText = await response.text();
      console.log(`\nError response body (first 500 chars):`);
      console.log(errorText.substring(0, 500));
    }

  } catch (error) {
    console.error('\nFetch failed with error:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
  }
}

testFetch();
