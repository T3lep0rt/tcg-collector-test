import { useState, useEffect } from 'react';
import Header from '../components/Header';

const Trades = () => {
  const [activeTab, setActiveTab] = useState('marketplace'); // marketplace, myOffers, myResponses, targetedAtMe
  const [trades, setTrades] = useState([]);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [myCards, setMyCards] = useState([]);
  const [selectedResponseCard, setSelectedResponseCard] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      switch (activeTab) {
        case 'marketplace':
          endpoint = 'http://localhost:3000/api/trades/marketplace';
          break;
        case 'myOffers':
          endpoint = 'http://localhost:3000/api/trades/my-offers';
          break;
        case 'myResponses':
          endpoint = 'http://localhost:3000/api/trades/my-responses';
          break;
        case 'targetedAtMe':
          endpoint = 'http://localhost:3000/api/trades/targeted-at-me';
          break;
      }

      const response = await fetch(endpoint, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (activeTab === 'myResponses') {
          setResponses(data.responses);
        } else {
          setTrades(data.trades || []);
        }
      }
    } catch (error) {
      console.error('Error fetching trades:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyCards = async (rarity) => {
    try {
      const response = await fetch(`http://localhost:3000/api/cards?rarity=${rarity}&limit=100`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setMyCards(data.cards.filter(card => card.quantity > 0));
      }
    } catch (error) {
      console.error('Error fetching cards:', error);
    }
  };

  const handleRespondToTrade = async (trade) => {
    setSelectedTrade(trade);
    await fetchMyCards(trade.requestedRarity);
    setShowResponseModal(true);
  };

  const submitTradeResponse = async () => {
    if (!selectedResponseCard) {
      alert('Please select a card to offer');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/trades/${selectedTrade.id}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          responseCardId: selectedResponseCard,
          message: responseMessage || null
        })
      });

      if (response.ok) {
        alert('Trade response submitted successfully!');
        setShowResponseModal(false);
        setSelectedResponseCard(null);
        setResponseMessage('');
        fetchData();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to submit response');
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('Failed to submit response');
    }
  };

  const acceptTradeResponse = async (tradeId, responseId) => {
    if (!confirm('Are you sure you want to accept this trade? This will exchange the cards.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/trades/${tradeId}/accept/${responseId}`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        alert('Trade completed successfully!');
        fetchData();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to accept trade');
      }
    } catch (error) {
      console.error('Error accepting trade:', error);
      alert('Failed to accept trade');
    }
  };

  const rejectTradeResponse = async (tradeId, responseId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/trades/${tradeId}/reject/${responseId}`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        alert('Response rejected');
        fetchData();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to reject response');
      }
    } catch (error) {
      console.error('Error rejecting response:', error);
    }
  };

  const cancelTrade = async (tradeId) => {
    if (!confirm('Are you sure you want to cancel this trade?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/trades/${tradeId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        alert('Trade cancelled');
        fetchData();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to cancel trade');
      }
    } catch (error) {
      console.error('Error cancelling trade:', error);
    }
  };

  const renderTradeCard = (trade) => (
    <div
      key={trade.id}
      className="bg-gradient-to-br from-slate-800 to-purple-900/50 rounded-xl p-6 border border-purple-500/30 shadow-lg"
    >
      <div className="flex gap-4">
        {/* Offered Card Image */}
        <div className="flex-shrink-0">
          <img
            src={trade.offeredCard.imageUrl || '/placeholder-card.png'}
            alt={trade.offeredCard.name}
            className="w-32 h-auto rounded-lg"
          />
        </div>

        {/* Trade Details */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-white font-bold text-lg">{trade.offeredCard.name}</h3>
              <p className="text-gray-400 text-sm">{trade.offeredCard.set}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              trade.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
              trade.status === 'accepted' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
              'bg-gray-500/20 text-gray-300 border border-gray-500/30'
            }`}>
              {trade.status}
            </span>
          </div>

          <div className="mb-3">
            <div className="flex items-center gap-2 text-sm text-gray-300 mb-1">
              <span className="font-semibold">Offered by:</span>
              <span>{trade.offerer.username || trade.offerer.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <span className="font-semibold">Wants:</span>
              <span className="bg-purple-500/30 px-2 py-1 rounded">Rarity {trade.requestedRarity}</span>
            </div>
          </div>

          {trade.message && (
            <div className="mb-3 p-3 bg-slate-700/50 rounded-lg">
              <p className="text-gray-300 text-sm">{trade.message}</p>
            </div>
          )}

          {/* Responses */}
          {trade.responses && trade.responses.length > 0 && (
            <div className="mt-4">
              <h4 className="text-white font-semibold text-sm mb-2">Responses ({trade.responses.length})</h4>
              <div className="space-y-2">
                {trade.responses.map((resp) => (
                  <div key={resp.id} className="bg-slate-700/30 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={resp.responseCard.imageUrl}
                          alt={resp.responseCard.name}
                          className="w-12 h-auto rounded"
                        />
                        <div>
                          <p className="text-white text-sm font-medium">{resp.responseCard.name}</p>
                          <p className="text-gray-400 text-xs">
                            by {resp.responder.username || resp.responder.name}
                          </p>
                        </div>
                      </div>
                      {activeTab === 'myOffers' && trade.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => acceptTradeResponse(trade.id, resp.id)}
                            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs transition-colors"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => rejectTradeResponse(trade.id, resp.id)}
                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 flex gap-2">
            {activeTab === 'marketplace' && trade.status === 'pending' && (
              <button
                onClick={() => handleRespondToTrade(trade)}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors text-sm font-semibold"
              >
                Respond with Your Card
              </button>
            )}
            {activeTab === 'myOffers' && trade.status === 'pending' && (
              <button
                onClick={() => cancelTrade(trade.id)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-semibold"
              >
                Cancel Trade
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Trading Center
          </h1>
          <p className="text-gray-300 text-lg">
            Offer your cards and respond to trades
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'marketplace'
                ? 'bg-purple-500 text-white'
                : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
            }`}
          >
            Marketplace
          </button>
          <button
            onClick={() => setActiveTab('myOffers')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'myOffers'
                ? 'bg-purple-500 text-white'
                : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
            }`}
          >
            My Offers
          </button>
          <button
            onClick={() => setActiveTab('myResponses')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'myResponses'
                ? 'bg-purple-500 text-white'
                : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
            }`}
          >
            My Responses
          </button>
          <button
            onClick={() => setActiveTab('targetedAtMe')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'targetedAtMe'
                ? 'bg-purple-500 text-white'
                : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
            }`}
          >
            Targeted at Me
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : activeTab === 'myResponses' ? (
          <div className="space-y-4">
            {responses.length > 0 ? (
              responses.map((resp) => (
                <div key={resp.id} className="bg-gradient-to-br from-slate-800 to-purple-900/50 rounded-xl p-6 border border-purple-500/30">
                  <div className="flex gap-4">
                    <img
                      src={resp.responseCard.imageUrl}
                      alt={resp.responseCard.name}
                      className="w-24 h-auto rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg mb-1">
                        You offered: {resp.responseCard.name}
                      </h3>
                      <p className="text-gray-400 text-sm mb-2">
                        In response to: {resp.trade.offeredCard.name}
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-300">Status:</span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          resp.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                          resp.status === 'accepted' ? 'bg-green-500/20 text-green-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {resp.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg">You haven't responded to any trades yet</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {trades.length > 0 ? (
              trades.map(renderTradeCard)
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg">
                  {activeTab === 'marketplace' ? 'No active trades available' :
                   activeTab === 'myOffers' ? 'You haven\'t created any trade offers yet' :
                   'No trades targeted at you'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Response Modal */}
      {showResponseModal && selectedTrade && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-800 to-purple-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 border border-purple-500/30">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-white">
                Respond to Trade
              </h2>
              <button
                onClick={() => {
                  setShowResponseModal(false);
                  setSelectedResponseCard(null);
                  setResponseMessage('');
                }}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <h3 className="text-purple-300 font-semibold mb-2">They are offering:</h3>
              <div className="flex items-center gap-4 bg-slate-700/30 p-4 rounded-lg">
                <img
                  src={selectedTrade.offeredCard.imageUrl}
                  alt={selectedTrade.offeredCard.name}
                  className="w-24 h-auto rounded"
                />
                <div>
                  <p className="text-white font-bold">{selectedTrade.offeredCard.name}</p>
                  <p className="text-gray-400 text-sm">{selectedTrade.offeredCard.set}</p>
                  <p className="text-gray-400 text-sm">Rarity: {selectedTrade.offeredCard.rarity}</p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-purple-300 font-semibold mb-2">
                Select a card to offer (must be Rarity {selectedTrade.requestedRarity}):
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto p-2">
                {myCards.length > 0 ? (
                  myCards.map((card) => (
                    <div
                      key={card.id}
                      onClick={() => setSelectedResponseCard(card.cardId)}
                      className={`cursor-pointer rounded-lg p-2 transition-all ${
                        selectedResponseCard === card.cardId
                          ? 'ring-2 ring-purple-500 bg-purple-500/20'
                          : 'hover:ring-2 hover:ring-purple-400'
                      }`}
                    >
                      <img
                        src={card.imageUrl}
                        alt={card.name}
                        className="w-full h-auto rounded"
                      />
                      <p className="text-white text-xs mt-1 truncate">{card.name}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 col-span-full text-center py-8">
                    You don't have any cards with rarity {selectedTrade.requestedRarity}
                  </p>
                )}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-purple-300 font-semibold mb-2">
                Message (optional):
              </label>
              <textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder="Add a message to your trade response..."
                className="w-full bg-slate-800 text-white border border-purple-500/30 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows="3"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={submitTradeResponse}
                disabled={!selectedResponseCard}
                className="flex-1 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Submit Response
              </button>
              <button
                onClick={() => {
                  setShowResponseModal(false);
                  setSelectedResponseCard(null);
                  setResponseMessage('');
                }}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trades;
