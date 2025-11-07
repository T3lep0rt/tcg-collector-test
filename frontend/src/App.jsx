import { useState, useEffect } from 'react';
import CardGrid from './components/CardGrid';

function App() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState(null);
  const [error, setError] = useState(null);

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
      setCards(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching cards:', err);
      setError(err.message);
      // Use mock data if API fails
      setCards(getMockCards());
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (card) => {
    setSelectedCard(card);
  };

  const closeModal = () => {
    setSelectedCard(null);
  };

  return (
    <div className="min-h-screen">
      {error && (
        <div className="fixed top-4 right-4 bg-red-500/90 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          <p className="text-sm">Using demo data. Start the backend to load real cards.</p>
        </div>
      )}

      <CardGrid
        cards={cards}
        loading={loading}
        onCardClick={handleCardClick}
      />

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
    {
      id: '1',
      name: 'Charizard',
      set: 'Base Set',
      rarity: 'Rare Holo',
      condition: 'Near Mint',
      quantity: 1,
      imageUrl: 'https://images.pokemontcg.io/base1/4_hires.png',
      notes: 'Classic first edition look'
    },
    {
      id: '2',
      name: 'Pikachu',
      set: 'Base Set',
      rarity: 'Common',
      condition: 'Mint',
      quantity: 3,
      imageUrl: 'https://images.pokemontcg.io/base1/58_hires.png',
      notes: 'Starter collection'
    },
    {
      id: '3',
      name: 'Blastoise',
      set: 'Base Set',
      rarity: 'Rare Holo',
      condition: 'Near Mint',
      quantity: 1,
      imageUrl: 'https://images.pokemontcg.io/base1/2_hires.png',
      notes: 'Water-type powerhouse'
    },
    {
      id: '4',
      name: 'Venusaur',
      set: 'Base Set',
      rarity: 'Rare Holo',
      condition: 'Lightly Played',
      quantity: 1,
      imageUrl: 'https://images.pokemontcg.io/base1/15_hires.png',
      notes: 'Grass-type classic'
    },
    {
      id: '5',
      name: 'Mewtwo',
      set: 'Base Set',
      rarity: 'Rare Holo',
      condition: 'Near Mint',
      quantity: 1,
      imageUrl: 'https://images.pokemontcg.io/base1/10_hires.png',
      notes: 'Legendary psychic Pokemon'
    },
    {
      id: '6',
      name: 'Gyarados',
      set: 'Base Set',
      rarity: 'Rare Holo',
      condition: 'Near Mint',
      quantity: 1,
      imageUrl: 'https://images.pokemontcg.io/base1/6_hires.png',
      notes: 'Evolution of Magikarp'
    }
  ];
}

export default App;
