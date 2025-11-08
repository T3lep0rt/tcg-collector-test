import { useState } from 'react';
import Card from './Card';

const Browse = ({ cards, loading, onAddToCollection }) => {
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
      return 0;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
          <p className="text-gray-400 text-lg">Loading cards...</p>
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
              <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400">
                Browse Cards
              </h1>
              <p className="text-gray-400 mt-1">
                {filteredCards.length} {filteredCards.length === 1 ? 'card' : 'cards'} available
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
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Card Grid */}
      <div className="container mx-auto px-4 py-8">
        {filteredCards.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center opacity-50">
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">No Cards Found</h2>
              <p className="text-gray-400">Try adjusting your filters</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {filteredCards.map((card) => (
              <div key={card.id} className="relative group">
                <Card card={card} onClick={() => {}} />
                <button
                  onClick={() => onAddToCollection(card)}
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2
                           bg-gradient-to-r from-green-500 to-emerald-600
                           text-white px-4 py-2 rounded-full font-semibold text-sm
                           opacity-0 group-hover:opacity-100 transition-all duration-300
                           hover:scale-110 shadow-lg hover:shadow-green-500/50
                           flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Browse;
