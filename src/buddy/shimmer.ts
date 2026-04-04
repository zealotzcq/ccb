/**
 * Shared shimmer rendering logic for companion sprites.
 * Used by both CompanionCard (full card) and CompanionSprite (sidebar).
 */
import type { Theme } from '../utils/theme.js'
import {
  interpolateColor,
  toRGBColor,
  hueToRgb,
} from '../components/Spinner/utils.js'

export interface ShimmerSegment {
  char: string
  color: string
}

// Render a single line with rainbow gradient + wave shimmer
// Returns an array of shimmer segments, one per character
export function renderShimmerLine(
  line: string,
  lineIndex: number,
  charTime: number,
  glimmerIndex: number,
  theme?: Theme,
): ShimmerSegment[] {
  const segments: ShimmerSegment[] = []

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    // Calculate base rainbow color for this character
    // Use both line position and character position for variation
    const hueOffset = (lineIndex * 30 + i * 15 + charTime * 0.05) % 360
    const rainbowRGB = hueToRgb(hueOffset)
    const rainbowColor = toRGBColor(rainbowRGB)

    // Calculate shimmer intensity at this position
    const shimmerStart = glimmerIndex - 3
    const shimmerEnd = glimmerIndex + 3
    let shimmerIntensity = 0

    if (i >= shimmerStart && i <= shimmerEnd) {
      // Distance from center of shimmer
      const distFromCenter = Math.abs(i - glimmerIndex) / 3
      shimmerIntensity = 1 - distFromCenter
      shimmerIntensity = Math.max(0, Math.min(1, shimmerIntensity))
    }

    // Apply shimmer: make it brighter/white when shimmering
    let finalColor = rainbowColor
    if (shimmerIntensity > 0) {
      // Interpolate towards white/bright for shimmer effect
      const brightRGB = { r: 255, g: 255, b: 255 }
      const interpolated = interpolateColor(
        rainbowRGB,
        brightRGB,
        shimmerIntensity * 0.7,
      )
      finalColor = toRGBColor(interpolated)
    }

    segments.push({ char, color: finalColor })
  }

  return segments
}
