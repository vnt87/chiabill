# WNT design extraction

Extracted from https://worldnineballtour.com/ with Dembrandt (`dembrandt <url> --save-output --design-md --tailwind --dtcg`, v0.38).
`DESIGN.md`, `theme.css` and the DTCG tokens sit next to this file. The raw JSON was dropped because it embeds the site's logo and favicon images.

## How it maps to ChiaBill
- Font: Kanit (the site's own family). Kanit has a Vietnamese subset; headings use line-height 1.15 where WNT uses 1.0, so stacked tone marks are not clipped.
- Colors: `#333` ink, `#F7F7F7` surfaces, `#C6C6C6` hairlines, `#101010` header and footer, red `#EF342A` (primary buttons), yellow `#FCC000` (title stripe, paid progress, paid toggle), link blue `#0D6EFD`. Remapped in `tailwind.config.js` (`slate`, `blue`, `wnt`).
- Shape: cards use a 16px radius with one square corner (bottom-left) and an L-shaped hairline (`.wnt-card`); primary buttons and the Paid chip have a cut bottom-right corner.
- The site's dark / yellow / dark gradient is the stripe under page titles (`.stripe`).
- Motion: 0.2s transforms on buttons and cards, a one-per-session header and card reveal; rolling digits on totals and the segmented paid bar are ChiaBill's own additions.
- Not copied: WNT's logo, imagery and copy. The "chiabill." wordmark is our own.
