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

## Current Status

### ✅ Implemented
- **Battle round flow**: Full Player Turn (Command→Movement→Shooting→Charge→Fight) then AI Turn, then next battle round. Clear "YOUR TURN" / "AI TURN" indicator in PhaseTracker.
- **Deployment phase**: Before turn 1, shows faction-specific deployment guidance (which units deploy where, Deep Strike reserves, Infiltrators positioning).
- **Faction-aware AI behavior**:
  - **Tyranids**: Terror of Vardenghast Deep Strikes turn 2+ targeting characters; Von Ryan's Leapers aggressive charges with Fights First; Termagants hold objectives with Skulking Horrors reminders; Barbgaunts always target Infantry for Disruption Bombardment; Psychophage Feeding Frenzy targets below-strength; auto-use Teeming Broods when Termagants < 10 models.
  - **Space Marines**: Captain + Librarian attached to Terminators; all three Deep Strike turn 2+; Oath of Moment targets highest damage output enemy (not just toughness); Veil of Time Sustained Hits 1 noted; Infernus holds objectives.
- **Reactive AI actions during player turn**: Fire Overwatch when charged, Heroic Intervention from Leapers (free via Pouncing Leap), Hyper-Reactive when shot at, Skulking Horrors movement reminder, Gene-Wrought Resilience.
- **ScoreBoard fix**: Both +/- buttons work for VP and CP (VP allows negative delta, CP uses GAIN_CP/SPEND_CP actions).
- **Mobile layout**: Single-column on small screens, responsive text sizes, touch-friendly button sizes.
- **Unit reserve tracking**: `inReserve` flag on UnitState, Deep Strike units start in reserves.
- **Automatic reserve management**: Turn 1 units stay in reserve with guidance. Turn 2+ shows Deep Strike arrival instructions ("Set up >9" from all enemy models"). Turn 3 end forces arrival; units still in reserve after turn 3 are destroyed. "Deploy from Reserve" button on UnitCard for reserved units (appears turn 2+).
- **Oath of Moment target selection UI**: AI Command phase shows recommended target with "Confirm Oath Target" button. Dispatches SET_OATH_TARGET, shows persistent 💀 skull icon and "OATH TARGET" badge on targeted unit's card with red border. AI shooting/fighting references "Re-roll hits vs Oath target".
- **Shadow in the Warp button**: Tyranid AI Command phase shows "Use Shadow in the Warp" button. Auto-recommended turn 2+ with 2+ enemy units. Dispatches USE_SHADOW_IN_WARP with guidance. Button disappears after use (once per battle).
- **localStorage game save/restore**: Auto-saves GameState on every state change. On load, offers "Continue Game" or "New Game" if save exists. "Reset" button in header clears save and returns to setup.
- **Game log improvements**: Scrollable with max height (auto-scrolls to bottom). Each entry tagged with [Round Phase] prefix. Color-coded: player actions blue, AI actions red, system events gray. Collapsible.
- **Core Stratagems reference**: Collapsible section listing all 8 core stratagems (Command Re-roll, Insane Bravery, Fire Overwatch, Rapid Ingress, Go to Ground, Heroic Intervention, Counter-Offensive, Epic Challenge) with timing, CP cost, and effects.

### 🔲 Not Yet Implemented
- Turn timer or phase auto-advance
- Additional factions beyond SM/Tyranids
- Mission-specific scoring automation
