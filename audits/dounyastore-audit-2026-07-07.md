# Website-audit — dounyastore.nl

**Datum:** 7 juli 2026
**Scope:** Laadbaarheid, SEO, GEO (vindbaarheid in AI-zoekmachines) en gebruiksvriendelijkheid
**Methode:** Shopify Admin API (live storedata: producten, collecties, pagina's, menu's, thema, markten), Google-indexcontrole via websearch. Directe browsertoegang en PageSpeed-meting waren vanuit deze omgeving geblokkeerd; de laadbaarheid is daarom indirect beoordeeld (zie §2).

---

## 1. Samenvatting

| Onderdeel | Oordeel | Belangrijkste bevinding |
|---|---|---|
| Laadbaarheid | 🟡 Waarschijnlijk goed | Dawn-thema en WebP-afbeeldingen zijn een snelle basis, maar 2 producten hebben 18–29 afbeeldingen (zwaar op mobiel) |
| SEO | 🔴 Onvoldoende | Site lijkt **niet geïndexeerd in Google**; testtekst in SEO-titels ("VVVVV", "GDSDHFGJHGGDDF"); alt-teksten ontbreken op ~99% van de afbeeldingen |
| GEO | 🟠 Matig | Goede FAQ- en blogbasis, maar zolang de site niet geïndexeerd is, vinden ook AI-zoekmachines je niet; geen reviews/schema-verrijking |
| Gebruiksvriendelijkheid | 🟡 Redelijk | Heldere navigatie, volledige juridische info en iDEAL/Klarna — maar de FAQ-pagina is nergens gelinkt en de levertijd van 10–15 werkdagen staat alleen in die onvindbare FAQ |

**De drie belangrijkste acties:**
1. **Google Search Console instellen en de sitemap indienen** (`https://dounyastore.nl/sitemap.xml`) — een zoekopdracht `site:dounyastore.nl` levert nu geen enkel resultaat op. Wachtwoordbeveiliging staat uit, dus de site is publiek; hij is alleen (nog) niet geïndexeerd.
2. **SEO-titels en -beschrijvingen repareren** — meerdere producten bevatten letterlijk testtekst en afgebroken zinnen die zo in Google zouden verschijnen.
3. **FAQ en verzendinformatie zichtbaar maken** in het menu/footer en op productpagina's — de levertijd van 10–15 werkdagen mag geen verrassing bij de checkout zijn.

---

## 2. Laadbaarheid

**Wat niet gemeten kon worden:** het netwerkbeleid van deze werkomgeving blokkeerde direct browserbezoek aan dounyastore.nl, en de PageSpeed Insights API accepteerde geen anonieme aanvragen. Doe zelf een meting via [pagespeed.web.dev](https://pagespeed.web.dev/analysis?url=https://dounyastore.nl) (gratis, 1 minuut) voor harde Core Web Vitals-cijfers.

**Wat wel beoordeeld is (via de store-configuratie):**

| Aspect | Status | Toelichting |
|---|---|---|
| Thema | ✅ Goed | Live thema is **Dawn** — Shopify's referentiethema, een van de snelste die er zijn (Online Store 2.0, lazy loading, responsive images ingebouwd) |
| SSL | ✅ Actief | HTTPS op het primaire domein |
| Afbeeldingsformaat | ✅ Grotendeels goed | Vrijwel alle productafbeeldingen zijn WebP; één uitzondering: de hoofdafbeelding van het 4-in-1 Gezichtsapparaat is een PNG (`7.png`) — converteer naar WebP/JPG |
| Aantal afbeeldingen per product | ⚠️ Twee uitschieters | "Jade Roller & Gua Sha Set" heeft **29 media-items** en de "PDRN Oogcrème" **18**. Dat maakt die pagina's traag op mobiel en oogt rommelig. Richtlijn: 6–8 sterke beelden per product |
| Ongebruikte thema's | ℹ️ Opruimen | 4 niet-gepubliceerde thema's staan nog in de store (Horizon, 2× FreeStoreBuild, Dawn-preview). Geen effect op snelheid, wel op overzicht |
| Apps | ℹ️ Niet controleerbaar | App-lijst was niet uitleesbaar met de huidige API-rechten. Veel snelheidsverlies bij Shopify komt van app-scripts — check dit in de PageSpeed-meting |

---

## 3. SEO

### 3.1 Kritiek: de site is niet vindbaar in Google
Een `site:dounyastore.nl`-zoekopdracht geeft **nul resultaten**; ook op merknaam + productzoektermen verschijnt de site niet. De storefront is publiek (wachtwoordbeveiliging staat uit), dus de meest waarschijnlijke oorzaak is dat de site simpelweg nog nooit is aangemeld — de shop is pas sinds mei/juni actief.

**Actie:**
- Maak [Google Search Console](https://search.google.com/search-console) aan, verifieer het domein en dien `https://dounyastore.nl/sitemap.xml` in.
- Doe hetzelfde bij [Bing Webmaster Tools](https://www.bing.com/webmasters) (Bing voedt ook ChatGPT/Copilot — relevant voor GEO).
- Controleer in Search Console daarna op crawlfouten.

*Let op: dounyastore.**com** is een andere (buitenlandse) webshop met bijna dezelfde naam. Overweeg of merkverwarring een risico is.*

### 3.2 Testtekst en kapotte meta-teksten op productpagina's
Dit verschijnt straks letterlijk in de zoekresultaten van Google:

| Product | Probleem in SEO-titel/-beschrijving |
|---|---|
| 4-in-1 Gezichtsapparaat | Titel: "4-in-1 Gezichtsapparaat **VVVVV**"; beschrijving bevat het afgebroken woord "reinigen**herapie**" |
| 4-in-1 RF & EMS Gezichtsmassager | Titel: "gezichtsmassager met radiofrequentie **GDSDHFGJHGGDDF**" |
| 2-in-1 Gezichtsmassager & Gua Sha | Titel eindigt op "…gua sha roller**GGF**" |
| EMS gezichtsmassage rood licht | Beschrijving breekt af midden in een woord en plakt de titel eraan: "…voor lifting rond og**EMS gezichtsmassage rood licht**" |
| Gezichtslifter LED/EMS | Beschrijving: "Voor een jong**verzending vanaf €35**" — zin loopt kapot |
| Vrijwel alle producten | De SEO-beschrijving eindigt met een herhaling van de SEO-titel — dit patroon zit in bijna elk product en moet overal weg |
| PDRN Oogcrème, RF Cavitatie Gel | **Geen** SEO-titel en -beschrijving ingevuld (Shopify valt dan terug op titel + eerste tekst — suboptimaal) |

**Actie:** herschrijf per product de SEO-titel (max ~60 tekens, zoekwoord voorin, bv. "EMS Gezichtsmassager met Rood Licht | Dounya Store") en de meta-beschrijving (max ~155 tekens, één lopende zin met USP: gratis verzending vanaf €35, 14 dagen retour).

### 3.3 Alt-teksten ontbreken vrijwel volledig
Van de ~130 productafbeeldingen heeft er precies **1** een alt-tekst. Alt-teksten zijn belangrijk voor Google Afbeeldingen, toegankelijkheid (screenreaders) én AI-crawlers.
**Actie:** geef minimaal de hoofdafbeelding van elk product een beschrijvende alt-tekst ("EMS microstroom gezichtsmassager van roestvrij staal, vooraanzicht").

### 3.4 Collecties zijn kaal
Alle 4 collecties missen SEO-titel, meta-beschrijving én collectie-afbeelding. De collectie "Gezichtsapparaten" heeft bovendien de Engelse handle `/collections/health-beauty` — een leesbare Nederlandse URL (`/collections/gezichtsapparaten`) is beter (stel dan wel een redirect in).

### 3.5 Product-URL's en data-hygiëne
- Het EMS rood licht-apparaat heeft een extreem lange Engelse AliExpress-handle (`/products/ems-microcurrent-face-lifting-device-red-light-facial-wand-eye-neck-...`) terwijl de rest netjes Nederlands is. Korte NL-handle + redirect aanmaken.
- **Producttype is leeg en er zijn geen tags** bij alle 14 producten; 4 producten hebben geen (volledige) Shopify-categorie. Dit schaadt vooral de Google Shopping-feed en filters. Vul de taxonomie aan.
- De Jade Roller-set heeft een voorraad van **9.880 stuks** — duidelijk een import-placeholder; zet dit op een realistisch getal (schaarste verkoopt bovendien beter).

### 3.6 Blog: goede onderwerpen, onafgemaakte uitvoering
De 3 artikelen (EMS vs RF, Gua sha voor beginners, K-beauty routine) zijn precies de juiste onderwerpen voor deze niche. Maar: **geen enkel artikel heeft een uitgelichte afbeelding of samenvatting/meta-beschrijving**. Vul die aan en link vanuit elk artikel naar de relevante producten (en andersom).

### 3.7 Wat al goed is
- De homepage-metabeschrijving is prima geschreven (zoekwoord, USP, call-to-action).
- Alle 6 juridische policies (privacy, retour, verzending, voorwaarden, contact, wettelijk) zijn aanwezig — sterk vertrouwenssignaal, ook voor Google.
- Nederlands als primaire taal, markten Nederland + België correct geconfigureerd.

---

## 4. GEO — vindbaarheid in AI-zoekmachines (ChatGPT, Perplexity, Claude, Google AI)

**Fundament eerst:** AI-zoekmachines leunen op de indexen van Google en Bing en op eigen crawlers. Zolang de site niet geïndexeerd is (§3.1), besta je ook voor AI-antwoorden niet. Search Console + Bing Webmaster zijn dus ook dé eerste GEO-actie.

**Wat al goed is voor GEO:**
- De **FAQ-pagina** beantwoordt exact de vragen die mensen aan AI stellen (levertijd, retour, veiligheid, betaalmethodes) in een vraag-antwoordstructuur — dit is het format waar AI-modellen uit citeren.
- De blogartikelen zijn informatief/educatief ("wat werkt het beste", "stap voor stap") — precies het contenttype dat in AI-antwoorden terechtkomt.
- Volledige bedrijfsgegevens (KvK 91552664, BTW-nummer, fysiek adres in Hoofddorp) zijn een sterk betrouwbaarheidssignaal voor zowel Google als AI-modellen.

**Wat ontbreekt:**
1. **Structured data verrijken.** Dawn levert basis-Product-JSON-LD, maar voeg toe: `FAQPage`-schema op de FAQ-pagina en `Organization`-schema met KvK/adres/logo (kan via een klein stukje theme-code of een app als "JSON-LD for SEO").
2. **Reviews.** Er is geen enkel reviewsignaal. Zonder beoordelingen word je door AI zelden aanbevolen ("wat is een goede EMS-massager?" → AI noemt merken met reviews). Installeer een review-app (Judge.me is gratis en voegt review-schema toe).
3. **AI-crawlers toelaten.** Shopify's standaard robots.txt is prima, maar controleer dat er geen app of instelling GPTBot, ClaudeBot, PerplexityBot of Google-Extended blokkeert.
4. **Opgeschoonde content.** De "Over ons"-pagina bevat in de HTML geleakte CSS-klassen (`font-claude-response-body break-words ...`) van gekopieerde AI-output. Verwijder die opmaak — het is onzichtbaar voor bezoekers maar rommelig voor crawlers, en een teken dat content ongecontroleerd geplakt is.
5. **Consistentie.** De gratis-verzenddrempel is nu eens "€35" (homepage-meta, productteksten) en dan weer "€34,95" (FAQ). AI-modellen citeren letterlijk — kies één bedrag en gebruik dat overal.

---

## 5. Gebruiksvriendelijkheid

**Sterk:**
- Overzichtelijk hoofdmenu: Home, 3 logische collecties, Contact.
- Contactpagina met concreet e-mailadres, fysiek adres en KvK/BTW — wekt vertrouwen.
- iDEAL, creditcard, PayPal én Klarna — de juiste betaalmix voor NL/BE.
- 14 dagen bedenktijd en gratis verzending boven drempel, helder uitgelegd.

**Verbeterpunten (op volgorde van impact):**

1. **De FAQ-pagina is onbereikbaar.** Hij bestaat (`/pages/faq`) maar staat in geen enkel menu — footer noch hoofdmenu. Juist déze pagina beantwoordt de koopdrempels (levertijd! retour!). Voeg hem toe aan het footermenu, samen met links naar de retour- en verzendpolicy.
2. **Levertijd 10–15 werkdagen staat alleen in die verborgen FAQ.** Drie weken wachten is de grootste conversie-killer van dit businessmodel; als klanten er pas ná bestelling achter komen, krijg je annuleringen, chargebacks en slechte reviews. Zet de verwachte levertijd zichtbaar op elke productpagina (bv. onder de bestelknop).
3. **Geen reviews of social proof** op een gemiddeld orderbedrag van €20–80. Dit is voor twijfelende kopers het belangrijkste gemis (zie ook GEO §4).
4. **Verouderd menu-item.** Het menu "Collecties" bevat nog "Gezondheid & Schoonheid" → oude naam van de collectie die nu "Gezichtsapparaten" heet. Opruimen of hernoemen.
5. **Reactietermijn "binnen 2 werkdagen"** op de contactpagina is traag voor e-commerce; concurrenten beloven 24 uur. Overweeg dat aan te scherpen (alleen als je het waarmaakt).
6. **Productpagina's met 18–29 foto's** (Jade Roller-set, PDRN-crème) zijn op mobiel onoverzichtelijk; snoei naar de 6–8 beste beelden.
7. **Inconsistente titelopmaak** — mix van "—", "–" en "-" in producttitels oogt onrustig in collectie-overzichten; kies één stijl.
8. **3 conceptproducten** staan nog op DRAFT (o.a. "EMS Gezichtsmassager met LED Therapie") — publiceren of verwijderen.

---

## 6. Prioriteitenlijst

| # | Actie | Impact | Moeite |
|---|---|---|---|
| 1 | Search Console + Bing Webmaster instellen, sitemap indienen | 🔴 Zeer hoog | 30 min |
| 2 | SEO-titels/-beschrijvingen van alle producten herschrijven (testtekst eruit) | 🔴 Zeer hoog | 2 uur |
| 3 | FAQ + retour-/verzendlinks in footer; levertijd op productpagina's | 🔴 Hoog (conversie) | 30 min |
| 4 | Review-app installeren (bv. Judge.me) | 🟠 Hoog | 1 uur |
| 5 | Alt-teksten hoofdafbeeldingen + SEO-velden collecties invullen | 🟠 Middel | 1,5 uur |
| 6 | Eén verzenddrempel kiezen (€35 óf €34,95) en overal doorvoeren | 🟠 Middel | 15 min |
| 7 | FAQPage- en Organization-schema toevoegen | 🟡 Middel | 1 uur |
| 8 | Blogartikelen: uitgelichte afbeeldingen + samenvattingen + interne links | 🟡 Middel | 1 uur |
| 9 | Fotosets snoeien (29→8), PNG→WebP, voorraad-placeholder fixen | 🟡 Laag-middel | 1 uur |
| 10 | Menu-item "Gezondheid & Schoonheid" opruimen; oude thema's verwijderen; NL-handles | 🟢 Laag | 30 min |

**Nameten:** draai na actie 1 en 2 een PageSpeed-meting via pagespeed.web.dev en controleer na 1–2 weken in Search Console of de pagina's geïndexeerd raken.

---

*Opmerking bij de methode: omdat de audit-omgeving geen direct browserverkeer naar de site toestond, zijn thema-rendering, checkout-flow en werkelijke Core Web Vitals niet visueel gecontroleerd. De bevindingen hierboven komen rechtstreeks uit de live Shopify-data van de store en zijn daarmee exact, maar een aanvullende handmatige mobiele test (menu, productpagina, checkout doorlopen) blijft aan te raden.*

---

## Addendum (7 juli 2026, n.a.v. PageSpeed-meting): kapotte code in theme.liquid gevonden en gefixt

De PageSpeed-meting van de eigenaar (Speed Index 2,8 s mobiel — groen) bevestigde dat de site snel genoeg is. Bij het naspeuren van de meldingen is in `layout/theme.liquid` een ernstiger probleem gevonden:

1. **Kapotte Google site-verification metatag** (regel 4): de tag was nooit afgesloten (`content="7ZIkfWwNjnFcm8G` zonder `">`), waardoor de browser de volgende regel — de `<meta charset="utf-8">` — opslokte. Gevolg: Search Console-verificatie kan nooit slagen én de charset-declaratie ontbrak. De geplakte code is bovendien afgekapt (15 tekens i.p.v. ±43) en moet opnieuw uit Search Console gekopieerd worden.
2. **Dubbele `</body>`**: het Organization JSON-LD-schema stond *buiten* de body (na een eerste `</body>`), gevolgd door een tweede `</body>`. Ongeldige HTML.
3. **Verkeerd domein in het schema**: het JSON-LD verwees naar `https://www.dounyastore.nl` terwijl het primaire domein zonder www is.

**Status:** alle drie de fouten zijn gecorrigeerd in het niet-gepubliceerde thema "Dawn - DEEL 2 preview" (byte-voor-byte geverifieerd via checksum). Het live thema kon via de koppeling niet beschreven worden; daarvoor is een handmatige copy-paste in de code-editor nodig (instructies apart geleverd).

**Beoordeling van de overige PageSpeed-meldingen:**

| Melding | Fixbaar? | Toelichting |
|---|---|---|
| Renderblokkering (150 ms) | Deels, laag rendement | `base.css` + component-CSS is Dawn-ontwerp; `accelerated-checkout-backwards-compat.css` wordt door Shopify zelf geïnjecteerd. 150 ms winst weegt niet op tegen het risico van CSS-herstructurering |
| Gedwongen dynamische aanpassing (5–25 ms) | Nee | Veroorzaakt door Shopify's Web Pixels Manager (`wpm/...js`) en `global.js` van Dawn; verwaarloosbaar effect |
| Netwerkafhankelijkheidsstructuur (font 731 ms) | Al geoptimaliseerd | Het DM Sans-font wordt al gepreload met `font-display: swap`; de `shop-cart-sync`-chunks zijn van Shopify's Shop-integratie en niet aanpasbaar |
| Cache-levensduur (151 KiB) | Nee | Shopify-/pixelscripts met korte TTL — buiten controle van de merchant |
| Afbeeldingslevering (45 KiB) | Ja | Vervang de PNG-productfoto (`7.png` van het 4-in-1 Gezichtsapparaat) door WebP/JPEG en snoei de fotosets van 29/18 naar 6–8 beelden |
| Verouderde JavaScript (13 KiB) | Nee | Shopify-polyfills |

Conclusie: de site is qua snelheid gezond; de echte winst van deze meting was het ontdekken van de kapotte verificatietag — vermoedelijk dé reden dat Search Console-verificatie (en daarmee indexering-monitoring) nooit gelukt is.
