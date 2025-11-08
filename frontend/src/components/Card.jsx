import { useState } from 'react';

const Card = ({ card, onClick }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const getRarityColor = (rarity) => {
    const rarityLower = rarity?.toLowerCase() || '';
    if (rarityLower.includes('holo') || rarityLower.includes('rare')) {
      return 'from-yellow-400 via-yellow-500 to-amber-600';
    }
    if (rarityLower.includes('uncommon')) {
      return 'from-gray-400 via-gray-500 to-gray-600';
    }
    return 'from-green-400 via-green-500 to-green-600';
  };

  const getRarityBadge = (rarity) => {
    if (!rarity) return null;

    const rarityLower = rarity.toLowerCase();
    if (rarityLower.includes('holo') || rarityLower.includes('rare')) {
      return (
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
            ★ {rarity}
          </div>
        </div>
      );
    }
    return null;
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(card);
    }
  };

  // Process and validate image URL
  const getProcessedImageUrl = (url) => {
    if (!url) return null;

    // If it's not a valid URL at all (just a number or relative path), return null
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return null;
    }

    // If it's a TCGdex asset URL without quality/extension, add them
    // TCGdex URLs look like: https://assets.tcgdex.net/en/tcgp/A1a/069
    // They need to become: https://assets.tcgdex.net/en/tcgp/A1a/069/low.webp
    if (url.includes('assets.tcgdex.net')) {
      // Check if it already has quality/extension
      if (url.match(/\/(low|high)\.(png|jpg|webp)$/)) {
        return url;
      }
      // Add low quality webp for browse view (recommended by TCGdex)
      return `${url}/low.webp`;
    }

    // For other valid URLs, return as-is
    return url;
  };

  const processedImageUrl = getProcessedImageUrl(card.imageUrl);
  const hasValidImage = processedImageUrl !== null;

  return (
    <div
      className="group relative w-full aspect-[2.5/3.5] cursor-pointer perspective-1000"
      onClick={handleCardClick}
      style={{ perspective: '1000px' }}
    >
      {/* Card Container with 3D transform */}
      <div
        className={`relative w-full h-full transition-all duration-700 transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Front of card */}
        <div className="absolute inset-0 backface-hidden">
          <div className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-3xl">
            {/* Holographic effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none animate-shimmer" />

            {/* Rarity badge */}
            {getRarityBadge(card.rarity)}

            {/* Card image */}
            <div className="relative w-full h-full bg-gradient-to-br from-slate-700 to-slate-900">
              {hasValidImage ? (
                <img
                  src={processedImageUrl}
                  alt={card.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}

              {/* Fallback when no image */}
              <div
                className={`absolute inset-0 flex flex-col items-center justify-center p-4 ${
                  hasValidImage ? 'hidden' : 'flex'
                }`}
              >
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${getRarityColor(card.rarity)} mb-3 flex items-center justify-center shadow-lg`}>
                  <svg
                    className="w-12 h-12 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                    />
                  </svg>
                </div>
                <h3 className="text-white font-bold text-xl text-center mb-2">
                  {card.name}
                </h3>
                <p className="text-gray-300 text-sm text-center">{card.set}</p>
              </div>
            </div>

            {/* Card info overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <h3 className="text-white font-bold text-lg truncate">
                {card.name}
              </h3>
              <div className="flex items-center justify-between text-xs text-gray-300 mt-1">
                <span>{card.set}</span>
                {card.quantity > 1 && (
                  <span className="bg-blue-500 text-white px-2 py-0.5 rounded-full font-semibold">
                    x{card.quantity}
                  </span>
                )}
              </div>
              {card.condition && (
                <p className="text-gray-400 text-xs mt-1">{card.condition}</p>
              )}
            </div>

            {/* Border glow effect */}
            <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-white/30 transition-colors duration-300 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
