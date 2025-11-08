import { useState, useEffect } from 'react';
import Browse from './components/Browse';
import Collection from './components/Collection';

// Demo user ID for testing (in production, this would come from auth)
const DEMO_USER_ID = 'demo-user-123';

function App() {
  const [allCards, setAllCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('collection');

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cards');
      if (!response.ok) {
        throw new Error('Failed to fetch cards');
      }
      const data = await response.json();
      setAllCards(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching cards:', err);
      setError(err.message);
      // Use mock data if API fails
      setAllCards(getMockCards());
    } finally {
      setLoading(false);
    }
  };

  // Split cards into browse (available) and collection (owned)
  const browseCards = allCards.filter(card => !card.userId);
  const collectionCards = allCards.filter(card => card.userId === DEMO_USER_ID);

  const handleAddToCollection = async (card) => {
    try {
      // Update the card to add userId
      const response = await fetch(`/api/cards/${card.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...card,
          userId: DEMO_USER_ID,
          quantity: 1
        })
      });

      if (response.ok) {
        // Refresh cards
        fetchCards();
      }
    } catch (err) {
      console.error('Error adding to collection:', err);
      // For demo mode, update locally
      setAllCards(prev => prev.map(c =>
        c.id === card.id ? { ...c, userId: DEMO_USER_ID, quantity: 1 } : c
      ));
    }
  };

  const handleRemoveFromCollection = async (card) => {
    try {
      // Update the card to remove userId
      const response = await fetch(`/api/cards/${card.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...card,
          userId: null,
          quantity: 1
        })
      });

      if (response.ok) {
        // Refresh cards
        fetchCards();
      }
    } catch (err) {
      console.error('Error removing from collection:', err);
      // For demo mode, update locally
      setAllCards(prev => prev.map(c =>
        c.id === card.id ? { ...c, userId: null } : c
      ));
    }
  };

  const handleCardClick = (card) => {
    setSelectedCard(card);
  };

  const closeModal = () => {
    setSelectedCard(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {error && (
        <div className="fixed top-4 right-4 bg-red-500/90 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          <p className="text-sm">Using demo data. Start the backend to load real cards.</p>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-slate-900/98 via-purple-900/98 to-slate-900/98 backdrop-blur-xl border-b border-purple-500/30 shadow-2xl">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('collection')}
              className={`
                relative px-8 py-4 text-lg font-semibold transition-all duration-300
                ${activeTab === 'collection'
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
                }
              `}
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                My Collection
                <span className="ml-2 px-2 py-0.5 bg-purple-500 text-white text-xs rounded-full">
                  {collectionCards.length}
                </span>
              </span>
              {activeTab === 'collection' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('browse')}
              className={`
                relative px-8 py-4 text-lg font-semibold transition-all duration-300
                ${activeTab === 'browse'
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
                }
              `}
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Browse Cards
                <span className="ml-2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                  {browseCards.length}
                </span>
              </span>
              {activeTab === 'browse' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-t-full" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'collection' ? (
        <Collection
          cards={collectionCards}
          loading={loading}
          onCardClick={handleCardClick}
          onRemoveFromCollection={handleRemoveFromCollection}
        />
      ) : (
        <Browse
          cards={browseCards}
          loading={loading}
          onAddToCollection={handleAddToCollection}
        />
      )}

      {/* Card Detail Modal */}
      {selectedCard && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={closeModal}
        >
          <div
            className="bg-gradient-to-br from-slate-800 to-purple-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-purple-500/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {selectedCard.name}
                  </h2>
                  <p className="text-purple-300">{selectedCard.set}</p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Card Image */}
              <div className="mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-slate-700 to-slate-900">
                {selectedCard.imageUrl ? (
                  <img
                    src={selectedCard.imageUrl}
                    alt={selectedCard.name}
                    className="w-full h-auto"
                  />
                ) : (
                  <div className="aspect-[2.5/3.5] flex items-center justify-center">
                    <p className="text-gray-400">No image available</p>
                  </div>
                )}
              </div>

              {/* Card Details */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {selectedCard.rarity && (
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">Rarity</p>
                      <p className="text-white font-semibold">{selectedCard.rarity}</p>
                    </div>
                  )}
                  {selectedCard.condition && (
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">Condition</p>
                      <p className="text-white font-semibold">{selectedCard.condition}</p>
                    </div>
                  )}
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Quantity</p>
                    <p className="text-white font-semibold">{selectedCard.quantity || 1}</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Set</p>
                    <p className="text-white font-semibold">{selectedCard.set}</p>
                  </div>
                </div>

                {selectedCard.notes && (
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Notes</p>
                    <p className="text-white">{selectedCard.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Mock data for demo purposes
function getMockCards() {
  return [
    // Cards in collection (with userId)
    {
      id: '1',
      name: 'Charizard',
      set: 'Base Set',
      rarity: 'Rare Holo',
      condition: 'Near Mint',
      quantity: 1,
      imageUrl: 'https://images.pokemontcg.io/base1/4_hires.png',
      notes: 'Classic first edition look',
      userId: DEMO_USER_ID
    },
    {
      id: '2',
      name: 'Pikachu',
      set: 'Base Set',
      rarity: 'Common',
      condition: 'Mint',
      quantity: 3,
      imageUrl: 'https://images.pokemontcg.io/base1/58_hires.png',
      notes: 'Starter collection',
      userId: DEMO_USER_ID
    },
    {
      id: '3',
      name: 'Blastoise',
      set: 'Base Set',
      rarity: 'Rare Holo',
      condition: 'Near Mint',
      quantity: 1,
      imageUrl: 'https://images.pokemontcg.io/base1/2_hires.png',
      notes: 'Water-type powerhouse',
      userId: DEMO_USER_ID
    },
    // Available cards (without userId)
    {
      id: '4',
      name: 'Venusaur',
      set: 'Base Set',
      rarity: 'Rare Holo',
      imageUrl: 'https://images.pokemontcg.io/base1/15_hires.png'
    },
    {
      id: '5',
      name: 'Mewtwo',
      set: 'Base Set',
      rarity: 'Rare Holo',
      imageUrl: 'https://images.pokemontcg.io/base1/10_hires.png'
    },
    {
      id: '6',
      name: 'Gyarados',
      set: 'Base Set',
      rarity: 'Rare Holo',
      imageUrl: 'https://images.pokemontcg.io/base1/6_hires.png'
    },
    {
      id: '7',
      name: 'Machamp',
      set: 'Base Set',
      rarity: 'Rare Holo',
      imageUrl: 'https://images.pokemontcg.io/base1/8_hires.png'
    },
    {
      id: '8',
      name: 'Alakazam',
      set: 'Base Set',
      rarity: 'Rare Holo',
      imageUrl: 'https://images.pokemontcg.io/base1/1_hires.png'
    },
    {
      id: '9',
      name: 'Raichu',
      set: 'Base Set',
      rarity: 'Rare Holo',
      imageUrl: 'https://images.pokemontcg.io/base1/14_hires.png'
    },
    {
      id: '10',
      name: 'Ninetales',
      set: 'Base Set',
      rarity: 'Rare Holo',
      imageUrl: 'https://images.pokemontcg.io/base1/12_hires.png'
    },
    {
      id: '11',
      name: 'Dragonite',
      set: 'Fossil',
      rarity: 'Rare Holo',
      imageUrl: 'https://images.pokemontcg.io/base3/4_hires.png'
    },
    {
      id: '12',
      name: 'Articuno',
      set: 'Fossil',
      rarity: 'Rare Holo',
      imageUrl: 'https://images.pokemontcg.io/base3/2_hires.png'
    },
    {
      id: '13',
      name: 'Zapdos',
      set: 'Fossil',
      rarity: 'Rare Holo',
      imageUrl: 'https://images.pokemontcg.io/base3/15_hires.png'
    },
    {
      id: '14',
      name: 'Moltres',
      set: 'Fossil',
      rarity: 'Rare Holo',
      imageUrl: 'https://images.pokemontcg.io/base3/12_hires.png'
    },
    {
      id: '15',
      name: 'Gengar',
      set: 'Fossil',
      rarity: 'Rare Holo',
      imageUrl: 'https://images.pokemontcg.io/base3/5_hires.png'
    },
    {
      id: '16',
      name: 'Lapras',
      set: 'Fossil',
      rarity: 'Rare Holo',
      imageUrl: 'https://images.pokemontcg.io/base3/10_hires.png'
    }
  ];
}

export default App;
