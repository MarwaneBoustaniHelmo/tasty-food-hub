/**
 * Monthly Leaderboard Component
 * Displays top 3 scores for the current month
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getMonthlyTopScores, getCurrentMonthKey, type GameScore } from '@/lib/gameScores';
import { Trophy, Medal, Award } from 'lucide-react';

export const MonthlyLeaderboard: React.FC = () => {
  const { t } = useTranslation();
  const [scores, setScores] = useState<GameScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    loadScores();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadScores, 30000);
    return () => clearInterval(interval);
  }, []);
  
  const loadScores = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getMonthlyTopScores(3);
      setScores(data);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
      setError('Failed to load leaderboard');
    } finally {
      setIsLoading(false);
    }
  };
  
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return null;
    }
  };
  
  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black';
      case 2:
        return 'bg-gradient-to-r from-gray-400 to-gray-500 text-black';
      case 3:
        return 'bg-gradient-to-r from-amber-600 to-amber-700 text-white';
      default:
        return 'bg-gray-700 text-white';
    }
  };
  
  if (isLoading) {
    return (
      <div className="bg-gray-900 rounded-lg p-4 sm:p-6 border border-gold/20">
        <h3 className="text-xl sm:text-2xl md:text-3xl font-bebas-neue text-gold mb-4 text-center">
          {t('game.leaderboardTitle')}
        </h3>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-gray-900 rounded-lg p-4 sm:p-6 border border-red-500/20">
        <h3 className="text-xl sm:text-2xl md:text-3xl font-bebas-neue text-gold mb-4 text-center">
          {t('game.leaderboardTitle')}
        </h3>
        <p className="text-center text-red-400">{error}</p>
      </div>
    );
  }
  
  const monthKey = getCurrentMonthKey();
  const [year, month] = monthKey.split('-');
  const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long' });
  
  return (
    <div className="bg-gray-900 rounded-lg p-4 sm:p-6 border border-gold/20 shadow-xl">
      {/* Header */}
      <div className="text-center mb-4 sm:mb-6">
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-bebas-neue text-gold mb-1">
          {t('game.leaderboardTitle')}
        </h3>
        <p className="text-xs sm:text-sm text-gray-400 px-2">
          {t('game.leaderboardSubtitle', { month: monthName, year })}
        </p>
      </div>
      
      {/* Scores List */}
      {scores.length === 0 ? (
        <div className="text-center py-6 sm:py-8 text-gray-400 px-4">
          <p className="text-base sm:text-lg mb-2">{t('game.noScores')}</p>
          <p className="text-xs sm:text-sm">{t('game.beFirst')}</p>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {scores.map((score, index) => {
            const rank = index + 1;
            const displayName = score.nickname || t('game.anonymous');
            const date = new Date(score.created_at);
            const dateStr = date.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
            
            return (
              <div
                key={score.id}
                className={`flex items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-lg transition-all hover:scale-105 ${getRankBadge(rank)}`}
              >
                {/* Rank Icon */}
                <div className="flex-shrink-0 hidden sm:block">
                  {getRankIcon(rank)}
                </div>
                
                {/* Rank Number */}
                <div className="flex-shrink-0 w-6 sm:w-8 text-center font-bold text-base sm:text-lg">
                  #{rank}
                </div>
                
                {/* Player Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate text-sm sm:text-base">{displayName}</p>
                  <p className="text-xs opacity-75 hidden sm:block">{dateStr}</p>
                </div>
                
                {/* Score */}
                <div className="flex-shrink-0 text-right">
                  <p className="text-lg sm:text-2xl font-bold">{score.score.toLocaleString()}</p>
                  <p className="text-xs opacity-75">{t('game.points')}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Prize Info */}
      <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-700 text-center">
        <p className="text-xs sm:text-sm text-gray-400 mb-2 px-2">
          {t('game.prizeInfo')}
        </p>
        <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 text-xs px-2">
          <span className="px-2 sm:px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full whitespace-nowrap">
            {t('game.firstPlace')}
          </span>
          <span className="px-2 sm:px-3 py-1 bg-gray-500/20 text-gray-300 rounded-full whitespace-nowrap">
            {t('game.secondPlace')}
          </span>
          <span className="px-2 sm:px-3 py-1 bg-amber-600/20 text-amber-400 rounded-full whitespace-nowrap">
            {t('game.thirdPlace')}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-2 px-2">
          {t('game.validAt')}
        </p>
      </div>
      
      {/* Refresh Button */}
      <div className="mt-3 sm:mt-4 text-center">
        <button
          onClick={loadScores}
          className="text-xs sm:text-sm text-gold hover:text-gold/80 transition-colors touch-target"
        >
          {t('game.refreshLeaderboard')}
        </button>
      </div>
    </div>
  );
};
