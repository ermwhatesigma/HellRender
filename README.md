# HellRender - Retro 3D FPS

A fast-paced first-person shooter game inspired by classic 90s retro FPS titles, built with **React**, **Three.js**, **TypeScript**, and the **Web Audio API**.

---

## What's New in Version 3.2

**1. Custom Gun Forge & Pixel Art Workshop**
- **16x16 Pixel Drawing Grid**: Create custom weapon sprites using a built-in color palette and preset templates (Pistol, Blaster, etc.).
- **Weapon Statistics Tuning**: Adjust damage (10–600 DMG), rate of fire, ammo consumption, pellet/beam count, spread, and ballistics (hitscan, plasma, laser, flamethrower, rocket, BFG). Includes an audio synthesizer and recoil configuration.
- **Instant Arsenal Integration**: Test-fire weapons live in the workshop and equip them directly into the in-game arsenal.
- **Custom Guns Library**: Saved custom weapons persist in `localStorage`.

**2. Advanced Cheat System (Settings & Pause Menu)**
- **IDDQD**: Activate invulnerable God Mode (200% HP lock).
- **IDKFA**: Unlock the full Demonic Arsenal (all 12+ weapons with maximum ammunition).
- **IDCLIP**: Enable Ghost / No-Clip Mode (walk and phase through walls).
- **One-Hit Kill / Quad Damage**: Apply a 15x weapon damage multiplier.
- **IDBEHOLD**: Activate Speed Demon (2x sprint velocity).
- **IDKEYS**: Bypass keycard locks (Blue, Yellow, and Red).
- **IDCHOP**: Restore 200% Super Health and Mega Armor.
- **IDNUKE**: Instantly eliminate all active demonic hostiles in the level.

**3. Expanded Campaign (6 Missions & Themes)**
- **E1M1: Phobos Outpost** – Tech base with Zombie troopers, Imps, Shotgun, and Chaingun.
- **E1M2: Toxic Refinery** – Acid slime canals featuring the Super Shotgun, Rocket Launcher, and Cacodemon.
- **E1M3: Cyber Hellgate** – Lava rivers and a Demonic cathedral with the BFG 9000 and Cyberdemon Lord boss.
- **E1M4: Containment Area** – Quarantine chambers with the Quad-Shotgun, Flamethrower, and Baron squad.
- **E1M5: Tower of Babel** – Colossal hell colosseum featuring The Unmaker and Dual Cyber Titans.
- **E1M6: Sub-Zero Cryo Lab** – Cryogenic lab with the Particle Railgun, Cyberdemon, and Baron squads.
- **The Meat Grinder** – Endless survival horde arena mode.

**4. Upgraded Mobile Controls & Touch UX**
- **Hide / Show Weapon Switcher**: Collapse or expand the weapon bar on mobile with a single tap.
- **Zero-Latency Touch Debouncing**: Eliminated double-click bugs across all mobile and touch buttons.
- **Anti-Stuck Physics**: Multi-ring concentric unstuck resolution, corner deflection, and wall sliding.
- **Gamma & Fullbright Lighting**: Brightness slider directly adjusts 3D textures, ambient illumination, and fog density up to crisp fullbright visibility.

---

## Desktop Controls Reference

| Action | Key / Control |
|---|---|
| Move Forward / Back | **W / S** or **Up / Down** |
| Strafe Left / Right | **A / D** or **Left / Right** |
| Look / Aim | **Mouse Look** (Click viewport to lock) |
| Fire Weapon | **Left Mouse Button** or **Spacebar** |
| Reload | **R** |
| Interact / Open Door | **E** or **F** |
| Jump | **Spacebar** |
| Switch Weapons | **Number Keys 1 - 9** or **Mouse Wheel** |
| Automap Radar | **TAB** or **M** |
| Pause & Cheats Menu | **ESC** or **P** |
| Sprint | **Shift** |

---

## Setup & Local Development

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Build a single-file bundle
npm run build