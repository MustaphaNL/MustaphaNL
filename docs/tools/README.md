# Word-export van de rapporten

De documenten in `docs/word/` zijn gegenereerd uit de markdown in `docs/`.
Regenereren na een wijziging in de markdown:

```bash
npm install docx
node md2docx.js ../technische-audit-haarlemmermeervoorelkaar.md \
    ../word/Technische-audit-haarlemmermeervoorelkaar.docx cfg-audit.json
node md2docx.js ../technisch-bouwdossier-platform.md \
    ../word/Technisch-bouwdossier-vrijwilligersplatform.docx cfg-bouwdossier.json

./fixdefault.sh ../word/Technische-audit-haarlemmermeervoorelkaar.docx
./fixdefault.sh ../word/Technisch-bouwdossier-vrijwilligersplatform.docx
```

`md2docx.js` zet koppen, tabellen, codeblokken, lijsten en blockquotes om, en
bouwt een titelpagina met een inhoudsopgaveveld. `fixdefault.sh` markeert de
Normal-stijl als standaard-alineastijl, wat docx-js zelf niet doet.

De inhoudsopgave is een Word-veld: bij het openen vraagt Word of de velden
bijgewerkt mogen worden, of gebruik Ctrl+A en dan F9.
