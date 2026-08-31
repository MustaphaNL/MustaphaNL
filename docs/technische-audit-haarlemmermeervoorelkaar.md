# Technische audit & herbouwblauwdruk
## haarlemmermeervoorelkaar.nl

**Opdracht:** in kaart brengen wat het huidige platform is en doet, zodat we een vergelijkbaar of beter platform in eigen beheer kunnen bouwen.
**Datum:** 31 augustus 2026
**Status:** audit op basis van publieke bronnen + admin-screenshot. Geen live technische scan uitgevoerd (zie *Beperkingen*).

---

## 0. Beperkingen van deze audit

Het netwerkbeleid van deze werkomgeving blokkeert alle uitgaande verbindingen naar `haarlemmermeervoorelkaar.nl`, `nlvoorelkaar.nl` en `vchaarlemmermeer.nl`. Daardoor ontbreken in deze ronde:

- HTTP-responseheaders (server, CDN, security headers, caching)
- HTML-bron en JavaScript-bundles (framework-fingerprint)
- `robots.txt`, `sitemap.xml`, `/api/*`-endpoints
- Lighthouse-/performancemeting en WCAG-scan
- DNS-, WHOIS- en TLS-gegevens

**Wat hieronder staat, is opgedeeld in:**

| Label | Betekenis |
|---|---|
| **[V]** | Geverifieerd uit een publieke bron of jouw screenshot |
| **[A]** | Afgeleid — logische conclusie, nog te bevestigen |
| **[O]** | Openstaand — moet opgevraagd of gemeten worden |

Alles met **[A]** of **[O]** is te sluiten met één meetronde vanaf een machine met normale internettoegang (§9).

---

## 1. Managementsamenvatting

Het belangrijkste dat deze audit oplevert is geen technisch detail, maar een strategisch feit:

> **haarlemmermeervoorelkaar.nl is geen zelfstandige website. Het is een white-label instantie van het landelijke platform NLvoorelkaar, beheerd door The Impact Dept.** **[V]**

Dat verklaart de URL `/beheer-wl/dashboard` — `wl` staat voor *white label* **[A]**. Het verklaart ook waarom een hulpvraag het adres `/hulpvragen/324105` heeft: een ID in de honderdduizenden past niet bij één gemeente, maar bij een landelijke, gedeelde database **[V/A]**.

Dit heeft drie zware consequenties voor het herbouwplan:

1. **Technisch is de herbouw goed te doen.** Het is functioneel een marktplaats met matching: profielen, oproepen, reacties, berichten, moderatie en een CMS. Geen exotische techniek. Een realistische inschatting is 4–7 maanden tot volledige pariteit (§8).

2. **De data is waarschijnlijk niet integraal "van jullie".** Deelnemers hebben zich aangemeld bij een landelijk netwerk. Wat er in een back-up mag zitten, en op welke juridische grondslag die naar een nieuw platform mag, is de belangrijkste openstaande vraag van dit hele project (§6.2). Dit moet vóór de eerste regel code worden uitgezocht.

3. **Het grootste verlies bij vertrek is niet software, maar netwerkeffect.** Het landelijke platform voedt het lokale met vrijwilligers en hulpvragen van buiten de gemeente, plus landelijke campagnes. Een eigen platform begint met nul instroom van buiten. Dit is te compenseren, maar alleen bewust en met een wervingsplan (§7.1).

Mijn advies: **bouwen kan en is verdedigbaar**, maar de volgorde is — eerst contract en data-exit uitzoeken, dan pas bouwen. Anders bouw je een leeg platform.

---

## 2. Wat is het platform precies?

### 2.1 Eigendom en beheerketen **[V]**

| Laag | Partij |
|---|---|
| Software / hosting / doorontwikkeling | **The Impact Dept** (exploitant NLvoorelkaar) |
| Landelijk platform | **NLvoorelkaar.nl** — 200.000+ deelnemers, 15.000+ organisaties, 70+ lokale varianten |
| Lokale exploitatie / redactie / matching | **Vrijwilligerscentrale Haarlemmermeer (VCH)** — `info@haarlemmermeervoorelkaar.nl`, 023 569 8870 |
| Financiering / opdrachtgever | Gemeente Haarlemmermeer **[A]** |
| Beheerdersrol in de admin | Jij (Mustapha) — rechten op deelnemers, matches, monitor, pagina's, menu **[V, screenshot]** |

Samenwerkingen met The Impact Dept lopen doorgaans **drie jaar met verlengingsoptie**, met modulaire kosten afhankelijk van inwoneraantal en afgenomen diensten **[V]**. Opzegtermijn en einddatum: **[O]** — opvragen.

### 2.2 Bevestigde URL-structuur **[V]**

Uit publieke bronnen zijn deze paden bevestigd:

```
/                                  homepage
/hoe-het-werkt                     uitleg
/hulpvragen/                       overzicht hulpvragen + vacatures
/hulpvragen/{id}                   detailpagina (bv. /hulpvragen/324105)
/hulpaanbod/                       overzicht vrijwilligers/aanbod
/ons-aanbod?page=Ons+aanbod&p=2    CMS-pagina met paginering
/inspiratie/                       redactionele content
/toolbox-vrijwilligerswerk         kennisbank
/vrijwilligerscentrale-dienstverlening
/voorwaarden                       gebruiksvoorwaarden
/helpcentrum/artikel/{id}          helpcentrum
/beheer-wl/dashboard               admin
```

**Twee technische vingerafdrukken hieruit:**

- `/helpcentrum/artikel/209574689` en `/artikel/360012775019` — dit zijn karakteristieke **Zendesk Guide** artikel-ID's **[A, sterk]**. Het helpcentrum is dus een gekoppelde externe kennisbank, geen eigen content. Bij herbouw eenvoudig te vervangen door eigen artikelen.
- `?page=Ons+aanbod&p=2` — server-side gerenderde paginering met querystring, geen SPA-routing **[A]**. Wijst op een klassieke server-rendered applicatie (Rails/Laravel/Django-achtig) in plaats van een JS-frontend.

### 2.3 Concreet techniekvermoeden **[A/O]**

Framework, hosting en CDN zijn **niet vastgesteld**. Wat wel afleidbaar is: server-side rendering, numerieke auto-increment ID's in URL's, klassieke formulieren, ingebedde externe diensten (Zendesk, Tableau). Voor de herbouw is dit trouwens grotendeels irrelevant — we kopiëren geen code, we kopiëren gedrag.

---

## 3. Functionele inventarisatie (de eigenlijke specificatie)

Dit is de kern van de audit: wat moet er gebouwd worden om pariteit te halen.

### 3.1 Rollen

| Rol | Wat die kan |
|---|---|
| **Bezoeker** (niet ingelogd) | Zoeken en bladeren door hulpvragen, vacatures, activiteiten en vrijwilligersaanbod. Contactgegevens zijn afgeschermd **[V]** |
| **Deelnemer/vrijwilliger** | Profiel, aanbod plaatsen, reageren, berichten, eigen oproepen beheren |
| **Hulpvrager** (inwoner) | Hulpvraag plaatsen — voor zichzelf **of voor familie/vriend in de omgeving** **[V]** |
| **Professional / verwijzer** | Hulpvraag plaatsen **namens een cliënt** **[V]** — aparte flow, privacygevoelig |
| **Organisatiebeheerder** | Organisatieprofiel beheren, vacatures/activiteiten plaatsen. Alleen de aangewezen beheerder mag organisatiegegevens wijzigen **[V]** |
| **Platformbeheerder** (jij) | Volledige admin: deelnemers, matches, monitor, CMS, instellingen **[V]** |

### 3.2 Publieke functies

- **Account aanmaken** met e-mailadres of via externe login (Google/Facebook) **[V]**
- **Profiel** met interesses/categorieën die de matching voeden **[V]**
- **Privacy by design in de kern:** contactgegevens blijven privé; publiek zijn alleen voornaam en plaats **[V]**. Dit is een harde eis bij herbouw, geen nice-to-have.
- **Oproep plaatsen** in vier smaken: hulpvraag, hulpaanbod, vrijwilligersvacature, activiteit/cursus (ook e-learning en workshops) **[V]**
- **Zoeken en filteren** op categorie, locatie/postcode, type
- **Reageren** op een oproep — met expliciete feedbackloop: reageren helpt de plaatser weten waar die aan toe is **[V]**
- **Berichten** sturen via een knop op de oproep — interne messaging, contactgegevens pas na contact **[V]**
- **Oproep afsluiten en match doorgeven** — de plaatser sluit af en registreert of er een match is **[V]**. Dit is de bron van alle impactcijfers.
- **Redactionele content:** inspiratie, toolbox, dienstverleningspagina's
- **Helpcentrum** (nu Zendesk)
- **Voorwaarden + gedragsregels**, met **minimumleeftijd** (varieert per platform: 14 of 16 jaar) **[V]** — voor Haarlemmermeer **[O]**

### 3.3 Beheerfuncties — uit jouw screenshot **[V]**

```
Deelnemers & Activiteiten   → Deelnemers overzicht, Matches overzicht
Platform inrichten          → Pagina's overzicht, Menu aanpassen
Monitor                     → Monitor reacties
Instellingen                → (niet uitgeklapt)

Externe koppelingen: Startpagina beheerders · Toolbox (kennisbank)
                     Rapportage (Tableau) · Iets vragen of rapporteren
```

Wat hier staat, vertelt veel:

- **Monitor reacties** = moderatiewachtrij. Er wordt actief meegekeken op reacties — logisch bij een kwetsbare doelgroep. Bij herbouw is dit een volwaardige module, geen bijzaak.
- **Matches overzicht** = matchregistratie is een first-class entiteit, geen afgeleide.
- **Pagina's + Menu** = er zit een volwaardig CMS in de admin. Onderschat dit niet in de planning.
- **Rapportage via Tableau** = BI is extern ingebed **[V]**. Zelf te vervangen door Metabase (open source).
- **Toolbox als externe kennisbank** en **"Iets vragen of rapporteren"** als supportkanaal richting de leverancier — beide vervallen bij eigen beheer en moeten door jullie zelf worden ingevuld.

---

## 4. Datamodel voor de herbouw

Voorstel voor PostgreSQL. Dit is direct implementeerbaar.

```
users                 id, email, password_hash, email_verified_at, first_name,
                      last_name, phone, street, postcode, city, district,
                      geo (PostGIS point), avatar, bio, birth_date, role,
                      status, last_login_at, created_at, deleted_at
oauth_accounts        user_id, provider, provider_uid
consents              user_id, document (terms|privacy), version, accepted_at, ip

organisations         id, name, kvk, description, website, logo, email, phone,
                      address, geo, type, status, verified_at
organisation_members  organisation_id, user_id, role (beheerder|medewerker)

listings              id, type (hulpvraag|hulpaanbod|vacature|activiteit),
                      title, description, owner_user_id, organisation_id,
                      on_behalf_of_type (zelf|naaste|client), postcode, geo,
                      radius_km, time_indication, frequency, starts_at, ends_at,
                      status (concept|actief|gepauzeerd|gesloten|verlopen),
                      published_at, expires_at, closed_reason, view_count
categories            id, parent_id, name, slug, sort_order
listing_categories    listing_id, category_id
target_groups         id, name        (+ listing_target_groups)

responses             id, listing_id, from_user_id, message, status
                      (nieuw|geaccepteerd|afgewezen|ingetrokken), created_at
matches               id, listing_id, helper_user_id, requester_user_id,
                      matched_at, source (platform|buiten platform),
                      reported_by_user_id, hours_estimate

conversations         id, listing_id            (+ conversation_participants)
messages              id, conversation_id, sender_user_id, body, read_at

reports               id, target_type, target_id, reporter_user_id, reason,
                      status, handled_by_user_id, handled_at, notes
moderation_queue      item_type, item_id, reason, assigned_to, state

pages                 id, slug, title, blocks (jsonb), seo, published_at
menus / menu_items    hierarchische navigatie
articles              inspiratie + toolbox/kennisbank
media                 bestanden, alt-teksten

notifications         user_id, type, payload, read_at
email_log             to, template, status, provider_id, sent_at
saved_searches        user_id, criteria (jsonb), alert_frequency
audit_log             actor_user_id, action, target, diff (jsonb), ip, at
settings              key, value (huisstijl, domein, e-mailteksten)
```

**Twee ontwerpkeuzes die ik expliciet aanbeveel:**

1. **Eén `listings`-tabel met een `type`-kolom** in plaats van vier aparte tabellen. Zoeken, matchen en modereren werken dan over alle types tegelijk — precies wat het huidige platform doet (hulpvragen én vacatures op één overzicht).
2. **`audit_log` vanaf dag één.** Bij een platform met hulpvragen van kwetsbare mensen is "wie heeft wat wanneer ingezien" geen luxe maar een AVG-verantwoordingsplicht.

### 4.1 Matching-logica

Het huidige platform matcht op **categorieën** (expliciet bevestigd: de gekozen categorieën worden gebruikt om vraag aan aanbod te koppelen **[V]**) plus locatie. Voorstel voor een betere versie:

```
score = 3 × categorie-overlap
      + 2 × geo-nabijheid (PostGIS, binnen straal)
      + 1 × beschikbaarheid/tijdsindicatie
      + 1 × doelgroep-match
      − penalty voor verlopen/inactief
```

Plus wat er nu **niet** is en wel waarde toevoegt: **opgeslagen zoekopdrachten met e-mailalerts** ("mail me bij nieuwe hulpvragen in Nieuw-Vennep, categorie vervoer"). Dat is de goedkoopste manier om het verloren netwerkeffect deels te compenseren.

---

## 5. Voorgestelde architectuur

| Laag | Keuze | Waarom |
|---|---|---|
| Frontend + backend | **Next.js 15 (App Router) + TypeScript** | Server-rendered = goed voor SEO op honderden oproeppagina's; één codebase |
| UI | **Tailwind + shadcn/ui** | Snel, toegankelijk als basis, volledig eigen huisstijl mogelijk |
| Database | **PostgreSQL 16 + PostGIS** | Geo-matching op postcode/straal zonder externe dienst |
| ORM | **Drizzle** (of Prisma) | Typeveilig, transparante SQL |
| CMS | **Payload CMS** (self-hosted, in dezelfde Next.js-app, Postgres) | Levert Pagina's + Menu + Media + rollen kant-en-klaar — precies de "Platform inrichten"-module. Scheelt weken |
| Auth | **Auth.js v5** — e-mail + Google, **2FA verplicht voor beheerders** | Pariteit met sociale login; 2FA is een verbetering |
| E-mail | **Postmark of Mailjet (EU)** + SPF/DKIM/DMARC | Transactionele mail is bedrijfskritisch bij matching |
| Zoeken | **Postgres full-text (Nederlands) + pg_trgm**, later Typesense | Geen extra dienst nodig bij dit volume |
| Bestanden | S3-compatibel in de EU (Scaleway/OVH) | AVG-vriendelijk |
| Hosting | **EU/NL**: Hetzner of Scaleway + Docker, of Azure West Europe | Datalocatie in de EU is bij deze doelgroep een eis, geen voorkeur |
| Statistiek | **Plausible of Matomo (self-hosted)** | Cookieloos → geen cookiebanner nodig |
| Rapportage | **Metabase** | Vervangt Tableau, open source |
| Foutmonitoring | **Sentry (EU-region)** | |
| CI/CD | **GitHub Actions** + preview-omgevingen | |
| Testen | Vitest + Playwright + **axe-core** in CI | Toegankelijkheid automatisch bewaken |

**Bewuste afweging:** Vercel is technisch de makkelijkste hosting voor Next.js, maar is een Amerikaans bedrijf. Bij een gemeentelijk gefinancierd platform met zorggerelateerde hulpvragen adviseer ik EU-hosting bij een Europese partij, ook al kost dat wat meer opzetwerk.

---

## 6. Juridisch, privacy en toegankelijkheid

Dit hoofdstuk is bij dit specifieke platform zwaarder dan het technische deel.

### 6.1 AVG-risicoprofiel: hoog

- Hulpvragen bevatten in de praktijk **gezondheids- en zorggegevens** (bijzondere persoonsgegevens, art. 9 AVG). Iemand die om hulp bij boodschappen vraagt vanwege een beperking, geeft feitelijk medische informatie prijs.
- Er worden hulpvragen **namens cliënten door professionals** geplaatst **[V]** — verwerking van gegevens van iemand die zelf geen account heeft.
- **Minderjarigen** hebben toegang (14 of 16 jaar minimumleeftijd) **[V]**.

**Daarom noodzakelijk vóór livegang:**
1. **DPIA** (gegevensbeschermingseffectbeoordeling) — bij dit profiel vrijwel zeker verplicht
2. **Verwerkersovereenkomst** met elke hostingpartij en e-mailprovider
3. **Bewaartermijnen** in code afgedwongen (auto-anonimiseren van gesloten oproepen en slapende accounts)
4. **Rechten van betrokkenen** technisch geïmplementeerd: inzage, export, verwijdering — als knop, niet als e-mailprocedure
5. **Verwerkingsregister** en datalekprocedure

### 6.2 Data-migratie — het echte knelpunt

Je schreef: *"de inhoud & de data kunnen we later toevoegen via een back-up."* Hier moet ik eerlijk zijn: **dat is de meest risicovolle aanname in het plan.**

| Vraag | Waarom het uitmaakt |
|---|---|
| Krijgen jullie überhaupt een export, en in welk formaat? **[O]** | Contractueel recht op dataportabiliteit is niet vanzelfsprekend |
| Welke data is "lokaal" en welke is landelijk gedeeld bezit? **[O]** | De ID-reeks wijst op een gedeelde database; deelnemers zijn mogelijk NLvoorelkaar-accounts, niet Haarlemmermeer-accounts |
| Op welke grondslag mogen accounts mee? **[O]** | Gebruikers gaven toestemming aan NLvoorelkaar/VCH, niet aan een nieuw platform. Zonder nieuwe grondslag is overzetten niet toegestaan |
| Wachtwoorden | Hashes zijn in de praktijk nooit overdraagbaar. Reken op **verplichte wachtwoordreset voor iedereen** |

**Werkbare aanpak:** migreer *inhoud* (organisaties, categorieën, redactionele pagina's, geanonimiseerde statistiek) direct, en zet **deelnemers over via een heractivatiecampagne**: iedereen krijgt een uitnodiging om het account op het nieuwe platform te activeren. Reken op 30–60% conversie. Plan daaromheen een wervingscampagne. Dit is realistisch; stilzwijgend overzetten is dat niet.

### 6.3 Toegankelijkheid (WCAG)

Als het platform (mede) door de gemeente wordt gefinancierd of namens haar wordt aangeboden, geldt het **Tijdelijk besluit digitale toegankelijkheid overheid**: **WCAG 2.1 niveau AA** en een gepubliceerde **toegankelijkheidsverklaring** in het landelijke register **[A — afhankelijk van de juridische constructie, §9]**.

Dit is bij deze doelgroep hoe dan ook inhoudelijk verstandig: ouderen, mensen met een beperking en laaggeletterden zijn de kerngebruikers. Neem toegankelijkheid op als *definition of done* per feature, niet als eindcontrole — en zet `axe-core` in de CI-pijplijn.

### 6.4 Aanbesteding

Als de gemeente opdrachtgever is, kan er een **aanbestedingsplicht** gelden voor de opvolger van de huidige leverancier, ook bij eigen bouw met ingehuurde capaciteit **[O]**. Uitzoeken vóór opdrachtverlening.

---

## 7. Risico's

### 7.1 Verlies van netwerkeffect — het grootste risico
Het lokale platform profiteert nu van 200.000+ landelijke deelnemers, 70+ gekoppelde platforms en landelijke campagnes **[V]**. Een eigen platform start op nul instroom van buiten.
**Mitigatie:** heractivatiecampagne, lokale partnerwerving (scholen, sportclubs, kerken, moskeeën, wijkcentra), stevige lokale SEO, e-mailalerts op opgeslagen zoekopdrachten, en samenwerking met de gemeentelijke communicatiekanalen. Begroot hier tijd en geld voor — dit is geen IT-post.

### 7.2 Domeinnaam en merk **[O]**
Wie is houder van `haarlemmermeervoorelkaar.nl` bij SIDN? En mag de naam "…voorelkaar" gebruikt blijven worden buiten het NLvoorelkaar-netwerk (merkrecht)? **Als het antwoord "de leverancier" is, verandert dat het hele plan** — dan is er een nieuwe domeinnaam en merknaam nodig, plus een migratiecampagne. Dit is de eerste vraag die beantwoord moet worden.

### 7.3 SEO-continuïteit
Bestaande URL's (`/hulpvragen/{id}`, `/ons-aanbod`) zijn geïndexeerd. Zonder 301-redirectkaart verdampt de vindbaarheid. Alleen mogelijk als jullie het domein houden (§7.2).

### 7.4 Beheerlast wordt onderschat
Eigen beheer betekent zelf: moderatie, support, beveiligingsupdates, back-ups en herstel, e-mailreputatie, incidentafhandeling, en 's nachts bereikbaar zijn bij een storing. Reken op structureel **0,3–0,5 fte** naast de bouw. Dit is precies wat je nu inkoopt.

### 7.5 Continuïteit / bus-factor
Eén ontwikkelaar die het platform kent, is een risico voor een maatschappelijke voorziening. Documentatie, infrastructure-as-code en een tweede beheerder zijn vanaf dag één nodig.

---

## 8. Fasering en inschatting

Indicatief, exclusief campagne en contentmigratie.

| Fase | Inhoud | Doorlooptijd | Uren (indicatief) |
|---|---|---|---|
| **0. Fundament** | Contract- en data-exit uitzoeken, domein/merk, DPIA, ontwerpsysteem, technische opzet | 2–3 wk | 60–100 |
| **1. MVP** | Accounts, profielen, organisaties, oproepen (4 types), zoeken/filteren, reageren, berichten, e-mails, basis-admin | 8–10 wk | 320–450 |
| **2. Pariteit** | Moderatie/monitor, CMS (pagina's+menu), matchregistratie, toolbox, rapportage (Metabase), migratie-import | 5–7 wk | 220–320 |
| **3. Beter dan nu** | Zoekalerts, verbeterde matching, PWA/mobiel, WCAG-audit + herstel, pentest, koppelingen | 4–6 wk | 160–260 |
| | **Totaal tot volwaardige vervanging** | **~5–6 maanden** | **760–1.130 uur** |

Met AI-ondersteunde ontwikkeling en één tot twee mensen is het onderste deel van die bandbreedte haalbaar. Zonder een tweede persoon voor moderatie, content en campagne is het dat niet.

**Terugkerende kosten eigen beheer (indicatief):**
hosting €40–120/mnd · database (managed) €25–60/mnd · e-mail €0–25/mnd · foutmonitoring €0–26/mnd · domein €10/jr · jaarlijkse pentest €2.000–5.000 · WCAG-audit €1.500–3.500.
**Te vergelijken met de huidige jaarlijkse leverancierskosten — die zijn nog onbekend [O] en zijn nodig voor de business case.**

---

## 9. Wat ik nog nodig heb

### Meetronde (30 minuten, vanaf een gewone internetverbinding)
Deze audit is direct compleet te maken. Vanaf jouw eigen machine:

```bash
curl -sSI https://www.haarlemmermeervoorelkaar.nl/           # headers, server, CDN
curl -sS  https://www.haarlemmermeervoorelkaar.nl/robots.txt
curl -sS  https://www.haarlemmermeervoorelkaar.nl/sitemap.xml | head -50
whois haarlemmermeervoorelkaar.nl | grep -iE 'registrant|holder|reseller'
dig haarlemmermeervoorelkaar.nl ANY +noall +answer
```
Plus: pagina openen → rechtermuisknop → paginabron opslaan, en een Lighthouse-rapport (F12 → Lighthouse). Stuur die door, dan vul ik §2.3, §7.2 en §7.3 hard in.

### Op te vragen bij VCH / gemeente / leverancier
1. **Contract** met The Impact Dept: looptijd, einddatum, opzegtermijn, jaarlijkse kosten
2. **Verwerkersovereenkomst** + de exit-/dataportabiliteitsbepaling
3. **Wie is houder van de domeinnaam** en van het merk "Haarlemmermeervoorelkaar"
4. **Proefexport** van de data — welk formaat, welke velden, hoeveel records
5. **Huidige omvang:** aantal actieve deelnemers, organisaties, open oproepen, matches per jaar
6. Bestaat er een **toegankelijkheidsverklaring** en is die verplicht gesteld?
7. Geldt er een **aanbestedingsplicht** voor de vervanging?

### Vragen aan jou
- Wat is je mandaat: doe je dit namens VCH/de gemeente, of als eigen initiatief? Dat bepaalt of je bij de data en het contract kunt.
- Willen we één-op-één pariteit, of grijpen we de herbouw aan om het beter te maken (mobiel-first, betere matching, zoekalerts)?
- Wie doet straks moderatie, support en content — en met welk budget?
- Is er een deadline (bijvoorbeeld de contractafloop) waar we naartoe werken?

---

## 10. Conclusie

Technisch is dit een goed te herbouwen platform: een marktplaats met matching, moderatie en een CMS, zonder exotische techniek. Met een moderne stack is er binnen ongeveer vijf maanden een gelijkwaardig of beter product neer te zetten, met betere toegankelijkheid, betere matching en volledige controle over de data.

De echte vraag is niet of we het kunnen bouwen — dat kunnen we. De vraag is of we **de deelnemers, de data en de domeinnaam** kunnen meenemen. Zolang die drie punten open staan, is elke regel code een gok.

**Voorstel voor de eerstvolgende stap:** de meetronde uit §9 (30 minuten) en het opvragen van contract, verwerkersovereenkomst en domeinhouder. Zodra die binnen zijn, maak ik het definitieve migratieplan en kunnen we fase 0 starten.

---

*Bronnen: publieke pagina's van haarlemmermeervoorelkaar.nl en nlvoorelkaar.nl (via zoekindex), zakelijk.nlvoorelkaar.nl, theimpactdept.com, vchaarlemmermeer.nl, en de door de opdrachtgever aangeleverde screenshot van /beheer-wl/dashboard.*
