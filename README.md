# Election Simulator – Bolivia 2025 (Second Round)

This repository contains an interactive simulator for the 2025 Bolivian presidential elections, focused on the dynamics of the **second round (ballotage)**.  
The simulator allows users to adjust the distribution of votes from the first round (parties, null, and blank votes) and observe how these changes impact the second round results.

---

## Features

- **Interactive party bars**:  
  Each party has a horizontal bar representing its vote count in the first round.
  - Smaller parties can only lose votes (drag to the left) and regain up to their first-round baseline.
  - Finalists (PDC and LIBRE) can grow beyond their baseline, absorbing votes from other parties.
  - Null votes can only decrease down to a minimum threshold of 3.5% of emitted votes.

- **Baseline indicators**:  
  A gray bar behind each party shows the first-round baseline, so users always see where the party started.

- **Thermometer (second-round bar)**:  
  At the top, a “thermometer” compares the two finalists. The percentages and vote counts update in real time as votes are reallocated.
  - If a finalist surpasses the 50% + 1 vote threshold, this is clearly highlighted.
  - Vertical markers at the ends of each finalist’s bar indicate their progression toward the 50% line.

- **Dynamic recalculation of KPIs**:  
  Every drag action triggers live recomputation of:
  - Valid votes (excluding null and blank)
  - Null votes (%) relative to emitted votes
  - Distribution of valid votes across all parties
  - Percentages for finalists in the thermometer

- **Fixed axis with smooth ticks**:  
  The X-axis has a fixed maximum of 3.5 million votes, with ticks every 500,000. Bars never exceed the margin of the graph; instead, values close to the maximum are compressed naturally.

---

## Tech Stack

- **SvelteKit** – reactive framework for building UI
- **TailwindCSS** – utility-first styling, responsive layout
- **d3-interpolate (optional)** – for smooth axis/tick transitions (future improvement)
- **Svelte stores** – centralized state management (`partidos`, `nulo`, `blanco`, `kpis`, etc.)

---

## File Structure

- `src/lib/stores/sim.js`  
  Core state management: parties, null/blank votes, KPIs, recomputation logic, rebalance functions.

- `src/lib/components/BarPanel.svelte`  
  Panel with draggable party bars, axis ticks, and labels.

- `src/lib/components/Partido.svelte`  
  Single party bar component: colored bar, baseline gray band, drag handling, live updates.

- `src/lib/components/Thermometer.svelte`  
  Second-round visualization showing PDC vs. LIBRE head-to-head.

---

## Setup

1. Clone the repository  
   git clone https://github.com/your-username/election-simulator-2025.git  
   cd election-simulator-2025

2. Install dependencies  
   npm install

3. Run development server  
   npm run dev

4. Open the app in your browser  
   http://localhost:5173

---

## Usage

- Drag a party bar to simulate transfer of votes from that party.
- Observe real-time updates to the percentages, vote counts, and thermometer.
- Null votes can only be reduced down to 3.5% of emitted votes.
- Blank votes remain fixed.
- Finalists (PDC and LIBRE) are the only parties that can grow beyond their baseline, absorbing votes.

---

## Future Improvements

- Smooth conveyor-style axis (like John Burn-Murdoch’s bar chart race).
- Persistence of scenarios (save/load simulations).
- Integration with real electoral datasets (historical results, departmental breakdowns).
- Animation presets (simulate scenarios automatically).

---

## License

MIT License. Free to use and adapt with attribution.
