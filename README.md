# Warhammer 40K Solo Combat Patrol

A grimdark web companion app for playing Warhammer 40k Combat Patrol solo. Uses AI decision tables and behavior flowcharts to control the opponent — you play with real minis on the table, the app tells you what the AI does.

## Features

### AI Opponent Engine
- **Faction-aware behavior** for Tyranids (Vardenghast Swarm) and Space Marines (Strike Force Octavius)
- **Role-based AI**: Units assigned roles (Aggressive, Defensive, Flanker, Support, Objective) that drive decisions each phase
- **Unit-specific tactics**: Deep Strike timing, Infiltrator positioning, reactive abilities (Overwatch, Heroic Intervention, Skulking Horrors)
- **Automatic stratagem usage**: Teeming Broods when Termagants are low, Disruption Bombardment targeting, etc.
- **Faction abilities**: Oath of Moment target selection (SM), Shadow in the Warp timing (Tyranids)

### Game Management
- **Full phase tracking**: Command → Movement → Shooting → Charge → Fight for both player and AI turns
- **Deployment phase** with faction-specific guidance (reserves, Infiltrators, leader attachments)
- **Reserve management**: Auto-arrival turn 2+, forced deployment turn 3, destroy if not deployed
- **Unit tracking**: Wounds, models remaining, battleshock, destroyed status
- **VP/CP tracking** with manual +/- adjustment
- **Dice roller** (D3 and D6, 1-20 dice)
- **Game log**: Color-coded, timestamped, CRT-style data-slate readout
- **Core Stratagems reference**: All 8 universal stratagems with timing and effects
- **6 Combat Patrol missions**

### Mobile & PWA
- **Installable PWA** on iOS and Android (Add to Home Screen)
- **Offline support** via service worker
- **Touch-optimized**: All targets ≥44px, iOS Safari quirks handled
- **Safe area insets** for notch phones
- **Portrait-first** responsive layout

### Grimdark Theme
- Gothic Cinzel typography
- Noise grain textures, dark vignette, scan lines
- CSS-only Imperial Aquila dividers and corner ornaments
- Ambient color shift (steel blue for player turn, crimson for AI turn)
- Holographic reserve units, pulsing battleshock, 3D dice
- CRT data-slate game log with flicker effect
- Metallic buttons, brass VP counters, datasheet stat blocks

## Getting Started

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Run tests
npm test

# Type check + Production build
npm run build

# Lint
npm run lint

# Preview production build
npm run preview
```

### Docker

```bash
docker build -t wh40k-solo .
docker run -d -p 4040:80 --name wh40k-solo wh40k-solo
```

## Tech Stack

- React 19 + TypeScript (strict mode, `noUncheckedIndexedAccess`)
- Vite 7 with vite-plugin-pwa
- Tailwind CSS v4
- Vitest (20 unit tests)
- Nginx (production Docker image)

## Project Structure

```
src/
  data/           # Faction datasheets and missions
  engine/         # AI behavior, phase sequencer, scoring, CP tracking
  components/     # React UI components
  lib/            # Utilities (localStorage with type guards)
  types.ts        # Core type definitions
```

See [CLAUDE.md](./CLAUDE.md) for detailed architecture, AI behavior system, and unit role assignments.

## Roadmap

- [ ] Additional factions (Orks, Necrons, etc.)
- [ ] Mission-specific scoring automation
- [ ] Turn timer / phase auto-advance
- [ ] GitHub Pages deployment

## License

MIT — see [LICENSE](./LICENSE)
