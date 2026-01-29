/**
 * Falling Food Catcher - Main Game Component
 * Canvas2D arcade game with keyboard + touch controls
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { submitScore } from '@/lib/gameScores';
import {
  GameState,
  GameObject,
  Player,
  GameStats,
  InputState,
  DEFAULT_CONFIG,
  GOOD_OBJECTS,
  BAD_OBJECTS,
} from './types';
import { useToast } from '@/hooks/use-toast';

export const FallingFoodGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number | null>(null);
  const lastSpawnRef = useRef<number>(0);
  const lastFrameRef = useRef<number>(0);
  const gameStateRef = useRef<GameState>('idle');
  
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [gameState, setGameState] = useState<GameState>('idle');
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    mistakeCount: 0, // Consecutive bad catches (3 = Game Over)
    level: 1,
    objectsCaught: 0,
    objectsMissed: 0,
    startTime: 0,
    duration: 0,
  });
  const [nickname, setNickname] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Game state refs (for requestAnimationFrame access)
  const playerRef = useRef<Player>({
    x: DEFAULT_CONFIG.canvasWidth / 2 - 30,
    y: DEFAULT_CONFIG.canvasHeight - 80,
    width: 60,
    height: 40,
    speed: DEFAULT_CONFIG.playerSpeed,
    emoji: '🍱',
  });
  
  const objectsRef = useRef<GameObject[]>([]);
  const inputRef = useRef<InputState>({ left: false, right: false, touchX: null });
  const configRef = useRef({ ...DEFAULT_CONFIG });
  const statsRef = useRef<GameStats>(stats); // Keep ref in sync for game loop access
  
  // Sync refs with state
  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);
  
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);
  
  // ============================================================================
  // COLLISION DETECTION (AABB)
  // ============================================================================
  const checkCollision = (obj: GameObject, player: Player): boolean => {
    return (
      obj.x < player.x + player.width &&
      obj.x + obj.width > player.x &&
      obj.y < player.y + player.height &&
      obj.y + obj.height > player.y
    );
  };
  
  // ============================================================================
  // SPAWN OBJECTS
  // ============================================================================
  const spawnObject = () => {
    if (objectsRef.current.length >= configRef.current.maxObjects) return;
    
    const isGood = Math.random() < 0.7; // 70% good, 30% bad
    const pool = isGood ? GOOD_OBJECTS : BAD_OBJECTS;
    const template = pool[Math.floor(Math.random() * pool.length)];
    
    const obj: GameObject = {
      id: `obj-${Date.now()}-${Math.random()}`,
      x: Math.random() * (configRef.current.canvasWidth - 40),
      y: -50,
      width: 40,
      height: 40,
      speed: configRef.current.initialObjectSpeed + (statsRef.current.level - 1) * configRef.current.speedIncreaseRate,
      type: isGood ? 'good' : 'bad',
      emoji: template.emoji,
      points: template.points,
    };
    
    objectsRef.current.push(obj);
  };
  
  // ============================================================================
  // GAME CONTROL
  // ============================================================================
  const endGame = useCallback(() => {
    setGameState('gameover');
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = null;
    }
  }, []);
  
  const startGame = useCallback(() => {
    console.log('[Game] Starting game...');
    setGameState('playing');
    setStats({
      score: 0,
      mistakeCount: 0, // Reset consecutive mistakes
      level: 1,
      objectsCaught: 0,
      objectsMissed: 0,
      startTime: Date.now(),
      duration: 0,
    });
    objectsRef.current = [];
    playerRef.current.x = DEFAULT_CONFIG.canvasWidth / 2 - 30;
    configRef.current = { ...DEFAULT_CONFIG };
    lastSpawnRef.current = Date.now();
    lastFrameRef.current = Date.now();
    
    toast({
      title: '🎮 ' + t('game.startGame'),
      description: t('game.rule1'),
    });
  }, [toast, t]);
  
  // ============================================================================
  // UPDATE GAME STATE
  // ============================================================================
  const updateGame = (deltaTime: number) => {
    const player = playerRef.current;
    const input = inputRef.current;
    const config = configRef.current;
    
    // Update player position
    if (input.left && player.x > 0) {
      player.x -= player.speed;
    }
    if (input.right && player.x < config.canvasWidth - player.width) {
      player.x += player.speed;
    }
    
    // Touch tracking
    if (input.touchX !== null) {
      const targetX = input.touchX - player.width / 2;
      const clampedX = Math.max(0, Math.min(config.canvasWidth - player.width, targetX));
      player.x = clampedX;
    }
    
    // Update objects
    const newObjects: GameObject[] = [];
    let scoreChange = 0;
    let mistakeChange = 0;
    let resetMistakes = false;
    let caught = 0;
    let missed = 0;
    
    for (const obj of objectsRef.current) {
      obj.y += obj.speed;
      
      // Collision detection
      if (checkCollision(obj, player)) {
        caught++;
        
        if (obj.type === 'bad') {
          // Bad object caught: lose points and increment mistake counter
          scoreChange += obj.points; // Points are negative for bad objects
          mistakeChange += 1;
          console.log(`[Game] BAD caught! Points: ${obj.points}, Mistake count increasing`);
        } else {
          // Good object caught: gain points and reset mistake counter
          scoreChange += obj.points;
          resetMistakes = true;
          console.log(`[Game] GOOD caught! Points: ${obj.points}, Mistakes reset`);
        }
        
        continue; // Remove caught object
      }
      
      // Remove objects that fell off screen
      if (obj.y > config.canvasHeight) {
        if (obj.type === 'good') {
          missed++;
        }
        continue;
      }
      
      newObjects.push(obj);
    }
    
    objectsRef.current = newObjects;
    
    // Update stats
    if (scoreChange !== 0 || mistakeChange !== 0 || resetMistakes || caught > 0 || missed > 0) {
      setStats((prev) => {
        const newScore = Math.max(0, prev.score + scoreChange);
        const newMistakeCount = resetMistakes ? 0 : Math.min(3, prev.mistakeCount + mistakeChange);
        const newLevel = Math.floor(newScore / 500) + 1;
        
        console.log(`[Game] Score: ${newScore}, Mistakes: ${newMistakeCount}, Level: ${newLevel}`);
        
        // Game over if 3 consecutive mistakes
        if (newMistakeCount >= 3) {
          console.log('[Game] GAME OVER! 3 consecutive mistakes');
          setTimeout(() => endGame(), 100);
        }
        
        // Update difficulty
        if (newLevel > prev.level) {
          configRef.current.initialObjectSpeed += configRef.current.speedIncreaseRate;
          configRef.current.spawnInterval *= configRef.current.spawnRateIncreaseRate;
          console.log(`[Game] LEVEL UP! New level: ${newLevel}`);
        }
        
        return {
          ...prev,
          score: newScore,
          mistakeCount: newMistakeCount,
          level: newLevel,
          objectsCaught: prev.objectsCaught + caught,
          objectsMissed: prev.objectsMissed + missed,
          duration: (Date.now() - prev.startTime) / 1000,
        };
      });
    }
  };
  
  // ============================================================================
  // RENDER GAME
  // ============================================================================
  const renderGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const config = configRef.current;
    const player = playerRef.current;
    const currentStats = statsRef.current;
    
    // Clear canvas with dark background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, config.canvasWidth, config.canvasHeight);
    
    // Draw grid pattern for visual interest
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 1;
    for (let i = 0; i < config.canvasWidth; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, config.canvasHeight);
      ctx.stroke();
    }
    for (let j = 0; j < config.canvasHeight; j += 40) {
      ctx.beginPath();
      ctx.moveTo(0, j);
      ctx.lineTo(config.canvasWidth, j);
      ctx.stroke();
    }
    
    // Draw objects
    ctx.font = '32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    for (const obj of objectsRef.current) {
      ctx.fillText(obj.emoji, obj.x + obj.width / 2, obj.y + obj.height / 2);
    }
    
    // Draw player
    ctx.font = '36px Arial';
    ctx.fillText(player.emoji, player.x + player.width / 2, player.y + player.height / 2);
    
    // Draw HUD
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'left';
    ctx.fillText(`${t('game.score')}: ${currentStats.score}`, 10, 30);
    
    // Show mistakes with visual indicator (0-2 safe, 3 = Game Over)
    const mistakeEmojis = '❌'.repeat(currentStats.mistakeCount) + '✓'.repeat(Math.max(0, 3 - currentStats.mistakeCount));
    ctx.fillText(`${t('game.mistakes')}: ${mistakeEmojis}`, 10, 60);
    
    ctx.fillText(`${t('game.level')}: ${currentStats.level}`, config.canvasWidth - 120, 30);
  };
  
  // ============================================================================
  // GAME LOOP
  // ============================================================================
  const gameLoop = (timestamp: number) => {
    // Check if still playing
    if (gameStateRef.current !== 'playing') {
      return;
    }
    
    const deltaTime = timestamp - lastFrameRef.current;
    lastFrameRef.current = timestamp;
    
    // Spawn objects
    if (timestamp - lastSpawnRef.current > configRef.current.spawnInterval) {
      spawnObject();
      lastSpawnRef.current = timestamp;
    }
    
    // Update and render
    updateGame(deltaTime);
    renderGame();
    
    // Continue loop
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  };
  
  // ============================================================================
  // FLOATING TEXT EFFECT
  // ============================================================================
  const showFloatingText = (x: number, y: number, text: string, color: string) => {
    // Simple implementation - in production, use a more sophisticated system
    console.log(`[Floating Text] ${text} at (${x}, ${y})`);
  };
  
  // ============================================================================
  // SAVE SCORE HANDLER
  // ============================================================================
  const handleSaveScore = async () => {
    if (stats.score === 0) return;
    
    setIsSaving(true);
    try {
      const result = await submitScore({
        score: stats.score,
        nickname: nickname.trim() || undefined,
      });
      
      if (result) {
        toast({
          title: t('game.scoreSaved'),
          description: t('game.scoreDescription', { score: stats.score }),
        });
        setNickname('');
      } else {
        toast({
          title: t('game.saveError'),
          description: t('game.saveErrorDescription'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Save score error:', error);
      toast({
        title: t('game.saveError'),
        description: t('game.saveErrorDescription'),
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // ============================================================================
  // INPUT HANDLERS
  // ============================================================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        inputRef.current.left = true;
        e.preventDefault();
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        inputRef.current.right = true;
        e.preventDefault();
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        inputRef.current.left = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        inputRef.current.right = false;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);
  
  // Touch/Mouse handlers
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (gameState !== 'playing') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    inputRef.current.touchX = x;
  };
  
  const handlePointerUp = () => {
    inputRef.current.touchX = null;
  };
  
  // Start game loop when playing
  useEffect(() => {
    if (gameState === 'playing') {
      console.log('[Game] Starting game loop...');
      lastFrameRef.current = Date.now();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    
    return () => {
      if (gameLoopRef.current) {
        console.log('[Game] Stopping game loop');
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, [gameState]);
  
  // Initial canvas render
  useEffect(() => {
    renderGame();
  }, []);
  
  // ============================================================================
  // RENDER UI
  // ============================================================================
  return (
    <div className="flex flex-col items-center gap-4 sm:gap-6 py-4 sm:py-8">
      {/* Game Title */}
      <div className="text-center px-4">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bebas-neue text-gold mb-2">
          🍔 {t('game.title')} 🍟
        </h2>
        <p className="text-sm sm:text-base text-gray-300">
          {t('game.instructions')}{' '}
          <kbd className="px-2 py-1 bg-gray-800 rounded text-xs sm:text-sm">←→</kbd> {t('game.instructionsOr')}{' '}
          <kbd className="px-2 py-1 bg-gray-800 rounded text-xs sm:text-sm">A D</kbd> {t('game.instructionsMove')}
        </p>
      </div>
      
      {/* Game Canvas */}
      <div className="relative w-full max-w-md px-4 sm:px-0">
        <canvas
          ref={canvasRef}
          width={DEFAULT_CONFIG.canvasWidth}
          height={DEFAULT_CONFIG.canvasHeight}
          className="w-full max-w-[400px] h-auto border-4 border-gold rounded-lg shadow-2xl bg-gray-900"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
        
        {/* Overlay Messages */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg">
            <div className="text-center space-y-4">
              <p className="text-2xl font-bold text-white mb-4">{t('game.readyToPlay')}</p>
              <Button onClick={startGame} size="lg" className="bg-red-cta hover:bg-red-cta/90">
                {t('game.startGame')}
              </Button>
            </div>
          </div>
        )}
        
        {gameState === 'gameover' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90 rounded-lg">
            <div className="text-center space-y-4 p-6">
              <h3 className="text-3xl font-bebas-neue text-gold">{t('game.gameOver')}</h3>
              <div className="text-white space-y-2">
                <p className="text-xl">{t('game.finalScore')}: <span className="text-gold font-bold">{stats.score}</span></p>
                <p>{t('game.levelReached')}: {stats.level}</p>
                <p>{t('game.itemsCaught')}: {stats.objectsCaught}</p>
                <p>{t('game.duration')}: {stats.duration.toFixed(1)}{t('game.seconds')}</p>
              </div>
              
              {/* Save Score */}
              <div className="space-y-3 pt-4">
                <Input
                  placeholder={t('game.nicknamePlaceholder')}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  maxLength={20}
                  className="bg-gray-800 text-white"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveScore}
                    disabled={isSaving || stats.score === 0}
                    className="flex-1 bg-gold text-black hover:bg-gold/90"
                  >
                    {isSaving ? t('game.saving') : t('game.saveScore')}
                  </Button>
                  <Button onClick={startGame} variant="outline" className="flex-1">
                    {t('game.playAgain')}
                  </Button>
                </div>
              </div>
              
              <p className="text-sm text-gray-400 pt-2">
                {t('game.prizeNotice')}
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Mobile Touch Controls (when playing) */}
      {gameState === 'playing' && (
        <div className="flex gap-3 lg:hidden w-full max-w-md px-4">
          <Button
            size="lg"
            variant="outline"
            onPointerDown={() => { inputRef.current.left = true; }}
            onPointerUp={() => { inputRef.current.left = false; }}
            onPointerLeave={() => { inputRef.current.left = false; }}
            className="flex-1 h-14 sm:h-16 text-2xl sm:text-3xl touch-target"
          >
            ←
          </Button>
          <Button
            size="lg"
            variant="outline"
            onPointerDown={() => { inputRef.current.right = true; }}
            onPointerUp={() => { inputRef.current.right = false; }}
            onPointerLeave={() => { inputRef.current.right = false; }}
            className="flex-1 h-14 sm:h-16 text-2xl sm:text-3xl touch-target"
          >
            →
          </Button>
        </div>
      )}
      
      {/* How to Play */}
      <div className="bg-gray-900 rounded-lg p-4 sm:p-5 w-full max-w-md mx-4 text-sm sm:text-base text-gray-300">
        <h4 className="font-bold text-gold mb-3">{t('game.howToPlay')}</h4>
        <ul className="space-y-2 list-disc list-inside leading-relaxed">
          <li>{t('game.rule1')}</li>
          <li>{t('game.rule2')}</li>
          <li>{t('game.rule3')}</li>
          <li>{t('game.rule4')}</li>
        </ul>
      </div>
    </div>
  );
};
