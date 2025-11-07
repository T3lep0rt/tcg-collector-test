/**
 * Pokemon TCG API Service
 * Fetches card data from the Pokemon TCG API (https://pokemontcg.io/)
 */

const POKEMON_TCG_API_BASE = 'https://api.pokemontcg.io/v2';

/**
 * Fetch all Pokemon TCG cards with optional filters
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.pageSize - Number of cards per page (default: 250, max: 250)
 * @param {string} options.q - Search query (e.g., 'name:charizard', 'set.id:base1')
 * @param {string} options.orderBy - Sort field (e.g., 'name', '-releaseDate')
 * @returns {Promise<Object>} Card data and pagination info
 */
export async function fetchAllCards(options = {}) {
  const { page = 1, pageSize = 250, q = '', orderBy = 'name' } = options;

  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
    orderBy,
  });

  if (q) {
    params.append('q', q);
  }

  try {
    const response = await fetch(`${POKEMON_TCG_API_BASE}/cards?${params}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Pokemon TCG API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return {
      success: true,
      cards: data.data.map(card => ({
        id: card.id,
        name: card.name,
        supertype: card.supertype,
        subtypes: card.subtypes || [],
        level: card.level,
        hp: card.hp,
        types: card.types || [],
        evolvesFrom: card.evolvesFrom,
        abilities: card.abilities || [],
        attacks: card.attacks || [],
        weaknesses: card.weaknesses || [],
        resistances: card.resistances || [],
        retreatCost: card.retreatCost || [],
        convertedRetreatCost: card.convertedRetreatCost,
        set: {
          id: card.set.id,
          name: card.set.name,
          series: card.set.series,
          printedTotal: card.set.printedTotal,
          total: card.set.total,
          releaseDate: card.set.releaseDate,
          updatedAt: card.set.updatedAt,
          images: card.set.images,
        },
        number: card.number,
        artist: card.artist,
        rarity: card.rarity,
        flavorText: card.flavorText,
        nationalPokedexNumbers: card.nationalPokedexNumbers || [],
        legalities: card.legalities || {},
        images: {
          small: card.images.small,
          large: card.images.large,
        },
        tcgplayer: card.tcgplayer || {},
        cardmarket: card.cardmarket || {},
      })),
      pagination: {
        page: data.page,
        pageSize: data.pageSize,
        count: data.count,
        totalCount: data.totalCount,
      },
    };
  } catch (error) {
    console.error('Error fetching Pokemon TCG cards:', error);
    throw error;
  }
}

/**
 * Fetch a single card by ID
 * @param {string} cardId - The Pokemon TCG card ID
 * @returns {Promise<Object>} Card data
 */
export async function fetchCardById(cardId) {
  try {
    const response = await fetch(`${POKEMON_TCG_API_BASE}/cards/${cardId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: false,
          error: 'Card not found',
        };
      }
      throw new Error(`Pokemon TCG API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const card = data.data;

    return {
      success: true,
      card: {
        id: card.id,
        name: card.name,
        supertype: card.supertype,
        subtypes: card.subtypes || [],
        level: card.level,
        hp: card.hp,
        types: card.types || [],
        evolvesFrom: card.evolvesFrom,
        abilities: card.abilities || [],
        attacks: card.attacks || [],
        weaknesses: card.weaknesses || [],
        resistances: card.resistances || [],
        retreatCost: card.retreatCost || [],
        convertedRetreatCost: card.convertedRetreatCost,
        set: {
          id: card.set.id,
          name: card.set.name,
          series: card.set.series,
          printedTotal: card.set.printedTotal,
          total: card.set.total,
          releaseDate: card.set.releaseDate,
          updatedAt: card.set.updatedAt,
          images: card.set.images,
        },
        number: card.number,
        artist: card.artist,
        rarity: card.rarity,
        flavorText: card.flavorText,
        nationalPokedexNumbers: card.nationalPokedexNumbers || [],
        legalities: card.legalities || {},
        images: {
          small: card.images.small,
          large: card.images.large,
        },
        tcgplayer: card.tcgplayer || {},
        cardmarket: card.cardmarket || {},
      },
    };
  } catch (error) {
    console.error('Error fetching Pokemon TCG card:', error);
    throw error;
  }
}

/**
 * Fetch all Pokemon TCG sets
 * @returns {Promise<Object>} Sets data
 */
export async function fetchAllSets() {
  try {
    const response = await fetch(`${POKEMON_TCG_API_BASE}/sets`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Pokemon TCG API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return {
      success: true,
      sets: data.data.map(set => ({
        id: set.id,
        name: set.name,
        series: set.series,
        printedTotal: set.printedTotal,
        total: set.total,
        legalities: set.legalities || {},
        ptcgoCode: set.ptcgoCode,
        releaseDate: set.releaseDate,
        updatedAt: set.updatedAt,
        images: set.images,
      })),
    };
  } catch (error) {
    console.error('Error fetching Pokemon TCG sets:', error);
    throw error;
  }
}

/**
 * Search cards by name
 * @param {string} name - Card name to search for
 * @param {number} page - Page number
 * @param {number} pageSize - Number of results per page
 * @returns {Promise<Object>} Search results
 */
export async function searchCardsByName(name, page = 1, pageSize = 50) {
  return fetchAllCards({
    q: `name:${name}*`,
    page,
    pageSize,
    orderBy: 'name',
  });
}

/**
 * Fetch cards by set ID
 * @param {string} setId - The Pokemon TCG set ID
 * @param {number} page - Page number
 * @param {number} pageSize - Number of results per page
 * @returns {Promise<Object>} Cards in the set
 */
export async function fetchCardsBySet(setId, page = 1, pageSize = 250) {
  return fetchAllCards({
    q: `set.id:${setId}`,
    page,
    pageSize,
    orderBy: 'number',
  });
}

/**
 * Fetch cards by rarity
 * @param {string} rarity - Card rarity (e.g., 'Common', 'Rare', 'Ultra Rare')
 * @param {number} page - Page number
 * @param {number} pageSize - Number of results per page
 * @returns {Promise<Object>} Cards with specified rarity
 */
export async function fetchCardsByRarity(rarity, page = 1, pageSize = 250) {
  return fetchAllCards({
    q: `rarity:"${rarity}"`,
    page,
    pageSize,
  });
}
