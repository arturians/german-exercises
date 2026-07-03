# German Cases

A Vite + React practice app for German adjective endings.

## Upload Format

Upload a CSV or TSV file with a header row:

```csv
sentence,ending,declension,case,gender,number
"Der klein__ Hund schläft im Flur.",-e,weak,Nominativ,Maskulin,Singular
"Ich sehe den alt__ Mann am Bahnhof.",-en,weak,Akkusativ,Maskulin,Singular
"Ein klein__ Hund schläft im Flur.",-er,mixed,Nominativ,Maskulin,Singular
"Wir kaufen frisch__ Brot.",-es,strong,Akkusativ,Neutrum,Singular
```

Use two underscores in the sentence where the ending should be entered. The ending can be written with or without the leading hyphen. Use `-` for no ending.

If `declension` is omitted, the app treats the row as `weak` for compatibility with older files.

Declension values:

- `weak`: definite article / der-word, e.g. `der`, `dieser`, `jener`, `welcher`.
- `mixed`: ein-word / possessive, e.g. `ein`, `kein`, `mein`, `dein`.
- `strong`: no article or quantity word where the adjective carries the ending.

Supported cases: `Nominativ`, `Akkusativ`, `Dativ`, `Genitiv`.

Supported genders: `Maskulin`, `Feminin`, `Neutrum`, `Plural`.

Supported numbers: `Singular`, `Plural`.

## Commands

```bash
npm install
npm run dev
npm run build
```
