# CLAUDE.md - Project Guide

## Project: Warhammer 40k Solo Combat Patrol Companion App

A web companion app for playing Warhammer 40k Combat Patrol solo. Based on One Page Rules' AI solo play concept — decision tables and flowcharts that tell you what the AI opponent does each phase — but tailored specifically for 40k 10th Edition Combat Patrol.

### What This Is NOT
- Not an LLM-powered opponent (too expensive, too slow)
- Not a full digital game (you play with real minis on the table)
- Not a rules engine that resolves combat for you

### What This IS
A companion app you use alongside your physical game. It tells you:
- What the AI opponent's units do each phase (movement, shooting, charging, fighting)
- Which stratagems the AI uses and when
- How the AI deploys
- Which targets the AI prioritizes
- VP/CP tracking

### Architecture

Simple React SPA (Vite + TypeScript). No backend needed for v0.

```
src/
  data/
    space-marines.ts    # Strike Force Octavius units, weapons, stratagems
    tyranids.ts         # Vardenghast Swarm units, weapons, stratagems
    missions.ts         # Combat Patrol missions
  engine/
    ai-behavior.ts      # Decision tables / flowcharts for AI behavior
    phase-sequencer.ts  # Tracks current turn/phase, advances game
    scoring.ts          # VP tracking
    cp-tracker.ts       # Command point tracking
  components/
    GameBoard.tsx        # Main game view
    PhaseTracker.tsx     # Shows current turn/phase with navigation
    UnitCard.tsx         # Unit status (wounds, battleshock, etc.)
    AIDecision.tsx       # Shows what the AI does this phase with reasoning
    ScoreBoard.tsx       # VP/CP display
    DiceRoller.tsx       # Quick dice roller utility
  App.tsx
```

### AI Behavior System (OPR-inspired)

Each unit gets a **role** that determines its behavior:

**Roles:**
- **Aggressive** — prioritize attacking, move toward nearest enemy, charge when possible
- **Defensive** — hold position/objective, shoot at nearest threat, avoid charges
- **Flanker** — move toward exposed/weak units, prefer charges over shooting
- **Support** — stay near friendly units, buff/screen, shoot at nearest target
- **Objective** — prioritize moving to/holding unclaimed objectives

**Per-phase decision flow:**
1. **Command Phase:** Auto-resolve battleshock, gain CP, faction abilities (Oath of Moment target selection, Shadow in the Warp timing)
2. **Movement Phase:** Based on role → determine destination (nearest enemy, nearest objective, hold position, etc.)
3. **Shooting Phase:** Target priority table (nearest in range > wounded > highest threat)
4. **Charge Phase:** Role-dependent (aggressive/flanker charge, defensive/support don't unless engaged)
5. **Fight Phase:** Attack allocation based on weapon profiles vs target toughness

**Stratagem triggers:** Condition-based. E.g., "If a unit is targeted by shooting and has >3 models, use Hyper-Reactive (1CP)."

### Unit Role Assignments

**Tyranids (Vardenghast Swarm):**
- Terror of Vardenghast → Flanker (Deep Strike assassin)
- Psychophage → Aggressive (monster that charges in)
- Termagants → Objective / Defensive (screen and hold)
- Barbgaunts → Support (shoot to disrupt, stay back)
- Von Ryan's Leapers → Flanker (Infiltrators, Fights First)

**Space Marines (Strike Force Octavius):**
- Captain Octavius → Aggressive (attached to Terminators)
- Librarian Tantus → Support (attached to Terminators for Sustained Hits)
- Terminator Squad → Aggressive (Deep Strike, shoot + charge)
- Infernus Squad → Defensive / Objective (hold objectives, flame things in range)

### Data Sources
- Combat Patrol rules: https://wahapedia.ru/wh40k10ed_cp/the-rules/combat-patrol/
- SM (Strike Force Octavius): https://wahapedia.ru/wh40k10ed_cp/factions/strike-force-octavius/
- Tyranids (Vardenghast Swarm): https://wahapedia.ru/wh40k10ed_cp/factions/the-vardenghast-swarm/
- See RESEARCH.md for prior art

### UI/UX Goals
- Mobile-friendly (use at the table on your phone)
- Clear, readable AI decisions ("Move Termagants toward Objective 2. They are in Defensive role — hold and screen.")
- Step through phases with a button
- Dice roller built in
- Dark theme (grimdark vibes)

### Tech
- React 19 + TypeScript
- Vite
- Tailwind CSS
- No backend, no database — all state in memory/localStorage
