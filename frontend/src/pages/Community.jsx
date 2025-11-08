import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Card from '../components/Card';
import CardDetailModal from '../components/CardDetailModal';

const Community = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userCards, setUserCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [page, searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12'
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`http://localhost:3000/api/users?${params}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCollection = async (userId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/users/${userId}/collection?limit=50`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUserCards(data.cards);
        const user = users.find(u => u.id === userId);
        setSelectedUser(user);
      }
    } catch (error) {
      console.error('Error fetching collection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page on search
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Community
          </h1>
          <p className="text-gray-300 text-lg">
            Browse other collectors and their collections
          </p>
        </div>

        {!selectedUser ? (
          <>
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-md mx-auto">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full bg-slate-800 text-white border border-purple-500/30 rounded-lg px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <svg
                  className="absolute left-3 top-3.5 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Users Grid */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : users.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => fetchUserCollection(user.id)}
                      className="bg-gradient-to-br from-slate-800 to-purple-900/50 rounded-xl p-6 border border-purple-500/30 cursor-pointer hover:border-purple-500 hover:scale-105 transition-all duration-300 shadow-lg"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.username || user.name}
                            className="w-16 h-16 rounded-full border-2 border-purple-500"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <span className="text-2xl font-bold text-white">
                              {(user.username || user.name || 'U')[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-bold text-lg truncate">
                            {user.username || user.name || 'Anonymous'}
                          </h3>
                          <p className="text-gray-400 text-sm">
                            {user._count.inventory} cards
                          </p>
                        </div>
                      </div>

                      {user.bio && (
                        <p className="text-gray-300 text-sm line-clamp-2 mb-3">
                          {user.bio}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                        <button className="text-purple-400 hover:text-purple-300 font-semibold">
                          View Collection →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 text-white">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg">No users found</p>
              </div>
            )}
          </>
        ) : (
          <>
            {/* User Collection View */}
            <button
              onClick={() => {
                setSelectedUser(null);
                setUserCards([]);
              }}
              className="mb-6 flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Users
            </button>

            <div className="bg-gradient-to-br from-slate-800 to-purple-900/50 rounded-xl p-6 border border-purple-500/30 mb-8">
              <div className="flex items-center gap-4">
                {selectedUser.avatar ? (
                  <img
                    src={selectedUser.avatar}
                    alt={selectedUser.username || selectedUser.name}
                    className="w-20 h-20 rounded-full border-2 border-purple-500"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">
                      {(selectedUser.username || selectedUser.name || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h2 className="text-3xl font-bold text-white">
                    {selectedUser.username || selectedUser.name || 'Anonymous'}
                  </h2>
                  <p className="text-gray-400">{selectedUser._count.inventory} cards in collection</p>
                  {selectedUser.bio && <p className="text-gray-300 mt-2">{selectedUser.bio}</p>}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : userCards.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {userCards.map((card) => (
                  <Card
                    key={card.id}
                    card={card}
                    onClick={() => setSelectedCard(card)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg">This user has no cards yet</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Card Detail Modal */}
      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          isOwned={false}
          currentUserId={null}
        />
      )}
    </div>
  );
};

export default Community;
