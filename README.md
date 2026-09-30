# Strategy · Telerik Academy

A bilingual Bulgarian / English web presentation for a 190-minute introductory UI/UX lecture. 54 slides follow the approved `program.md`: three 40-minute blocks, two breaks, a 25-minute AI session, introduction and final discussion. The session runs 18:00–21:10, with breaks at 18:45–18:55 and 19:35–19:55. Slide 2 introduces Dimitar Stoimchev with a realistic edited portrait and a three-sentence BG/EN biography covering his work from September 2016 to September 2026.

## Present

Open `presentation/index.html` directly, or serve the project:

```sh
python3 -m http.server 4173
```

Then open `http://localhost:4173/presentation/`. No installation or build is required. Add `?lang=bg` or `?lang=en`; slide hashes support direct links (for example `?lang=en#research-methods`).

| Control | Action |
| --- | --- |
| ← / →, Page Up / Down, Space | Previous / next slide |
| Home / End | First / last slide |
| O | Slide overview |
| N | Presenter notes on the current screen |
| F | Fullscreen |
| B | Blackout; any key restores the slide |
| L or BG / EN | Switch language |
| Swipe horizontally | Previous / next on touch screens |

Exercise timers start manually and reset when leaving the slide. Notes are visible on the projected screen when opened; they are not a separate private presenter window. The full Bulgarian autocue is `program.md`, also available through the notes link.

## Content and design

- `program-short.md`: approved outline.
- `program.md`: detailed Bulgarian teaching script.
- `M1-L3-Strategy-1.pdf`: supplied reference presentation.
- `presentation/slides.js`: bilingual slide content and concise speaker notes.
- `presentation/prompt.js`: bilingual AI demonstration prompt and synthetic teaching data.
- `presentation/app.js`, `styles.css`: accessible controls, responsive layouts, motion and charts.

The palette comes from the supplied PDF: green `#47db00`, brand green `#43a747`, violet `#6060e2`, lavender `#bfbff3`, sage `#addf80`, and pale blue `#b9e9fa`. System fonts and bundled images keep the presentation usable offline. Reduced-motion preferences are respected.

All case-study numbers, interview quotes and competitor findings are fictional teaching data, labeled as such. Source links for research concepts and AI tools are in the notes and script. Recheck tool capabilities before teaching as services change.

## Visual assets

Five original illustrations were generated using OpenAI image generation for this presentation. The creative briefs were:

- `cover.png`: sculptural paper path joining a green sphere, lavender arch and translucent blue cube on a warm white background.
- `morning.png`: an everyday morning rush before catching the bus, showing competing needs, constraints and a goal.
- `picnic.png`: a picnic whose supposedly perfect menu does not fit everyone's needs, illustrating assumptions and research.
- `laundry.png`: choosing how to finish laundry before a trip, illustrating alternatives and priorities.
- `assistant.png`: a helpful shopping assistant with a bag, illustrating delegation and human verification.

The four story illustrations use editorial ink contours, scratched hatching, paper texture and green/lavender/cyan accents. Comic labels are rendered as selectable bilingual HTML rather than embedded image text. Graphs and diagrams use CSS and semantic HTML.

The lecturer portrait is adapted from the user-provided LinkedIn profile photo. See [portrait source and edit prompt](presentation/assets/portrait-edit.md) for provenance and the built-in image-generation brief.

## Hosting

The project is ready for GitHub Pages: publish the `main` branch, root folder `/`. `.nojekyll` keeps it a plain static site, and the root entry redirects to `presentation/` while preserving language and slide links. Future pushes to `main` update the site.
