/**
 * Companion display card — shown by /buddy (no args).
 * Mirrors official vc8 component: bordered box with sprite, stats, last reaction.
 */
import React, { useEffect, useState } from 'react';
import { Box, Text, useTheme, useAnimationFrame } from '../ink.js';
import { useInput } from '../ink.js';
import { getTheme, type Theme } from '../utils/theme.js';
import { renderSprite, SHIMMER_PAUSE, SHIMMER_SPEED, SHIMMER_WAIT } from './sprites.js';
import { RARITY_COLORS, RARITY_STARS, STAT_NAMES, type Companion } from './types.js';
import { renderShimmerLine } from './shimmer.js';

const CARD_WIDTH = 40;
const CARD_PADDING_X = 2;

function StatBar({ name, value }: { name: string; value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  const filled = Math.round(clamped / 10);
  const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(10 - filled);
  return (
    <Text>
      {name.padEnd(10)} {bar} {String(value).padStart(3)}
    </Text>
  );
}

export function CompanionCard({
  companion,
  lastReaction,
  onDone,
}: {
  companion: Companion;
  lastReaction?: string;
  onDone?: (result?: string, options?: { display?: string }) => void;
}) {
  const color = RARITY_COLORS[companion.rarity];
  const stars = RARITY_STARS[companion.rarity];
  const [themeName] = useTheme();
  const theme = getTheme(themeName);

  // Shimmer animation state
  const [isShimmering, setIsShimmering] = useState(false);

  // Use Ink's useAnimationFrame for smooth shimmer movement
  const [, charTime] = useAnimationFrame(
    companion.shiny && isShimmering ? 16 : null
  );

  // Calculate glimmer position (moves left to right across the sprite)
  const glimmerIndex = Math.floor(charTime / SHIMMER_SPEED);

  // Set up shimmer phase scheduling
  useEffect(() => {
    if (!companion.shiny) return;

    // Start shimmering immediately
    setIsShimmering(true);

    // Schedule shimmer phase end and next start
    const scheduleNextCycle = () => {
      const shimmerTimer = setTimeout(() => {
        setIsShimmering(false);

        // Fixed wait duration
        const waitTimer = setTimeout(() => {
          setIsShimmering(true);
          scheduleNextCycle();
        }, SHIMMER_WAIT);

        timers.push(waitTimer);
      }, SHIMMER_PAUSE);

      timers.push(shimmerTimer);
    };

    const timers: NodeJS.Timeout[] = [];
    scheduleNextCycle();

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [companion.shiny]);

  const sprite = renderSprite(companion, 0);

  // Press any key to dismiss
  useInput(
    () => {
      onDone?.(undefined, { display: 'skip' });
    },
    { isActive: onDone !== undefined },
  );

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={color}
      paddingX={CARD_PADDING_X}
      paddingY={1}
      width={CARD_WIDTH}
      flexShrink={0}
    >
      {/* Header: rarity + species */}
      <Box justifyContent="space-between">
        <Text bold color={color}>
          {stars} {companion.rarity.toUpperCase()}
        </Text>
        <Text color={color}>{companion.species.toUpperCase()}</Text>
      </Box>

      {/* Shiny indicator */}
      {companion.shiny && (
        <Text color="warning" bold>
          {'\u2728'} SHINY {'\u2728'}
        </Text>
      )}

      {/* Sprite with rainbow gradient + wave shimmer effect */}
      <Box flexDirection="column" marginY={1}>
        {sprite.map((line, i) => (
          <Box key={i}>
            {companion.shiny && isShimmering ? (
              <>{renderShimmerLine(line, i, charTime, glimmerIndex, theme).map((seg, j) => (
                <Text key={j} color={seg.color}>{seg.char}</Text>
              ))}</>
            ) : (
              <Text color={color}>{line}</Text>
            )}
          </Box>
        ))}
      </Box>

      {/* Name */}
      <Text bold>{companion.name}</Text>

      {/* Personality */}
      <Box marginY={1}>
        <Text dimColor italic>
          &quot;{companion.personality}&quot;
        </Text>
      </Box>

      {/* Stats */}
      <Box flexDirection="column">
        {STAT_NAMES.map(name => (
          <StatBar key={name} name={name} value={companion.stats[name] ?? 0} />
        ))}
      </Box>

      {/* Last reaction */}
      {lastReaction && (
        <Box flexDirection="column" marginTop={1}>
          <Text dimColor>last said</Text>
          <Box borderStyle="round" borderColor="inactive" paddingX={1}>
            <Text dimColor italic>
              {lastReaction}
            </Text>
          </Box>
        </Box>
      )}
    </Box>
  );
}
