# e6uka.com

Portfolio of Chukwuebuka Clinton Okeke, a frontend engineer working across web and mobile.

A static site with no framework and no build step: plain HTML, CSS and JavaScript. The hero is a line-drawn bookshelf with one book per project, and the selected work runs in two carousel rows that open each project in a focus panel.

## Run it locally

Serve the folder with any static server, for example:

```sh
python3 -m http.server 8765
```

Then open http://localhost:8765. There's no hot reload, so refresh after a change (Cmd+Shift+R if images or styles look stale).

## Editing content

All copy and project data live in `content.js`. The markup and scripts read from it, so content changes never touch `index.html` or `app.js`.

Each project accepts:

| Field | What it does |
| --- | --- |
| `name`, `short` | Full name, and the short label used on the shelf |
| `slug` | URL of the project's panel, `#work/<slug>` |
| `summary`, `body` | The write-up: one lead paragraph, then more paragraphs |
| `role`, `year`, `stack`, `links` | Shown in the panel |
| `kind: "mobile"` | Shows screenshots as phone screens |
| `platform` | Overrides the platform label ("Web", "Mobile app") |
| `cover` | Brand card used on the carousel card |
| `images` | Gallery screenshots, each `{ src, alt }`, plus an optional `small` copy for cards and thumbnails |
| `group` | Projects with the same group share one shelf book and an overview panel, defined in `groups` |
| `family` | Marks related projects so the carousel never places them side by side |

`sample: true` puts a "sample content" banner across the page. Set it to `false` once the content is final.

## Branches

- `develop` is the default branch. Open pull requests against it.
- `main` is what goes live. A required check fails on `main` while `content.js` still has `sample: true`.

## Credits

The bookshelf is drawn with the Hairline kernel by Lucas Markes, used under the MIT licence (`vendor/HAIRLINE-LICENSE`).
