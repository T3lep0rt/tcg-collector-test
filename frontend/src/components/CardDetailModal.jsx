import { useState, useEffect } from 'react';

const CardDetailModal = ({ card, onClose, onUpdate, onDelete, isOwned, currentUserId }) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCard, setEditedCard] = useState({
    condition: card?.condition || 'Near Mint',
    quantity: card?.quantity || 1,
    notes: card?.notes || ''
  });

  // 3D hover effect states
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);

  // Trade offer states
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [requestedRarity, setRequestedRarity] = useState('');
  const [tradeMessage, setTradeMessage] = useState('');
  const [targetUserId, setTargetUserId] = useState('');

  // Prevent scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Update editedCard when card prop changes (for live updates)
  useEffect(() => {
    if (card) {
      setEditedCard({
        condition: card.condition || 'Near Mint',
        quantity: card.quantity || 1,
        notes: card.notes || ''
      });
    }
  }, [card]);

  // Process image URL (same logic as Card component)
  const getProcessedImageUrl = (url) => {
    if (!url) return null;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return null;
    }
    if (url.includes('assets.tcgdex.net')) {
      if (url.match(/\/(low|high)\.(png|jpg|webp)$/)) {
        return url;
      }
      // Use high quality for modal
      return `${url}/high.webp`;
    }
    return url;
  };

  const processedImageUrl = getProcessedImageUrl(card?.imageUrl);

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(card, editedCard);
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to remove "${card?.name}" from your collection?`)) {
      if (onDelete) {
        onDelete(card);
      }
      onClose();
    }
  };

  const handleQuickQuantityChange = (increment) => {
    const currentQuantity = card.quantity || 1;
    const newQuantity = Math.max(1, currentQuantity + increment);

    if (onUpdate) {
      onUpdate(card, {
        condition: card.condition || 'Near Mint',
        quantity: newQuantity,
        notes: card.notes || ''
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // 3D hover effect handlers
  const handleMouseMove = (e) => {
    const cardElement = e.currentTarget;
    const rect = cardElement.getBoundingClientRect();

    // Calculate mouse position relative to card center (0-100%)
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Calculate rotation angles (max ±15 degrees)
    const rotateYValue = ((x - 50) / 50) * 15;
    const rotateXValue = ((y - 50) / 50) * -15;

    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
    setGlarePosition({ x, y });
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setRotateX(0);
    setRotateY(0);
    setGlarePosition({ x: 50, y: 50 });
  };

  // Check if card is a crown card (rarity value >= 7)
  const isCrownCard = (rarity) => {
    if (!rarity) return false;
    const rarityNum = parseInt(rarity);
    return !isNaN(rarityNum) && rarityNum >= 7;
  };

  // Handle creating trade offer
  const handleCreateTradeOffer = async () => {
    if (!requestedRarity) {
      alert('Please select the rarity you want in exchange');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/trades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          offeredCardId: card.cardId,
          requestedRarity,
          targetUserId: targetUserId || null,
          message: tradeMessage || null
        })
      });

      if (response.ok) {
        alert('Trade offer created successfully!');
        setShowTradeModal(false);
        setRequestedRarity('');
        setTradeMessage('');
        setTargetUserId('');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to create trade offer');
      }
    } catch (error) {
      console.error('Error creating trade offer:', error);
      alert('Failed to create trade offer');
    }
  };

  if (!card) return null;

  const conditionOptions = ['Mint', 'Near Mint', 'Lightly Played', 'Moderately Played', 'Heavily Played', 'Damaged'];

  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 animate-fadeIn overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900 rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl border border-purple-500/30 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-slate-900/98 to-purple-900/98 backdrop-blur-xl border-b border-purple-500/30 px-4 sm:px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl sm:text-3xl font-bold text-white truncate">
                {card.name}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-purple-300 text-sm sm:text-base">{card.set}</span>
                {card.rarity && (
                  <span className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    ★ {card.rarity}
                  </span>
                )}
                {isOwned && (
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    In Collection
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {isOwned && !isEditing && (
                <>
                  <button
                    onClick={() => setShowTradeModal(true)}
                    className="p-2 sm:p-3 bg-green-500/80 hover:bg-green-600 text-white rounded-lg transition-all hover:scale-110"
                    title="Create trade offer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 sm:p-3 bg-blue-500/80 hover:bg-blue-600 text-white rounded-lg transition-all hover:scale-110"
                    title="Edit card details"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2 sm:p-3 bg-red-500/80 hover:bg-red-600 text-white rounded-lg transition-all hover:scale-110"
                    title="Remove from collection"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </>
              )}
              <button
                onClick={handlePrint}
                className="hidden sm:block p-2 sm:p-3 bg-slate-700/80 hover:bg-slate-600 text-white rounded-lg transition-all hover:scale-110"
                title="Print card"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
              </button>
              <button
                onClick={onClose}
                className="p-2 sm:p-3 text-gray-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
                title="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-100px)]">
          <div className="p-4 sm:p-6">
            {/* Card Image - Centered at Top with 3D Hover */}
            <div className="flex justify-center mb-8">
              <div
                className="w-full max-w-md"
                style={{ perspective: '1000px' }}
              >
                <div
                  className={`relative w-full aspect-[2.5/3.5] cursor-pointer ${
                    isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
                  }`}
                  onMouseMove={handleMouseMove}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => setIsZoomed(!isZoomed)}
                  style={{
                    transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) ${isZoomed ? 'scale(1.5)' : 'scale(1)'}`,
                    transition: isHovering && !isZoomed ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <div className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-700 to-slate-900">
                    {/* Holographic effect overlay - golden for crown cards */}
                    {isCrownCard(card.rarity) ? (
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/30 via-amber-400/30 to-yellow-600/30 opacity-0 hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none animate-golden-shimmer" />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20 opacity-0 hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none animate-shimmer" />
                    )}

                    {/* Dynamic glare effect that follows mouse - golden for crown cards */}
                    <div
                      className="absolute inset-0 z-20 pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: isCrownCard(card.rarity)
                          ? `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 215, 0, 0.9) 0%, rgba(255, 223, 0, 0.5) 20%, transparent 50%)`
                          : `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.3) 20%, transparent 50%)`,
                        mixBlendMode: 'overlay',
                      }}
                    />

                    {/* Card Image */}
                    {processedImageUrl ? (
                      <img
                        src={processedImageUrl}
                        alt={card.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <svg className="w-24 h-24 mx-auto text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-gray-400">No image available</p>
                        </div>
                      </div>
                    )}

                    {/* Zoom hint */}
                    {processedImageUrl && (
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs z-30">
                        Click to {isZoomed ? 'zoom out' : 'zoom in'}
                      </div>
                    )}

                    {/* Border glow effect - golden for crown cards */}
                    <div
                      className={`absolute inset-0 rounded-xl border-2 border-transparent transition-colors duration-300 pointer-events-none ${
                        isCrownCard(card.rarity)
                          ? 'hover:border-yellow-400/50 hover:shadow-[0_0_20px_rgba(255,215,0,0.5)]'
                          : 'hover:border-white/30'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Stats and Details Below Card */}
            <div className="space-y-6">
              {/* Quick Stats - Full Width */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-4">
                  <div className="text-purple-300 text-xs font-medium mb-1">Rarity</div>
                  <div className="text-white font-bold text-lg">{card.rarity || 'N/A'}</div>
                </div>
                <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg p-4">
                  <div className="text-blue-300 text-xs font-medium mb-1">Set</div>
                  <div className="text-white font-bold text-lg truncate" title={card.set}>{card.set}</div>
                </div>
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-4">
                  <div className="text-green-300 text-xs font-medium mb-1">Status</div>
                  <div className="text-white font-bold text-sm">{isOwned ? 'Owned' : 'Not Owned'}</div>
                </div>
                {isOwned && card.quantity > 0 && (
                  <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-lg p-4">
                    <div className="text-amber-300 text-xs font-medium mb-1">Copies</div>
                    <div className="text-white font-bold text-lg">{card.quantity}</div>
                  </div>
                )}
              </div>

              {/* Detailed Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {isEditing ? (
                  /* Edit Mode - Full Width */
                  <div className="lg:col-span-2">
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <h3 className="text-blue-300 font-semibold">Edit Card Details</h3>
                      </div>

                      <div className="space-y-4">
                        {/* Condition */}
                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">
                            Condition
                          </label>
                          <select
                            value={editedCard.condition}
                            onChange={(e) => setEditedCard({ ...editedCard, condition: e.target.value })}
                            className="w-full bg-slate-800 text-white border border-purple-500/30 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            {conditionOptions.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>

                        {/* Quantity */}
                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">
                            Quantity
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="999"
                            value={editedCard.quantity}
                            onChange={(e) => setEditedCard({ ...editedCard, quantity: parseInt(e.target.value) || 1 })}
                            className="w-full bg-slate-800 text-white border border-purple-500/30 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        {/* Notes */}
                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">
                            Notes
                          </label>
                          <textarea
                            value={editedCard.notes}
                            onChange={(e) => setEditedCard({ ...editedCard, notes: e.target.value })}
                            rows="4"
                            className="w-full bg-slate-800 text-white border border-purple-500/30 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                            placeholder="Add notes about this card..."
                          />
                        </div>

                        {/* Save/Cancel Buttons */}
                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={handleSave}
                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-lg font-semibold hover:scale-105 transition-transform"
                          >
                            Save Changes
                          </button>
                          <button
                            onClick={() => {
                              setIsEditing(false);
                              setEditedCard({
                                condition: card.condition || 'Near Mint',
                                quantity: card.quantity || 1,
                                notes: card.notes || ''
                              });
                            }}
                            className="px-4 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <>
                    {/* Card Information */}
                    <div className="bg-slate-800/50 rounded-lg border border-purple-500/20 p-4">
                      <h3 className="text-purple-300 font-semibold mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Card Information
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Name</p>
                          <p className="text-white font-medium">{card.name}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Set</p>
                          <p className="text-white font-medium">{card.set}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Rarity</p>
                          <p className="text-white font-medium">{card.rarity || 'N/A'}</p>
                        </div>
                        {card.cardId && (
                          <div>
                            <p className="text-gray-400 text-xs mb-1">Card ID</p>
                            <p className="text-white font-medium text-xs break-all">{card.cardId}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Collection Details (if owned) */}
                    {isOwned && (
                      <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-4">
                        <h3 className="text-purple-300 font-semibold mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          Your Collection Details
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-gray-400 text-xs mb-1">Condition</p>
                            <p className="text-white font-medium">{card.condition || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs mb-1">Quantity</p>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickQuantityChange(-1);
                                }}
                                disabled={(card.quantity || 1) <= 1}
                                className={`p-1 rounded-lg transition-all ${
                                  (card.quantity || 1) <= 1
                                    ? 'bg-slate-700/30 text-gray-500 cursor-not-allowed'
                                    : 'bg-red-500/80 hover:bg-red-600 text-white hover:scale-110'
                                }`}
                                title="Decrease quantity"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                              </button>
                              <span className="text-white font-bold text-lg min-w-[2rem] text-center">
                                {card.quantity || 1}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickQuantityChange(1);
                                }}
                                className="p-1 bg-green-500/80 hover:bg-green-600 text-white rounded-lg transition-all hover:scale-110"
                                title="Increase quantity"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                        {card.notes && (
                          <div className="mt-3 pt-3 border-t border-purple-500/20">
                            <p className="text-gray-400 text-xs mb-1">Notes</p>
                            <p className="text-white text-sm">{card.notes}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Market Info Placeholder */}
                    <div className="bg-slate-800/50 rounded-lg border border-purple-500/20 p-4">
                      <h3 className="text-purple-300 font-semibold mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Market Information
                      </h3>
                      <div className="text-center py-4">
                        <p className="text-gray-400 text-sm">Market pricing data coming soon</p>
                        <p className="text-gray-500 text-xs mt-1">Integration with TCGPlayer API planned</p>
                      </div>
                    </div>

                    {/* Additional Card Stats */}
                    <div className="bg-slate-800/50 rounded-lg border border-purple-500/20 p-4">
                      <h3 className="text-purple-300 font-semibold mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Additional Stats
                      </h3>
                      <div className="space-y-2">
                        {card.cardId && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-sm">Card ID</span>
                            <span className="text-white font-mono text-xs">{card.cardId}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Print View Info */}
        <div className="hidden print:block p-6 border-t border-purple-500/20">
          <p className="text-gray-400 text-sm text-center">
            Printed from TCG Collector - {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Trade Offer Modal */}
      {showTradeModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-800 to-purple-900 rounded-2xl w-full max-w-md p-6 border border-purple-500/30">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-white">
                Create Trade Offer
              </h2>
              <button
                onClick={() => setShowTradeModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <h3 className="text-purple-300 font-semibold mb-2">You are offering:</h3>
              <div className="flex items-center gap-3 bg-slate-700/30 p-3 rounded-lg">
                <img
                  src={processedImageUrl}
                  alt={card.name}
                  className="w-16 h-auto rounded"
                />
                <div>
                  <p className="text-white font-bold">{card.name}</p>
                  <p className="text-gray-400 text-sm">{card.set}</p>
                  <p className="text-gray-400 text-sm">Rarity: {card.rarity}</p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-purple-300 font-semibold mb-2">
                Requested Rarity: *
              </label>
              <select
                value={requestedRarity}
                onChange={(e) => setRequestedRarity(e.target.value)}
                className="w-full bg-slate-800 text-white border border-purple-500/30 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select rarity...</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
              </select>
              <p className="text-gray-400 text-xs mt-1">
                Other users with this rarity can respond to your trade
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-purple-300 font-semibold mb-2">
                Message (optional):
              </label>
              <textarea
                value={tradeMessage}
                onChange={(e) => setTradeMessage(e.target.value)}
                placeholder="Add a message to your trade offer..."
                className="w-full bg-slate-800 text-white border border-purple-500/30 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows="3"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCreateTradeOffer}
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Create Offer
              </button>
              <button
                onClick={() => {
                  setShowTradeModal(false);
                  setRequestedRarity('');
                  setTradeMessage('');
                }}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .fixed {
            position: static;
          }
          button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CardDetailModal;
