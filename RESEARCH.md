# Solo 40k AI Opponent - Research

## Existing Projects

### 1. coldmayo/40kAI (GitHub)
- **URL:** https://github.com/coldmayo/40kAI
- **Approach:** Reinforcement Learning (DQN) using OpenAI Gymnasium environment + PyTorch
- **Factions:** Space Marines, Custodes, Sisters, Orks, Tyranids, AdMech, Guard, Tau
- **Features:** Full game phases (Command, Movement, Shooting, Charge, Fight), deployment types, stratagems, victory conditions
- **Platform:** Linux only (C++ GUI with gtkmm)
- **Status:** Active hobby project, appears to implement standard 40k (not Combat Patrol specifically)
- **Limitation:** RL-based, not conversational — you play through a GUI, not interactively

### 2. One Page Rules (OPR) AI Solo Play Rules
- **URL:** https://www.onepagerules.com/resources (free AI supplement)
- **Approach:** Table-based decision trees — roll dice to determine AI unit behavior
- **How it works:** Units get assigned "roles" (aggressive, defensive, etc.), then tables dictate actions per phase
- **Pros:** Simple, works with physical minis, no tech needed
- **Cons:** Rudimentary — no real tactical intelligence, just weighted randomness
- **Related:** OPR also has "Grimdark Future: Star Quest" and "Age of Fantasy Quest" for solo/coop campaign play

### 3. "Training an AI to play Warhammer 40k" (Towards Data Science / Medium)
- **URL:** https://towardsdatascience.com/training-an-ai-to-play-warhammer-40k-part-one-planning-78aa5dfa888a/
- **Approach:** Planning article for RL-based 40k environment, discusses action space design
- **Key insight:** Breaking actions into small steps (select model → choose action like Shoot/Charge/Move) rather than big compound actions

### 4. Simon Clark YouTube - Kill Team AI
- **URL:** https://www.youtube.com/watch?v=cXWx6mbej-U
- **Approach:** Homemade AI for Kill Team (smaller scale than full 40k)

### 5. TTS (Tabletop Simulator) Solo Heresy
- **URL:** Steam Workshop 40K Solo Heresy Starter Kit
- **Approach:** Scripted scenarios in Tabletop Simulator
- **Limitation:** Not a real AI opponent, just scripted encounters

### 6. Jervis Johnson's "Rules of Engagement" (White Dwarf 462)
- Solo play system with opponent personality and randomness
- Designed by long-time GW developer

## Key Takeaway
**No one has built an LLM-based 40k opponent.** All existing approaches are either:
- RL/DQN (machine learning, no conversation)
- Table-based randomness (OPR style)
- Scripted scenarios

An LLM agent that understands Combat Patrol rules, can make tactical decisions, explain its reasoning, and coach the player would be genuinely novel.

## Combat Patrol Resources
- **Core rules PDF:** https://assets.warhammer-community.com/warhammer40000_combatpatrol_rules_eng.24.09-rbtns7zwbh.pdf
- **Tyranids CP (Insidious Infiltrators):** https://assets.warhammer-community.com/warhammer40000_combatpatrol_tyranids_insidiousinfiltrators_eng.24.09-sr3rqsvl2q.pdf
- **Tyranids CP (Vardenghast Swarm):** https://warhammer40000.com/wp-content/uploads/2023/06/lbmtxXmWRsCoIL5m.pdf
- **Wahapedia Combat Patrol:** https://wahapedia.ru/wh40k10ed_cp/the-rules/combat-patrol/
- **Wahapedia SM datasheets:** https://wahapedia.ru/wh40k10ed/factions/space-marines/datasheets.html
- **Strike Force Octavius (SM CP):** https://wahapedia.ru/wh40k10ed_cp/factions/strike-force-octavius/
- **All CP datasheets overview:** https://spikeybits.com/combat-patrol-rules-datasheets/
