/**
 * Supabase Integration for Arcade Game Scores
 * Handles score submission, monthly leaderboards, and anti-spam validation
 */

import { supabase } from './supabase';

export interface GameScore {
  id: string;
  nickname: string | null;
  score: number;
  created_at: string;
  month_key: string;
}

export interface SubmitScoreParams {
  score: number;
  nickname?: string;
  sessionId?: string;
}

/**
 * Get current month key in YYYY-MM format
 */
export function getCurrentMonthKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Generate a browser session ID (stored in sessionStorage)
 */
export function getSessionId(): string {
  const key = 'tastyfood_game_session';
  let sessionId = sessionStorage.getItem(key);
  
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(key, sessionId);
  }
  
  return sessionId;
}

/**
 * Validate score before submission (anti-cheat)
 * Max score: 10,000 points (assumes ~100 catches at 100 pts each)
 */
function validateScore(score: number): boolean {
  if (score < 0 || score > 10000) {
    console.warn('[GameScores] Invalid score rejected:', score);
    return false;
  }
  
  if (!Number.isInteger(score)) {
    console.warn('[GameScores] Non-integer score rejected:', score);
    return false;
  }
  
  return true;
}

/**
 * Submit a game score to Supabase
 * Returns the inserted score record or null on error
 */
export async function submitScore(params: SubmitScoreParams): Promise<GameScore | null> {
  const { score, nickname, sessionId } = params;
  
  // Validate score
  if (!validateScore(score)) {
    throw new Error('Invalid score value');
  }
  
  const monthKey = getCurrentMonthKey();
  const finalSessionId = sessionId || getSessionId();
  
  try {
    const { data, error } = await supabase
      .from('game_scores')
      .insert({
        score,
        nickname: nickname?.trim() || null,
        month_key: monthKey,
        session_id: finalSessionId,
      })
      .select()
      .single();
    
    if (error) {
      console.error('[GameScores] Submit error:', error);
      throw error;
    }
    
    console.log('[GameScores] Score submitted:', data);
    return data as GameScore;
  } catch (error) {
    console.error('[GameScores] Failed to submit score:', error);
    return null;
  }
}

/**
 * Get top N scores for the current month
 * Default: top 3 for prize distribution
 */
export async function getMonthlyTopScores(limit: number = 3): Promise<GameScore[]> {
  const monthKey = getCurrentMonthKey();
  
  try {
    const { data, error } = await supabase
      .from('game_scores')
      .select('*')
      .eq('month_key', monthKey)
      .order('score', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('[GameScores] Query error:', error);
      throw error;
    }
    
    return (data as GameScore[]) || [];
  } catch (error) {
    console.error('[GameScores] Failed to fetch leaderboard:', error);
    return [];
  }
}

/**
 * Get all-time top scores (for historical display)
 */
export async function getAllTimeTopScores(limit: number = 10): Promise<GameScore[]> {
  try {
    const { data, error } = await supabase
      .from('game_scores')
      .select('*')
      .order('score', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('[GameScores] Query error:', error);
      throw error;
    }
    
    return (data as GameScore[]) || [];
  } catch (error) {
    console.error('[GameScores] Failed to fetch all-time scores:', error);
    return [];
  }
}

/**
 * Get player's rank for current month
 */
export async function getPlayerRank(score: number): Promise<number | null> {
  const monthKey = getCurrentMonthKey();
  
  try {
    const { count, error } = await supabase
      .from('game_scores')
      .select('*', { count: 'exact', head: true })
      .eq('month_key', monthKey)
      .gt('score', score);
    
    if (error) {
      console.error('[GameScores] Rank query error:', error);
      return null;
    }
    
    // Rank is the number of scores higher than this one, plus 1
    return (count || 0) + 1;
  } catch (error) {
    console.error('[GameScores] Failed to get rank:', error);
    return null;
  }
}
