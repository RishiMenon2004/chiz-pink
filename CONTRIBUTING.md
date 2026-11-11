# Contributing to Chiz.Pink

## Translations

Translations are the one place I'm actively looking for help!

Chiz.Pink's interface text lives in `src/messages/`, one JSON file per
language. English (`src/messages/en.json`) is the source and all other
languages are translated from it.

You don't need to touch the code or GitHub to help. Translations are done
through [Weblate](https://hosted.weblate.org/engage/chiz-pink/), a website
where you pick your language and translate strings one at a time.

A few things to keep in mind:

- **Partial translations are fine.** Anything that isn't translated yet falls
  back to English, so you don't have to do everything at once.
- **Keep placeholders intact.** Text like `{count}` or `{name}` gets
  replaced with real values, so leave it exactly as is (you can move it
  around in the sentence).
- **Keep tags around the same words.** In
  `Read the <link>privacy policy</link>`, the part between the tags
  becomes a link (or bold text, etc.). Translate the words inside, but
  keep both tags and their names.
- **Plurals have one text per form.** Texts that depend on a number come
  in forms like "1 pull" and "5 pulls". Weblate shows the forms your
  language needs; fill in each one. In the "one" form you can write the
  number out instead of using `{count}`.
- **Use the in-game terms.** If the game is officially available in your
  language, use its official names for things (Arcs, materials, menus) so
  players recognise them.
- **Game data is not translated yet.** Character names, bios, and ability
  descriptions are English-only for now. Only the site's own interface text
  is translatable.

Want a language that isn't listed yet? Request it on Weblate or ask in the
Discord.

## Code

I'm not accepting code contributions at the moment. Feel free to open an
issue for bugs or ideas though.

## Licensing of contributions

By submitting a contribution (including translations), you agree that it is
licensed under the same license as the project, the
[GNU Affero General Public License v3.0](LICENSE), and that you have the
right to submit it.
