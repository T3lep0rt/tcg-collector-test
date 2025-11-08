/**
 * Collection Page
 * Pokemon TCG Pocket-style collection management with Browse and Collection views
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Browse from '../components/Browse';
import CollectionView from '../components/Collection';
import CardDetailModal from '../components/CardDetailModal';
import api from '../services/api';

export default function Collection() {
  const { user, logout } = useAuth();
  const [allCards, setAllCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('collection');

  useEffect(() => {
    fetchCards();
  }, []);

  // Update selectedCard when allCards changes to reflect live updates
  useEffect(() => {
    if (selectedCard && allCards.length > 0) {
      const updatedCard = allCards.find(c => c.id === selectedCard.id);
      if (updatedCard) {
        setSelectedCard(updatedCard);
      }
    }
  }, [allCards]);

  const fetchCards = async () => {
    try {
      setLoading(true);
      // Fetch all cards for browse view (includes ownership info)
      const response = await api.getBrowseCards();
      setAllCards(response.cards || []);
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

  // Split cards into browse (all cards) and collection (owned by current user)
  const browseCards = allCards; // Show all cards in browse/catalog view
  const collectionCards = allCards.filter(card => card.userId === user?.id);

  const handleAddToCollection = async (card) => {
    try {
      // Add card to user's inventory using the card's Pokemon TCG API ID
      await api.addToInventory(card.cardId, {
        quantity: 1,
        condition: 'Near Mint'
      });
      // Refresh cards
      fetchCards();
    } catch (err) {
      console.error('Error adding to collection:', err);
      // For demo mode, update locally
      setAllCards(prev => prev.map(c =>
        c.id === card.id ? { ...c, userId: user.id, quantity: 1 } : c
      ));
    }
  };

  const handleRemoveFromCollection = async (card) => {
    try {
      // Remove card from user's inventory using the card's Pokemon TCG API ID
      await api.removeFromInventory(card.cardId);
      // Refresh cards
      fetchCards();
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

  const handleUpdateCard = async (card, updates) => {
    try {
      // Update card in user's inventory using the card's Pokemon TCG API ID
      await api.updateInventory(card.cardId, {
        quantity: updates.quantity,
        condition: updates.condition,
        notes: updates.notes
      });
      // Refresh cards
      fetchCards();
    } catch (err) {
      console.error('Error updating card:', err);
      // For demo mode, update locally
      setAllCards(prev => prev.map(c =>
        c.id === card.id ? { ...c, ...updates } : c
      ));
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {error && (
        <div className="fixed top-4 right-4 bg-red-500/90 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          <p className="text-sm">Using demo data. Check your backend connection.</p>
        </div>
      )}

      {/* Tab Navigation with User Info */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-slate-900/98 via-purple-900/98 to-slate-900/98 backdrop-blur-xl border-b border-purple-500/30 shadow-2xl">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
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

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <span className="text-gray-300 text-sm hidden md:block">
                {user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500/80 hover:bg-red-600 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'collection' ? (
        <CollectionView
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
          onCardClick={handleCardClick}
          currentUserId={user?.id}
        />
      )}

      {/* Card Detail Modal */}
      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          onClose={closeModal}
          onUpdate={handleUpdateCard}
          onDelete={handleRemoveFromCollection}
          isOwned={selectedCard.userId === user?.id}
          currentUserId={user?.id}
        />
      )}
    </div>
  );
}

// Mock data for demo purposes
function getMockCards() {
  return [
    // Cards in collection (with userId - will be set to current user's ID)
    {
      id: '1',
      name: 'Charizard',
      set: 'Base Set',
      rarity: 'Rare Holo',
      condition: 'Near Mint',
      quantity: 1,
      imageUrl: 'https://images.pokemontcg.io/base1/4_hires.png',
      notes: 'Classic first edition look',
      userId: null // Will be set to current user when added
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
      userId: null
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
      userId: null
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
