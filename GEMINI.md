@AGENTS.md

# User Preferences

## Visual Updates & Screenshots
- Whenever the user has asked for screenshots (or visual inspection) and further UI/visual changes are made, always capture and include updated screenshots in the **final** response after all edits and checks have finished, never omitting them or leaving them only in an intermediate update before a background task completes.

## Writing Style
- Avoid using em dashes in responses, UI copy, comments, and documentation. Use periods, commas, parentheses, colons, or standard hyphens instead.

## Commits
- Always follow the commit rules in the project's `AGENTS.md` when making commits (including Conventional Commits format and keeping one logical change per commit, splitting unrelated edits into separate commits).

## Discord Announcements (Chiz.Pink)
- Use this exact structure for Chiz.Pink release announcements:
  - Title line: `# :chiz_pink: vX.Y.Z`
  - Intro line: `@Squeek! **<Short punchy tagline>**` followed by an optional brief casual opener (e.g. with `:mouse:` or `<3`).
  - Highlight sections: Bold section title on its own line (`**<Feature Title>**`) followed by 1-2 concise sentences (using `[Label](url)` markdown links where helpful).
  - Changelog section: `## Changelog:` followed by one item per line prefixed directly with a custom tag emoji (no bullet points):
    - `:tag_nte:` for NTE game data/content updates
    - `:tag_new:` for new features
    - `:tag_fix:` for fixes and improvements
- Keep the full announcement well under Discord's 2,000-character limit, accounting for custom emoji expansion (each custom emoji like `:chiz_pink:`, `:tag_nte:`, `:tag_new:`, `:tag_fix:` adds ~22-24 extra characters once Discord resolves its ID).
- Match the casual, friendly Chiz.Pink tone and never use em dashes.
