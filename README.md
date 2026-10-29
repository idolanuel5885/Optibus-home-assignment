# PSR Schedule Review — prototype

Review, adjust and publish a cinema's weekly schedule produced by a (faked) optimization engine. The spec is in [CLAUDE.md](CLAUDE.md).

## Run

```bash
npm install
npm run dev
```

- `npm run check`: generates the week and checks every day against the five rules, then runs thousands of drags through the re-plan and checks every result.
- `npm run build`: builds the static site into `dist/`. Vercel builds and deploys it from `main`.

## Demo script

1. **Setup & Generate:** look over the inputs, then click **Generate schedule for the week of 6 June**. Review opens on Sunday.
2. **Click a screening:** click Blue Hour in Theatre 1 (13:55). Its reasons appear in the side panel.
3. **Drag:** drag that Blue Hour down to Theatre 3 at 17:00. You'll see 4 screenings changed and +₪477:
   - one screening in Theatre 3 shifted later;
   - one removed (ghost);
   - Kibbutz Kids 3 added in Theatre 1's gap;
   - a pin on Blue Hour.
   The revenue indicator updates.
4. **Undo:** everything goes back to how it was.
5. **Blocked drag:** scroll right and drag Kibbutz Kids 3 in Theatre 1 (22:25) about an hour later. It's blocked: "…it would end at 00:53, after closing (00:30)."
6. **Friday:** switch to Friday to see the longer hours (10:00–01:30).
7. **Publish:** redo a drag, then click **Publish week**. The summary appears; confirm, and the week becomes Published and read-only.
