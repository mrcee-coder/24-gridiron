# 24 Gridiron

Private fantasy football league headquarters.

## Homepage V1

The homepage is the visual source of truth for the rest of the site. It establishes the league identity, broadcast treatment, editorial cards, scoreboard language, commissioner-office styling, ballot design, keeper-economy graphics, side-game presentation, and motion system.

No employer branding is used.

### Run locally

No dependencies are required for this first pass.

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

### Data state

All league data is currently presentation-only mock data. Sleeper data, voting persistence, manager profiles, and commissioner controls will be wired in later phases.

The ballot currently shows 12-team payout examples at a 60/30/10 split for visual review.
