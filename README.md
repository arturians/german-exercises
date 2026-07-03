# German Cases

A Vite + React practice app for German adjective endings.

## Upload Format

Upload a CSV or TSV file with a header row:

```csv
sentence,ending,case,gender,number
"Der klein__ Hund schläft im Flur.",-e,Nominativ,Maskulin,Singular
"Ich sehe den alt__ Mann am Bahnhof.",-en,Akkusativ,Maskulin,Singular
"Wir kaufen frisch__ Brot.",-,Akkusativ,Neutrum,Singular
```

Use two underscores in the sentence where the ending should be entered. The ending can be written with or without the leading hyphen. Use `-` for no ending.

Supported cases: `Nominativ`, `Akkusativ`, `Dativ`, `Genitiv`.

Supported genders: `Maskulin`, `Feminin`, `Neutrum`, `Plural`.

Supported numbers: `Singular`, `Plural`.

## Commands

```bash
npm install
npm run dev
npm run build
```
