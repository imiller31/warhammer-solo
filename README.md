# Warhammer 40K Solo Combat Patrol

A web companion app for playing Warhammer 40k Combat Patrol solo. Uses decision tables and AI behavior flowcharts to tell you what the AI opponent does each phase — you play with real minis on the table.

## Features

- **AI decision engine** — faction-aware behavior for Tyranids (Vardenghast Swarm) and Space Marines (Strike Force Octavius)
- **Full phase tracking** — Command → Movement → Shooting → Charge → Fight, player & AI turns
- **Unit management** — wounds, models, battleshock, reserves, Deep Strike deployment
- **VP/CP tracking** with manual adjustment
- **Dice roller** — D3 and D6
- **Game save/restore** via localStorage
- **6 Combat Patrol missions**

## Getting Started

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Type check
npx tsc -b

# Lint
npm run lint

# Run tests
npm test

# Production build
npm run build
```

## Screenshots

<!-- TODO: Add screenshots -->

## Tech Stack

- React 19 + TypeScript (strict mode)
- Vite
- Tailwind CSS v4
- Vitest for testing

## License

MIT — see [LICENSE](./LICENSE)
