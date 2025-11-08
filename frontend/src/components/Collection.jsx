import { useState } from 'react';
import Card from './Card';

const Collection = ({ cards, loading, onCardClick, onRemoveFromCollection }) => {
  const [filterSet, setFilterSet] = useState('all');
  const [filterRarity, setFilterRarity] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Get unique sets and rarities
  const sets = ['all', ...new Set(cards.map(card => card.set))];
  const rarities = ['all', ...new Set(cards.map(card => card.rarity).filter(Boolean))];

  // Filter and sort cards
  const filteredCards = cards
    .filter(card => filterSet === 'all' || card.set === filterSet)
    .filter(card => filterRarity === 'all' || card.rarity === filterRarity)
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'set') return a.set.localeCompare(b.set);
      if (sortBy === 'rarity') return (a.rarity || '').localeCompare(b.rarity || '');
      if (sortBy === 'quantity') return (b.quantity || 0) - (a.quantity || 0);
      return 0;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mb-4"></div>
          <p className="text-gray-400 text-lg">Loading your collection...</p>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Your Collection is Empty</h2>
          <p className="text-gray-400 text-lg mb-6">Start building your collection by browsing available cards!</p>
          <div className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white font-semibold animate-bounce">
            ← Switch to Browse tab to add cards
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-lg border-b border-purple-500/20 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
                My Collection
              </h1>
              <p className="text-gray-400 mt-1">
                {filteredCards.length} {filteredCards.length === 1 ? 'card' : 'cards'} in your collection
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={filterSet}
                onChange={(e) => setFilterSet(e.target.value)}
                className="bg-slate-800/80 text-white border border-purple-500/30 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              >
                {sets.map(set => (
                  <option key={set} value={set}>
                    {set === 'all' ? 'All Sets' : set}
                  </option>
                ))}
              </select>

              <select
                value={filterRarity}
                onChange={(e) => setFilterRarity(e.target.value)}
                className="bg-slate-800/80 text-white border border-purple-500/30 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              >
                {rarities.map(rarity => (
                  <option key={rarity} value={rarity}>
                    {rarity === 'all' ? 'All Rarities' : rarity}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-800/80 text-white border border-purple-500/30 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              >
                <option value="name">Sort by Name</option>
                <option value="set">Sort by Set</option>
                <option value="rarity">Sort by Rarity</option>
                <option value="quantity">Sort by Quantity</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Card Grid with 3D Effects */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {filteredCards.map((card) => (
            <div key={card.id} className="relative group">
              <Card card={card} onClick={onCardClick} />
              {/* Remove button on hover */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFromCollection(card);
                }}
                className="absolute top-2 right-2 z-20
                         bg-red-500/90 hover:bg-red-600
                         text-white p-2 rounded-full
                         opacity-0 group-hover:opacity-100 transition-all duration-300
                         hover:scale-110 shadow-lg"
                title="Remove from collection"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Stats footer */}
      <div className="mt-12 pb-8">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-slate-800/50 to-purple-900/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  {cards.length}
                </div>
                <div className="text-gray-400 text-sm mt-1">Unique Cards</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  {sets.length - 1}
                </div>
                <div className="text-gray-400 text-sm mt-1">Sets</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-400">
                  {cards.filter(c => c.rarity?.toLowerCase().includes('rare')).length}
                </div>
                <div className="text-gray-400 text-sm mt-1">Rare Cards</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                  {cards.reduce((sum, card) => sum + (card.quantity || 1), 0)}
                </div>
                <div className="text-gray-400 text-sm mt-1">Total Quantity</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Collection;
