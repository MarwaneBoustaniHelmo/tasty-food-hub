import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Game configuration
const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;
const SPEED_INCREMENT = 10;

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Position = { x: number; y: number };

const INITIAL_SNAKE: Position[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];

const getRandomFood = (snake: Position[]): Position => {
  let food: Position;
  do {
    food = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake.some((segment) => segment.x === food.x && segment.y === food.y));
  return food;
};

const SnakeGame = () => {
  const { t } = useTranslation();
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>(getRandomFood(INITIAL_SNAKE));
  const [direction, setDirection] = useState<Direction>("UP");
  const [nextDirection, setNextDirection] = useState<Direction>("UP");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [nickname, setNickname] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Load high score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("snakeHighScore");
    if (saved) setHighScore(parseInt(saved));
  }, []);

  // Game loop
  useEffect(() => {
    if (!isPlaying || isGameOver) {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      return;
    }

    gameLoopRef.current = setInterval(() => {
      moveSnake();
    }, speed);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isPlaying, isGameOver, snake, direction, nextDirection, food, speed]);

  const moveSnake = useCallback(() => {
    setSnake((prevSnake) => {
      const currentDirection = nextDirection;
      setDirection(currentDirection);

      const head = prevSnake[0];
      let newHead: Position;

      switch (currentDirection) {
        case "UP":
          newHead = { x: head.x, y: head.y - 1 };
          break;
        case "DOWN":
          newHead = { x: head.x, y: head.y + 1 };
          break;
        case "LEFT":
          newHead = { x: head.x - 1, y: head.y };
          break;
        case "RIGHT":
          newHead = { x: head.x + 1, y: head.y };
          break;
      }

      // Check wall collision
      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE
      ) {
        setIsGameOver(true);
        setIsPlaying(false);
        return prevSnake;
      }

      // Check self collision
      if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
        setIsGameOver(true);
        setIsPlaying(false);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check food collision
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore((s) => {
          const newScore = s + 10;
          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem("snakeHighScore", newScore.toString());
          }
          return newScore;
        });
        setFood(getRandomFood(newSnake));
        // Increase speed every 50 points
        if ((score + 10) % 50 === 0) {
          setSpeed((s) => Math.max(50, s - SPEED_INCREMENT));
        }
        return newSnake; // Don't remove tail (grow)
      }

      // Remove tail (normal move)
      newSnake.pop();
      return newSnake;
    });
  }, [nextDirection, food, score, highScore]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying || isGameOver) return;

      const key = e.key.toLowerCase();
      setNextDirection((currentDir) => {
        switch (key) {
          case "arrowup":
          case "w":
            return currentDir !== "DOWN" ? "UP" : currentDir;
          case "arrowdown":
          case "s":
            return currentDir !== "UP" ? "DOWN" : currentDir;
          case "arrowleft":
          case "a":
            return currentDir !== "RIGHT" ? "LEFT" : currentDir;
          case "arrowright":
          case "d":
            return currentDir !== "LEFT" ? "RIGHT" : currentDir;
          default:
            return currentDir;
        }
      });
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isPlaying, isGameOver]);

  // Touch/swipe controls
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || !isPlaying || isGameOver) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    if (absDeltaX > 30 || absDeltaY > 30) {
      setNextDirection((currentDir) => {
        if (absDeltaX > absDeltaY) {
          return deltaX > 0
            ? currentDir !== "LEFT" ? "RIGHT" : currentDir
            : currentDir !== "RIGHT" ? "LEFT" : currentDir;
        } else {
          return deltaY > 0
            ? currentDir !== "UP" ? "DOWN" : currentDir
            : currentDir !== "DOWN" ? "UP" : currentDir;
        }
      });
    }

    touchStartRef.current = null;
  };

  const startGame = () => {
    setIsPlaying(true);
    setIsGameOver(false);
  };

  const pauseGame = () => {
    setIsPlaying(false);
  };

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(getRandomFood(INITIAL_SNAKE));
    setDirection("UP");
    setNextDirection("UP");
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setIsGameOver(false);
    setIsPlaying(false);
  };

  const saveScore = async () => {
    if (score === 0) return;

    setIsSaving(true);
    try {
      const { error } = await supabase.from("game_scores").insert({
        player_name: nickname || "Anonymous",
        score: score,
        game_type: "snake",
      } as any);

      if (error) throw error;

      toast({
        title: t("game.scoreSaved"),
        description: t("game.scoreDescription", { score }),
      });
    } catch (error) {
      console.error("Error saving score:", error);
      toast({
        title: t("game.saveError"),
        description: t("game.saveErrorDescription"),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isCellSnake = (x: number, y: number) =>
    snake.some((segment) => segment.x === x && segment.y === y);

  const isCellFood = (x: number, y: number) => food.x === x && food.y === y;

  const isSnakeHead = (x: number, y: number) =>
    snake[0]?.x === x && snake[0]?.y === y;

  return (
    <div className="bg-card rounded-2xl p-4 sm:p-6 border border-border shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-display text-xl sm:text-2xl text-gradient-gold">
            {t("game.title")}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Score: <span className="text-primary font-bold">{score}</span> | 
            Record: <span className="text-gold font-bold">{highScore}</span>
          </p>
        </div>
      </div>

      {/* Game Board */}
      <div className="flex flex-col items-center gap-4">
        <div
          className="relative bg-background border-2 border-border rounded-lg"
          style={{
            width: `${GRID_SIZE * CELL_SIZE}px`,
            height: `${GRID_SIZE * CELL_SIZE}px`,
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Grid cells */}
          {Array.from({ length: GRID_SIZE }).map((_, y) =>
            Array.from({ length: GRID_SIZE }).map((_, x) => {
              const isSnake = isCellSnake(x, y);
              const isFood = isCellFood(x, y);
              const isHead = isSnakeHead(x, y);

              return (
                <div
                  key={`${x}-${y}`}
                  className="absolute transition-colors duration-100"
                  style={{
                    left: `${x * CELL_SIZE}px`,
                    top: `${y * CELL_SIZE}px`,
                    width: `${CELL_SIZE}px`,
                    height: `${CELL_SIZE}px`,
                    backgroundColor: isFood
                      ? "#F59E0B"
                      : isSnake
                      ? isHead
                        ? "#EF4444"
                        : "#FBBF24"
                      : "transparent",
                    borderRadius: isFood ? "50%" : isHead ? "4px" : "2px",
                  }}
                >
                  {isFood && (
                    <span className="flex items-center justify-center h-full text-sm">
                      🍔
                    </span>
                  )}
                </div>
              );
            })
          )}

          {/* Game Over Overlay */}
          {isGameOver && (
            <div className="absolute inset-0 bg-black/80 rounded-lg flex flex-col items-center justify-center gap-3 p-4">
              <h4 className="font-display text-2xl text-gold">
                {t("game.gameOver")}
              </h4>
              <p className="text-white text-center">
                {t("game.finalScore")}: <span className="font-bold">{score}</span>
              </p>
              {score > 0 && (
                <div className="flex flex-col gap-2 w-full max-w-[200px]">
                  <input
                    type="text"
                    placeholder={t("game.nicknamePlaceholder")}
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm"
                    maxLength={20}
                  />
                  <button
                    onClick={saveScore}
                    disabled={isSaving}
                    className="btn-gold text-sm py-2"
                  >
                    {isSaving ? t("game.saving") : t("game.saveScore")}
                  </button>
                </div>
              )}
              <button onClick={resetGame} className="btn-order text-sm py-2 px-6">
                {t("game.playAgain")}
              </button>
            </div>
          )}

          {/* Ready to Play Overlay */}
          {!isPlaying && !isGameOver && (
            <div className="absolute inset-0 bg-black/80 rounded-lg flex flex-col items-center justify-center gap-3">
              <h4 className="font-display text-2xl text-gold">
                {t("game.readyToPlay")}
              </h4>
              <button onClick={startGame} className="btn-gold text-sm py-2 px-8">
                {t("game.startGame")}
              </button>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          {isPlaying && !isGameOver && (
            <button onClick={pauseGame} className="btn-order text-sm py-2 px-6">
              ⏸ Pause
            </button>
          )}
          {!isPlaying && !isGameOver && score > 0 && (
            <button onClick={startGame} className="btn-gold text-sm py-2 px-6">
              ▶ Resume
            </button>
          )}
          <button
            onClick={resetGame}
            className="btn-platform text-sm py-2 px-6"
            disabled={!isGameOver && score === 0}
          >
            🔄 {t("game.playAgain")}
          </button>
        </div>

        {/* Mobile directional buttons */}
        <div className="md:hidden grid grid-cols-3 gap-2 w-[200px]">
          <div></div>
          <button
            onClick={() => setNextDirection((d) => (d !== "DOWN" ? "UP" : d))}
            className="btn-platform text-2xl py-3"
            disabled={!isPlaying || isGameOver}
          >
            ⬆️
          </button>
          <div></div>
          <button
            onClick={() => setNextDirection((d) => (d !== "RIGHT" ? "LEFT" : d))}
            className="btn-platform text-2xl py-3"
            disabled={!isPlaying || isGameOver}
          >
            ⬅️
          </button>
          <button
            onClick={() => setNextDirection((d) => (d !== "UP" ? "DOWN" : d))}
            className="btn-platform text-2xl py-3"
            disabled={!isPlaying || isGameOver}
          >
            ⬇️
          </button>
          <button
            onClick={() => setNextDirection((d) => (d !== "LEFT" ? "RIGHT" : d))}
            className="btn-platform text-2xl py-3"
            disabled={!isPlaying || isGameOver}
          >
            ➡️
          </button>
        </div>

        {/* Instructions */}
        <div className="text-xs text-muted-foreground text-center max-w-md">
          <p className="mb-1">
            <span className="font-semibold">{t("game.howToPlay")}</span>
          </p>
          <p>🎮 Desktop: Arrow keys or WASD to move</p>
          <p>📱 Mobile: Swipe on the grid or use buttons below</p>
          <p>🍔 Eat food to grow and score points!</p>
          <p>💀 Don't hit walls or yourself</p>
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;
