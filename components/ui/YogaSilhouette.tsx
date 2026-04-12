/**
 * YogaSilhouette — Simple SVG yoga pose silhouettes.
 * Used for empty states, decorative sections, and placeholders.
 * All paths are original minimal-line silhouettes in the brand sage green.
 */

type Pose = "seated" | "tree" | "warrior" | "lotus" | "child" | "mountain";

interface YogaSilhouetteProps {
  pose?:      Pose;
  size?:      number;   // px, applied to width & height
  color?:     string;   // CSS color value
  className?: string;
}

export default function YogaSilhouette({
  pose      = "seated",
  size      = 64,
  color     = "#536046",
  className = "",
}: YogaSilhouetteProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {POSES[pose](color)}
    </svg>
  );
}

/* ── Pose path definitions ───────────────────────────────────────────────── */

const POSES: Record<Pose, (color: string) => React.ReactNode> = {

  // Seated meditation — cross-legged, hands on knees, upright spine
  seated: (c) => (
    <g fill={c} opacity="0.85">
      {/* head */}
      <circle cx="32" cy="11" r="6" />
      {/* neck + torso */}
      <path d="M32 17 C32 17 29 22 28 30 C27 36 28 40 32 40 C36 40 37 36 36 30 C35 22 32 17 32 17Z" />
      {/* left leg */}
      <path d="M28 36 C24 38 16 39 12 42 C11 43 12 45 14 44 C18 42 25 41 29 39Z" />
      {/* right leg */}
      <path d="M36 36 C40 38 48 39 52 42 C53 43 52 45 50 44 C46 42 39 41 35 39Z" />
      {/* left foot */}
      <ellipse cx="13" cy="45" rx="5" ry="3" />
      {/* right foot */}
      <ellipse cx="51" cy="45" rx="5" ry="3" />
      {/* left arm / hand */}
      <path d="M29 28 C26 30 20 34 18 36 C17 37 18 39 20 38 C22 37 27 33 30 31Z" />
      <circle cx="18" cy="37" r="2.5" />
      {/* right arm / hand */}
      <path d="M35 28 C38 30 44 34 46 36 C47 37 46 39 44 38 C42 37 37 33 34 31Z" />
      <circle cx="46" cy="37" r="2.5" />
    </g>
  ),

  // Tree pose — standing, one knee bent outward, arms overhead
  tree: (c) => (
    <g fill={c} opacity="0.85">
      {/* head */}
      <circle cx="32" cy="7" r="5.5" />
      {/* arms arched overhead */}
      <path d="M32 13 C32 13 22 16 18 10 C17 9 18 7 20 8 C23 10 28 14 32 14Z" />
      <path d="M32 13 C32 13 42 16 46 10 C47 9 46 7 44 8 C41 10 36 14 32 14Z" />
      {/* torso */}
      <path d="M30 13 L30 38 L34 38 L34 13Z" />
      {/* standing leg */}
      <path d="M30 38 L29 56 L34 56 L33 38Z" />
      {/* raised leg / bent knee */}
      <path d="M30 30 C27 32 21 34 18 38 C17 40 19 42 21 40 C24 38 29 35 31 33Z" />
      {/* foot on standing leg */}
      <ellipse cx="31.5" cy="57" rx="4" ry="2.5" />
    </g>
  ),

  // Warrior II — wide stance, arms extended, gaze forward
  warrior: (c) => (
    <g fill={c} opacity="0.85">
      {/* head */}
      <circle cx="38" cy="10" r="5" />
      {/* torso */}
      <path d="M36 15 L34 34 L40 34 L40 15Z" />
      {/* front arm (right, extended forward) */}
      <path d="M40 22 L56 21 L56 23 L40 24Z" />
      <circle cx="57" cy="22" r="2.5" />
      {/* back arm (left, extended back) */}
      <path d="M36 22 L20 21 L20 23 L36 24Z" />
      <circle cx="19" cy="22" r="2.5" />
      {/* front bent leg */}
      <path d="M40 34 L48 50 L52 50 L44 34Z" />
      {/* back straight leg */}
      <path d="M34 34 L16 48 L20 50 L36 34Z" />
      {/* feet */}
      <ellipse cx="50" cy="51" rx="4.5" ry="2.5" />
      <ellipse cx="18" cy="51" rx="6" ry="2.5" />
    </g>
  ),

  // Lotus — seated, both feet on opposite thighs, tall spine
  lotus: (c) => (
    <g fill={c} opacity="0.85">
      {/* head */}
      <circle cx="32" cy="10" r="6" />
      {/* torso, slightly narrower */}
      <path d="M30 16 C30 16 27 22 27 30 C27 36 29 39 32 39 C35 39 37 36 37 30 C37 22 34 16 34 16Z" />
      {/* left thigh out */}
      <path d="M27 33 C22 35 13 36 9 39 C8 40 9 42 11 41 C16 39 24 37 28 35Z" />
      {/* right thigh out */}
      <path d="M37 33 C42 35 51 36 55 39 C56 40 55 42 53 41 C48 39 40 37 36 35Z" />
      {/* left foot resting on right thigh */}
      <ellipse cx="38" cy="31" rx="4" ry="2.5" transform="rotate(-10 38 31)" />
      {/* right foot resting on left thigh */}
      <ellipse cx="26" cy="31" rx="4" ry="2.5" transform="rotate(10 26 31)" />
      {/* hands in mudra, resting on knees */}
      <circle cx="10" cy="40" r="3" />
      <circle cx="54" cy="40" r="3" />
    </g>
  ),

  // Child's pose — folded forward, arms extended, forehead down
  child: (c) => (
    <g fill={c} opacity="0.85">
      {/* body folded forward */}
      <path d="M10 38 C10 38 18 30 32 28 C46 30 54 38 54 38 L52 42 C52 42 44 36 32 34 C20 36 12 42 12 42Z" />
      {/* head resting down */}
      <circle cx="32" cy="44" r="6" />
      {/* arms extended forward */}
      <path d="M13 35 C10 30 8 22 10 16 C11 14 13 15 13 17 C12 22 14 30 16 34Z" />
      <path d="M51 35 C54 30 56 22 54 16 C53 14 51 15 51 17 C52 22 50 30 48 34Z" />
      {/* hands */}
      <ellipse cx="10" cy="15" rx="3.5" ry="2.5" />
      <ellipse cx="54" cy="15" rx="3.5" ry="2.5" />
      {/* hips / heels */}
      <path d="M24 36 C24 36 26 45 28 48 L36 48 C38 45 40 36 40 36Z" />
    </g>
  ),

  // Mountain pose — standing tall, feet together, arms at sides
  mountain: (c) => (
    <g fill={c} opacity="0.85">
      {/* head */}
      <circle cx="32" cy="8" r="6" />
      {/* neck + torso */}
      <path d="M30 14 L29 40 L35 40 L34 14Z" />
      {/* left arm */}
      <path d="M29 16 L24 36 L27 37 L31 17Z" />
      {/* right arm */}
      <path d="M35 16 L40 36 L37 37 L33 17Z" />
      {/* left leg */}
      <path d="M29 40 L27 58 L31 58 L32 40Z" />
      {/* right leg */}
      <path d="M35 40 L37 58 L33 58 L32 40Z" />
      {/* feet */}
      <ellipse cx="29" cy="59" rx="4" ry="2.5" />
      <ellipse cx="35" cy="59" rx="4" ry="2.5" />
    </g>
  ),
};
