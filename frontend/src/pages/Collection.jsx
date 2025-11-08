/**
 * Collection Page
 * Displays and manages user's card collection
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function Collection() {
  const { user, logout } = useAuth();
  const [cards, setCards] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddCard, setShowAddCard] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    set: '',
    rarity: '',
    condition: '',
    quantity: 1,
    imageUrl: '',
    notes: '',
  });

  useEffect(() => {
    loadCollection();
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCollection = async () => {
    try {
      const data = await api.getCards();
      setCards(data.cards);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await api.getCollectionStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleAddCard = async (e) => {
    e.preventDefault();
    try {
      await api.createCard(formData);
      setFormData({
        name: '',
        set: '',
        rarity: '',
        condition: '',
        quantity: 1,
        imageUrl: '',
        notes: '',
      });
      setShowAddCard(false);
      loadCollection();
      loadStats();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (!window.confirm('Are you sure you want to delete this card?')) return;

    try {
      await api.deleteCard(cardId);
      loadCollection();
      loadStats();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-900 dark:text-white">Loading collection...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My TCG Collection
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700 dark:text-gray-300">
              {user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
            <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Cards
              </h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalCards}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Unique Cards
              </h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.uniqueCards}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Sets
              </h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.sets}
              </p>
            </div>
          </div>
        )}

        {/* Add Card Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddCard(!showAddCard)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            {showAddCard ? 'Cancel' : 'Add Card'}
          </button>
        </div>

        {/* Add Card Form */}
        {showAddCard && (
          <div className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Add New Card
            </h2>
            <form onSubmit={handleAddCard} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Card Name *"
                required
                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Set *"
                required
                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                value={formData.set}
                onChange={(e) => setFormData({ ...formData, set: e.target.value })}
              />
              <input
                type="text"
                placeholder="Rarity"
                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                value={formData.rarity}
                onChange={(e) => setFormData({ ...formData, rarity: e.target.value })}
              />
              <input
                type="text"
                placeholder="Condition"
                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              />
              <input
                type="number"
                placeholder="Quantity"
                min="1"
                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
              />
              <input
                type="url"
                placeholder="Image URL"
                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              />
              <textarea
                placeholder="Notes"
                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white md:col-span-2"
                rows="3"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
              <button
                type="submit"
                className="md:col-span-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
              >
                Add to Collection
              </button>
            </form>
          </div>
        )}

        {/* Cards List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Your Cards ({cards.length})
            </h2>
          </div>
          {cards.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No cards in your collection yet. Add your first card above!
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex justify-between items-start"
                >
                  <div className="flex gap-4">
                    {card.imageUrl && (
                      <img
                        src={card.imageUrl}
                        alt={card.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        {card.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Set: {card.set}
                      </p>
                      {card.rarity && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Rarity: {card.rarity}
                        </p>
                      )}
                      {card.condition && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Condition: {card.condition}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Quantity: {card.quantity}
                      </p>
                      {card.notes && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          {card.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteCard(card.id)}
                    className="px-3 py-1 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
