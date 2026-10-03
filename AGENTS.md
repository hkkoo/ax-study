# Repository Guidelines

This repository contains a Jekyll site deployed by GitHub Pages from `main`.

- Keep settings in `_config.yml`, layouts in `_layouts/`, posts in `_posts/`,
  and styles in `assets/css/`. Use Markdown with YAML front matter for content.
- Post filenames use `YYYY-MM-DD-title.md`. Preserve Korean content.
- Use `relative_url` for internal links because the site lives at `/ax-study/`.
- Use two-space indentation for YAML and HTML. Follow the existing CSS style.
- See README.md for installation, serve, and build commands. Do not track `_site/`,
  dependencies, or caches.
- Validate with `git diff --check` and a Jekyll build. Check home, introduction,
  post links, and mobile layout. There is no automated test framework.
- Use concise imperative commit subjects. PRs should explain purpose and
  validation, with screenshots for visible changes when available.
- Never commit credentials or local secrets.
