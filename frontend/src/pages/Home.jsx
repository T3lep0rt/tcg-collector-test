/**
 * Home Page
 * Landing page for the application
 */

import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            TCG Collector
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Organize and manage your trading card game collection
          </p>

          {user ? (
            <div className="space-y-4">
              <p className="text-lg text-gray-700 dark:text-gray-300">
                Welcome back, {user.name || user.email}!
              </p>
              <Link
                to="/collection"
                className="inline-block px-6 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                View My Collection
              </Link>
            </div>
          ) : (
            <div className="space-x-4">
              <Link
                to="/login"
                className="inline-block px-6 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="inline-block px-6 py-3 text-base font-medium text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-blue-600 dark:border-blue-400 rounded-md"
              >
                Create Account
              </Link>
            </div>
          )}

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Track Your Cards
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Keep detailed records of all your trading cards in one place
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Organize by Set
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Sort and filter your collection by set, rarity, and condition
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Personal Profile
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Each user has their own secure collection and profile
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
