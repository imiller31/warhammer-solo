# Warhammer 40k Solo Combat Patrol

An LLM-powered AI opponent for solo Warhammer 40k Combat Patrol games. Practice and learn the game by playing against an AI that understands the rules, makes tactical decisions, and can explain its reasoning.

## Concept

Instead of reinforcement learning or random dice tables, this project uses an LLM agent as the opposing player. The AI:
- Knows the Combat Patrol rules and datasheets
- Makes tactical decisions (movement, targeting, stratagem usage)
- Tracks game state (positions, wounds, CP, VP, objectives)
- Explains its reasoning to help you learn
- Enforces rules and catches mistakes

## Scope (v0)

**Space Marines (Strike Force Octavius) vs Tyranids (Vardenghast Swarm)**

Starting with the two most iconic Combat Patrol matchups from the 10th Edition starter set.

## Architecture

The app is a **web-based game manager** with:
- A grid-based battlefield representation (44" x 30")
- Game state engine that tracks all units, wounds, positions, CP, VP
- Turn/phase sequencer following the Combat Patrol flow
- LLM agent that receives game state and returns decisions for the AI army
- Human player interface for declaring actions (move, shoot, charge, fight)
- Dice roller with full modifier calculation

## Tech Stack

- **Frontend:** React + TypeScript (Vite)
- **Backend:** Node.js/Express API
- **AI:** LLM via API (OpenAI/Anthropic) with structured game state prompts
- **State:** In-memory game state (no DB needed for v0)

## Getting Started

```bash
npm install
npm run dev
```

## Combat Patrols Supported

### Strike Force Octavius (Space Marines)
- Captain Octavius (Terminator, relic weapon)
- Librarian Tantus (Terminator, Smite, force weapon)
- Terminator Squad (5 models, assault cannon + storm bolters)
- Infernus Squad (5 models, pyreblasters)

### The Vardenghast Swarm (Tyranids)
- Terror of Vardenghast (Winged Tyranid Prime)
- Psychophage (Monster, psychoclastic torrent)
- Termagants (20 models, fleshborers)
- Barbgaunts (5 models, barblaunchers)
- Von Ryan's Leapers (3 models, melee assassins)

## Status

🚧 **In Development**
