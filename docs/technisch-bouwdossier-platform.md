# Technisch bouwdossier
## Vrijwilligers- en burenhulpplatform Haarlemmermeer (werktitel)

**Versie:** 1.0 — 31 augustus 2026
**Vervolg op:** `technische-audit-haarlemmermeervoorelkaar.md`
**Doel:** alle informatie op één plek waarmee het platform gebouwd kan worden, zonder afhankelijkheid van de huidige leverancier.

---

## 0. Over dit document

Dit is geen adviesnota maar een **bouwspecificatie**. Alles wat hierin staat is bedoeld om direct omgezet te worden in code: het datamodel is uitvoerbare DDL, de user stories hebben acceptatiecriteria, de routes liggen vast, en de niet-functionele eisen zijn meetbaar gemaakt.

Waar de audit vragen openliet die het bouwen blokkeerden, zijn hier **beslissingen** genomen. Elke beslissing staat in §20 met de reden erbij, zodat je ze later kunt terugdraaien als de context verandert.

**Twee vaststaande uitgangspunten uit onze afstemming:**

1. **Eigen initiatief, geen mandaat.** We zijn niet afhankelijk van een export uit het bestaande platform, niet van hun domeinnaam en niet van hun merk. Het platform moet op eigen kracht kunnen starten. Datamigratie is uit de kritieke pad gehaald en verplaatst naar een optionele module (§19.5).
2. **Beter dan nu, niet één-op-één.** Functionele pariteit is de ondergrens, niet het doel. De verbeteringen zijn expliciet gemarkeerd met **[NIEUW]**.

---

## 1. Uitgangspunten en scope

### 1.1 Wat het platform doet

Eén digitale marktplaats waar inwoners, vrijwilligers en organisaties in de gemeente Haarlemmermeer elkaar vinden voor onbetaalde hulp en vrijwillige inzet.

Vier soorten oproepen op één plek:

| Type | Geplaatst door | Voorbeeld |
|---|---|---|
| **Hulpvraag** | Inwoner, naaste of professional | "Wie rijdt mij maandelijks naar het ziekenhuis in Hoofddorp?" |
| **Hulpaanbod** | Vrijwilliger | "Ik help graag met tuinonderhoud in Nieuw-Vennep" |
| **Vacature** | Organisatie | "Gastvrouw/gastheer buurtkamer, 4 uur per week" |
| **Activiteit** | Organisatie | "Workshop omgaan met dementie, 12 oktober" |

### 1.2 Wat het platform nadrukkelijk niet doet

Grenzen bewaken voorkomt scope creep. Buiten scope, ook in latere fases:

- Geen betalingen, geen vergoedingenadministratie, geen urenregistratie voor uitkeringen
- Geen VOG-aanvraag of screening — wel het *vastleggen* dat een organisatie erom vraagt
- Geen zorgdossier, geen cliëntsysteem, geen koppeling met een gemeentelijk zorgsysteem
- Geen chat in realtime — asynchrone berichten met e-mailnotificatie volstaan
- Geen native mobiele app — wel een installeerbare PWA (§19.4)

### 1.3 Uitgangspunten voor het ontwerp

1. **Privacy is de standaardstand.** Contactgegevens zijn nooit publiek. Publiek zichtbaar is uitsluitend voornaam, eerste letter achternaam en woonplaats of wijk — nooit een straat of huisnummer.
2. **Toegankelijk voor de doelgroep die het echt gebruikt.** Ouderen, mensen met een beperking, laaggeletterden en mensen met een smartphone als enige apparaat. WCAG 2.1 AA is een bouwvoorwaarde, geen eindcontrole.
3. **Werkt zonder JavaScript voor de kernpaden.** Zoeken, bladeren en een oproep lezen moeten werken bij trage verbindingen en oude browsers. JavaScript verbetert, maar is geen voorwaarde.
4. **Mobiel eerst.** Ontwerp op 360 px breed, verrijk daarna.
5. **Nederlands, B1-taalniveau.** Geen jargon in de interface.
6. **Alles wat een beheerder kan, is te herleiden.** Elke ingreep op andermans gegevens komt in een auditlog.

---

## 2. Gebruikers, rollen en rechten

### 2.1 Rollen

| Rol | Code | Omschrijving |
|---|---|---|
| Bezoeker | `guest` | Niet ingelogd |
| Deelnemer | `member` | Ingelogd particulier; kan zowel hulp vragen als aanbieden |
| Organisatielid | `org_member` | Deelnemer die aan een organisatie is gekoppeld |
| Organisatiebeheerder | `org_admin` | Beheert organisatieprofiel en leden |
| Professional | `professional` | Geverifieerde beroepskracht; mag namens een cliënt plaatsen |
| Moderator | `moderator` | Monitort reacties en meldingen, kan verbergen en waarschuwen |
| Redacteur | `editor` | Beheert pagina's, menu en artikelen |
| Beheerder | `admin` | Alles, inclusief rollen toekennen en instellingen |

Rollen zijn **cumulatief per gebruiker** (een array), niet exclusief. Iemand kan tegelijk `member`, `org_admin` en `moderator` zijn.

### 2.2 Rechtenmatrix

Legenda: ✓ = mag · ● = alleen eigen · ○ = alleen binnen eigen organisatie · – = niet

| Actie | guest | member | org_admin | professional | moderator | editor | admin |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| Oproepen bekijken | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Contactgegevens zien | – | – | – | – | ✓ | – | ✓ |
| Oproep plaatsen | – | ● | ○ | ● + cliënt | ● | ● | ✓ |
| Oproep bewerken/sluiten | – | ● | ○ | ● | ✓ | – | ✓ |
| Reageren op oproep | – | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Bericht sturen | – | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Match registreren | – | ● | ○ | ● | ✓ | – | ✓ |
| Organisatieprofiel beheren | – | – | ○ | – | – | – | ✓ |
| Reactie verbergen | – | – | – | – | ✓ | – | ✓ |
| Melding afhandelen | – | – | – | – | ✓ | – | ✓ |
| Account blokkeren | – | – | – | – | – | – | ✓ |
| Pagina's en menu beheren | – | – | – | – | – | ✓ | ✓ |
| Rollen toekennen | – | – | – | – | – | – | ✓ |
| Auditlog inzien | – | – | – | – | – | – | ✓ |

**Harde regel:** `moderator` mag contactgegevens inzien omdat dat nodig is bij een misbruikmelding, maar elke inzage wordt gelogd in `audit_log` met reden. Dit is een AVG-vereiste, geen optie.

---

## 3. Functionele specificatie

Format: `ID · titel` gevolgd door de story en toetsbare acceptatiecriteria (AC).

### E1 — Account en profiel

**E1.1 Registreren met e-mail**
> Als bezoeker wil ik een account aanmaken met mijn e-mailadres, zodat ik kan reageren en plaatsen.

- AC1: Formulier vraagt om e-mail, wachtwoord, voornaam, achternaam, postcode, geboortejaar en akkoord op voorwaarden.
- AC2: Wachtwoord minimaal 12 tekens; gecontroleerd tegen de lijst met veelgebruikte wachtwoorden (zxcvbn-score ≥ 3). Geen samenstellingseisen met hoofdletters en tekens — die verlagen de veiligheid in de praktijk.
- AC3: Account is inactief tot het e-mailadres is bevestigd via een link die 24 uur geldig is.
- AC4: Onder de 16 jaar is registratie niet mogelijk; de melding legt uit waarom en verwijst naar een ouder of begeleider.
- AC5: Akkoord op voorwaarden en privacyverklaring wordt vastgelegd in `consents` mét versienummer en tijdstip.

**E1.2 Inloggen met Google** — als alternatief op wachtwoord; koppelt op geverifieerd e-mailadres aan een bestaand account.

**E1.3 Wachtwoord vergeten** — resetlink 60 minuten geldig, eenmalig bruikbaar, oude sessies worden ingetrokken.

**E1.4 Profiel invullen**
> Als deelnemer wil ik vertellen wat ik kan en wil doen, zodat passende oproepen mij bereiken.

- AC1: Velden: over mij, categorieën van interesse, beschikbaarheid (dagdelen), maximale reisafstand in km, talen, rijbewijs/auto, ervaring.
- AC2: De profielpagina toont een voortgangsindicator; een profiel onder 60% ingevuld krijgt een zachte herinnering, geen blokkade.
- AC3: Publiek zichtbaar is uitsluitend: voornaam, eerste letter achternaam, woonplaats, over-mij-tekst, categorieën, foto (optioneel).

**E1.5 Tweestapsverificatie [NIEUW]** — TOTP, verplicht voor `admin` en `moderator`, optioneel voor de rest.

**E1.6 Account verwijderen [NIEUW]**
- AC1: Zelfbediening vanuit instellingen; verwijderen kan zonder e-mail of telefoontje.
- AC2: Verwijderen anonimiseert het account onmiddellijk en zet gesloten oproepen om naar "verwijderde gebruiker"; berichten aan anderen blijven bestaan met geanonimiseerde afzender, omdat de ontvanger recht heeft op zijn eigen correspondentie.
- AC3: Er is een export-knop die alle eigen gegevens als JSON en CSV levert (AVG art. 20).

### E2 — Organisaties

**E2.1 Organisatie aanmelden**
- AC1: Naam, omschrijving, KvK-nummer (optioneel), website, e-mail, telefoon, bezoekadres, type, logo.
- AC2: Nieuwe organisaties komen in status `in_review`; pas na goedkeuring door een beheerder zijn ze publiek en mogen ze plaatsen.
- AC3: De aanmelder wordt automatisch `org_admin`.

**E2.2 Leden beheren** — `org_admin` nodigt uit per e-mail; uitnodiging 14 dagen geldig; een organisatie moet altijd minstens één `org_admin` houden.

**E2.3 Organisatiepagina** — publiek profiel met alle open vacatures en activiteiten van die organisatie.

### E3 — Oproepen plaatsen

**E3.1 Plaatsingswizard**
> Als gebruiker wil ik in een paar duidelijke stappen een oproep plaatsen, zonder te verdwalen in een lang formulier.

- AC1: Stap 1 kiest het type. Stap 2 titel en omschrijving. Stap 3 categorieën. Stap 4 locatie en tijd. Stap 5 controle en plaatsen.
- AC2: Elke stap slaat op als concept; afhaken en later verdergaan is mogelijk.
- AC3: Titel 10–100 tekens, omschrijving 30–4.000 tekens. De validatiemelding zegt wat er mis is en hoe het goed moet.
- AC4: Minimaal één en maximaal vijf categorieën.
- AC5: Locatie via postcode; opgeslagen wordt het geocodeerde punt van het **PC4-gebied**, nooit het exacte adres.
- AC6: Een oproep krijgt automatisch `expires_at` op 90 dagen na publicatie.
- AC7: Bij plaatsen wordt de tekst door de moderatiecontrole gehaald (§10.2). Bij een treffer gaat de oproep naar de wachtrij in plaats van direct live.

**E3.2 Namens een ander plaatsen**
- AC1: Keuze uit: voor mezelf · voor een naaste · voor een cliënt (alleen `professional`).
- AC2: Bij "voor een cliënt" wordt vastgelegd dat de professional verklaart toestemming te hebben; die verklaring komt met tijdstip in het auditlog.
- AC3: Namen van cliënten worden nooit in een publiek veld gevraagd. Het formulier waarschuwt hier expliciet voor bij de omschrijving.

**E3.3 Oproep beheren** — bewerken, pauzeren, verlengen, sluiten. Bij sluiten wordt gevraagd: match gevonden via het platform / buiten het platform / geen match. Dit voedt de rapportage.

**E3.4 Automatisch verlopen** — 7 dagen voor `expires_at` gaat er een herinnering uit met één klik verlengen; op de datum zelf gaat de status naar `verlopen` en verdwijnt de oproep uit de zoekresultaten.

### E4 — Zoeken en vinden

**E4.1 Overzicht met filters**
- AC1: Filters: type, categorie, wijk of kern, afstand tot mijn postcode, tijdsindicatie, alleen organisaties, alleen nieuw deze week.
- AC2: Filterstatus staat in de URL, zodat een zoekopdracht deelbaar en bookmarkbaar is.
- AC3: Werkt volledig zonder JavaScript (formulier met GET); met JavaScript ververst het resultaat zonder paginasprong.
- AC4: Standaardsortering is relevantie; alternatieven zijn nieuwste eerst en dichtstbij.
- AC5: Bij nul resultaten toont de pagina de dichtstbijzijnde alternatieven in plaats van een lege staat.

**E4.2 Vrij zoeken** — Nederlandse full-text search over titel en omschrijving, met tolerantie voor typefouten via trigram-overeenkomst.

**E4.3 Kaartweergave [NIEUW]** — oproepen op een kaart op PC4-niveau; nooit exacte adressen. Kaartlagen van een Europese aanbieder of zelfgehoste tegels.

**E4.4 Opgeslagen zoekopdracht met e-mailalert [NIEUW]**
> Als vrijwilliger wil ik gemaild worden zodra er iets nieuws is dat bij mij past, zodat ik niet elke week hoef te kijken.

- AC1: Elke zoekopdracht is op te slaan met een naam en een frequentie: direct, dagelijks of wekelijks.
- AC2: De e-mail bevat maximaal 10 nieuwe treffers en een afmeldlink die zonder inloggen werkt.
- AC3: Geen treffers betekent geen e-mail.
- AC4: Maximaal 10 opgeslagen zoekopdrachten per gebruiker.

### E5 — Reageren en matchen

**E5.1 Reageren op een oproep**
- AC1: Alleen voor ingelogde gebruikers; een niet-ingelogde bezoeker wordt na inloggen teruggebracht naar dezelfde oproep met zijn tekst bewaard.
- AC2: Een reactie bevat een bericht van minimaal 20 tekens. Leeg of "hoi" reageren wordt tegengehouden met uitleg.
- AC3: Dezelfde gebruiker kan één keer reageren op dezelfde oproep.
- AC4: De plaatser krijgt direct een e-mail en een melding in het platform.
- AC5: De plaatser kan een reactie accepteren of vriendelijk afwijzen; bij afwijzen is er een standaardtekst die aanpasbaar is.

**E5.2 Reacties bewaken (monitor)** — zie §10.

**E5.3 Match registreren**
- AC1: Bij accepteren van een reactie wordt automatisch een `match` aangemaakt.
- AC2: Bij sluiten van een oproep kan alsnog handmatig een match worden geregistreerd, ook buiten het platform om.
- AC3: Zes weken na een match gaat er één vervolgvraag uit: is het gelukt, en hoeveel uur ongeveer? Antwoorden is vrijwillig en met één klik. **[NIEUW]** Dit levert de impactcijfers waar een gemeente om vraagt.

### E6 — Berichten

**E6.1 Gesprek voeren**
- AC1: Een gesprek hangt altijd aan een oproep, zodat de context duidelijk is.
- AC2: Berichten zijn platte tekst met automatisch herkende links; geen HTML, geen bijlagen in fase 1.
- AC3: Een nieuw bericht levert een e-mailnotificatie op, met een instelbare samenvattingsfrequentie.
- AC4: Contactgegevens die in een bericht worden getypt zijn toegestaan — dat is juist het doel — maar het systeem toont eenmalig een waarschuwing bij de eerste keer dat een gebruiker een telefoonnummer of adres deelt.
- AC5: Blokkeren van een gebruiker sluit het gesprek en voorkomt nieuwe gesprekken tussen die twee. **[NIEUW]**

### E7 — Meldingen en veiligheid van de community

**E7.1 Melden** — elke oproep, elk profiel en elk bericht heeft een meldknop met redenen: ongepast, oplichting, verkeerde plek, onveilige situatie, anders.
**E7.2 Afhandelen** — meldingen komen in de moderatiewachtrij met SLA-indicatie (§10.3).
**E7.3 Blokkeren** — een beheerder kan een account blokkeren; alle actieve oproepen gaan uit de lucht, lopende gesprekken worden gesloten.

### E8 — Beheeromgeving

Pariteit met wat je nu hebt, plus wat ontbreekt.

- **E8.1 Dashboard** — openstaande moderatie, nieuwe organisaties, oproepen die verlopen, matches deze maand.
- **E8.2 Deelnemers** — zoeken, filteren op rol en status, detail met activiteit, rollen toekennen, blokkeren, exporteren.
- **E8.3 Organisaties** — goedkeuren, bewerken, samenvoegen bij dubbelingen. **[NIEUW]**
- **E8.4 Oproepen** — alle types, bulkacties, handmatig verlengen of sluiten.
- **E8.5 Reacties monitoren** — zie §10.
- **E8.6 Matches** — overzicht en export.
- **E8.7 Categorieënbeheer** — boomstructuur, hernoemen, samenvoegen, verbergen. Nooit hard verwijderen zolang er oproepen aan hangen.
- **E8.8 Pagina's en menu** — CMS, zie §14.3.
- **E8.9 E-mailteksten** — alle sjablonen aanpasbaar zonder deploy. **[NIEUW]**
- **E8.10 Instellingen** — huisstijl, logo, gemeentegrens, standaard straal, minimumleeftijd, bewaartermijnen.
- **E8.11 Rapportage** — zie §14.5.
- **E8.12 Auditlog** — doorzoekbaar, exporteerbaar, niet wijzigbaar.

### E9 — Redactionele content

Pagina's met blokken, nieuws- en inspiratieartikelen, kennisbank (toolbox) met categorieën, veelgestelde vragen. Volledig in eigen beheer — geen externe kennisbank meer.

---

## 4. Informatiearchitectuur

### 4.1 URL-schema

```
PUBLIEK
/                                    homepage
/hulpvragen                          overzicht (filters in querystring)
/hulpvragen/{id}-{slug}              detail
/vacatures                           /vacatures/{id}-{slug}
/activiteiten                        /activiteiten/{id}-{slug}
/vrijwilligers                       /vrijwilligers/{id}-{slug}
/organisaties                        /organisaties/{slug}
/zoeken                              alle types gecombineerd
/kaart                               kaartweergave
/hoe-het-werkt
/veelgestelde-vragen
/kennisbank                          /kennisbank/{categorie}/{slug}
/nieuws                              /nieuws/{slug}
/{slug}                              vrije CMS-pagina
/voorwaarden  /privacy  /toegankelijkheid  /cookies

AUTHENTICATIE
/inloggen  /registreren  /wachtwoord-vergeten  /wachtwoord-herstellen
/e-mail-bevestigen

DEELNEMER
/plaatsen                            keuze type
/plaatsen/{type}                     wizard
/account                             dashboard
/account/oproepen  /account/reacties  /account/berichten
/account/zoekopdrachten  /account/profiel  /account/instellingen
/account/gegevens                    export en verwijderen

ORGANISATIE
/organisatie/{slug}/beheer           profiel, leden, oproepen

BEHEER
/beheer                              dashboard
/beheer/deelnemers  /beheer/organisaties  /beheer/oproepen
/beheer/reacties  /beheer/meldingen  /beheer/matches
/beheer/categorieen  /beheer/emails  /beheer/instellingen
/beheer/auditlog
/cms                                 redactieomgeving (Payload)
```

**URL-regel:** `{id}-{slug}` betekent dat het ID leidend is en de slug cosmetisch. Verandert de titel, dan blijft de oude URL werken — geen kapotte links, geen redirectkaart nodig.

### 4.2 Navigatie

Hoofdmenu maximaal zeven items, beheerbaar in het CMS. Vaste elementen die niet uit het menu kunnen verdwijnen: "Plaats een oproep" als primaire knop, en inloggen/account rechts.

---

## 5. Schermen en kernflows

### 5.1 Kernflow: hulp vragen

```
homepage → "Ik zoek hulp" → wizard stap 1..5 → bevestiging
   → e-mail "je oproep staat online" (of: "we kijken er even naar" bij moderatie)
   → reacties binnen → accepteren → gesprek → match registreren
   → na 6 weken: één vraag over het resultaat
```

### 5.2 Kernflow: helpen

```
homepage of /hulpvragen → filteren → oproep openen → "Ik wil helpen"
   → (inloggen indien nodig, tekst blijft bewaard) → reactie versturen
   → gesprek → match
   → suggestie: "Bewaar deze zoekopdracht en krijg een mail bij nieuwe oproepen"
```

### 5.3 Schermen die per se goed moeten zijn

| Scherm | Waarom kritisch |
|---|---|
| Overzicht met filters | Hier haakt de meerderheid af als het traag of onduidelijk is |
| Detailpagina oproep | Bepaalt of iemand reageert. Duidelijk wie, wat, waar, hoe vaak, en één prominente knop |
| Plaatsingswizard | De grootste bron van afhakers. Per stap één vraag, altijd terug kunnen |
| Moderatiewachtrij | Bepaalt hoeveel beheertijd het platform kost |

---

## 6. Datamodel

PostgreSQL 16 met PostGIS. Onderstaande DDL is bedoeld om uit te voeren, niet om te lezen als schets.

### 6.1 Extensies en enums

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_status     AS ENUM ('pending','active','suspended','deleted');
CREATE TYPE listing_type    AS ENUM ('hulpvraag','hulpaanbod','vacature','activiteit');
CREATE TYPE listing_status  AS ENUM ('concept','in_review','actief','gepauzeerd','gesloten','verlopen','verwijderd');
CREATE TYPE on_behalf_of    AS ENUM ('zelf','naaste','client');
CREATE TYPE response_status AS ENUM ('nieuw','geaccepteerd','afgewezen','ingetrokken','verborgen');
CREATE TYPE match_source    AS ENUM ('platform','buiten_platform');
CREATE TYPE org_status      AS ENUM ('in_review','actief','inactief','geweigerd');
CREATE TYPE report_status   AS ENUM ('open','in_behandeling','afgehandeld','afgewezen');
CREATE TYPE alert_frequency AS ENUM ('direct','dagelijks','wekelijks','uit');
```

### 6.2 Gebruikers

```sql
CREATE TABLE users (
  id                bigserial PRIMARY KEY,
  email             citext UNIQUE NOT NULL,
  password_hash     text,                          -- null bij alleen-OAuth
  email_verified_at timestamptz,
  first_name        text NOT NULL,
  last_name         text NOT NULL,
  display_name      text GENERATED ALWAYS AS
                      (first_name || ' ' || left(last_name,1) || '.') STORED,
  phone             text,
  street            text,
  house_number      text,
  postcode          char(6),                       -- 1234AB
  pc4               char(4) GENERATED ALWAYS AS (left(postcode,4)) STORED,
  city              text,
  district          text,                          -- kern/wijk
  geo               geography(Point,4326),         -- PC4-centroide, nooit huisadres
  birth_year        smallint,
  bio               text,
  avatar_path       text,
  languages         text[] DEFAULT '{nl}',
  has_car           boolean DEFAULT false,
  availability      jsonb DEFAULT '{}'::jsonb,     -- {"ma":["ochtend"],...}
  max_travel_km     smallint DEFAULT 10,
  roles             text[] NOT NULL DEFAULT '{member}',
  status            user_status NOT NULL DEFAULT 'pending',
  totp_secret       text,
  notify_frequency  alert_frequency NOT NULL DEFAULT 'direct',
  last_login_at     timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  anonymised_at     timestamptz,
  CONSTRAINT users_birth_year_chk CHECK (birth_year IS NULL OR birth_year BETWEEN 1900 AND 2100)
);
CREATE INDEX users_geo_idx    ON users USING gist (geo);
CREATE INDEX users_roles_idx  ON users USING gin (roles);
CREATE INDEX users_status_idx ON users (status) WHERE status = 'active';

CREATE TABLE oauth_accounts (
  id            bigserial PRIMARY KEY,
  user_id       bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider      text NOT NULL,
  provider_uid  text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_uid)
);

CREATE TABLE sessions (
  id          text PRIMARY KEY,
  user_id     bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at  timestamptz NOT NULL,
  ip          inet,
  user_agent  text,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX sessions_user_idx ON sessions (user_id);

CREATE TABLE consents (
  id          bigserial PRIMARY KEY,
  user_id     bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document    text NOT NULL,           -- 'voorwaarden' | 'privacy'
  version     text NOT NULL,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  ip          inet
);

CREATE TABLE user_blocks (
  blocker_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id),
  CONSTRAINT no_self_block CHECK (blocker_id <> blocked_id)
);
```

### 6.3 Organisaties

```sql
CREATE TABLE organisations (
  id          bigserial PRIMARY KEY,
  slug        text UNIQUE NOT NULL,
  name        text NOT NULL,
  kvk         char(8),
  description text,
  website     text,
  email       citext,
  phone       text,
  street      text,
  postcode    char(6),
  city        text,
  geo         geography(Point,4326),
  org_type    text,
  logo_path   text,
  status      org_status NOT NULL DEFAULT 'in_review',
  verified_at timestamptz,
  created_by  bigint REFERENCES users(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX organisations_status_idx ON organisations (status);

CREATE TABLE organisation_members (
  organisation_id bigint NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  user_id         bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role            text NOT NULL DEFAULT 'org_member',  -- org_member | org_admin
  invited_at      timestamptz,
  accepted_at     timestamptz,
  PRIMARY KEY (organisation_id, user_id)
);
```

### 6.4 Oproepen

```sql
CREATE TABLE categories (
  id         bigserial PRIMARY KEY,
  parent_id  bigint REFERENCES categories(id) ON DELETE RESTRICT,
  name       text NOT NULL,
  slug       text UNIQUE NOT NULL,
  icon       text,
  sort_order smallint NOT NULL DEFAULT 0,
  is_active  boolean NOT NULL DEFAULT true
);

CREATE TABLE listings (
  id                bigserial PRIMARY KEY,
  type              listing_type NOT NULL,
  slug              text NOT NULL,
  title             text NOT NULL,
  description       text NOT NULL,
  owner_user_id     bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organisation_id   bigint REFERENCES organisations(id) ON DELETE SET NULL,
  on_behalf_of_type on_behalf_of NOT NULL DEFAULT 'zelf',
  postcode          char(6),
  pc4               char(4),
  district          text,
  geo               geography(Point,4326),
  is_remote         boolean NOT NULL DEFAULT false,
  time_indication   text,                       -- 'eenmalig','wekelijks','in overleg'
  hours_per_week    numeric(4,1),
  starts_at         timestamptz,                -- activiteiten
  ends_at           timestamptz,
  requires_vog      boolean NOT NULL DEFAULT false,
  min_age           smallint,
  status            listing_status NOT NULL DEFAULT 'concept',
  published_at      timestamptz,
  expires_at        timestamptz,
  closed_at         timestamptz,
  close_reason      text,
  view_count        integer NOT NULL DEFAULT 0,
  response_count    integer NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  search_vector     tsvector GENERATED ALWAYS AS (
                      setweight(to_tsvector('dutch', coalesce(title,'')),'A') ||
                      setweight(to_tsvector('dutch', coalesce(description,'')),'B')
                    ) STORED,
  CONSTRAINT listings_title_len CHECK (char_length(title) BETWEEN 10 AND 100),
  CONSTRAINT listings_desc_len  CHECK (char_length(description) BETWEEN 30 AND 4000),
  CONSTRAINT listings_org_req   CHECK (type NOT IN ('vacature','activiteit') OR organisation_id IS NOT NULL)
);
CREATE INDEX listings_search_idx  ON listings USING gin (search_vector);
CREATE INDEX listings_trgm_idx    ON listings USING gin (title gin_trgm_ops);
CREATE INDEX listings_geo_idx     ON listings USING gist (geo);
CREATE INDEX listings_live_idx    ON listings (type, published_at DESC)
                                    WHERE status = 'actief';
CREATE INDEX listings_expiry_idx  ON listings (expires_at) WHERE status = 'actief';
CREATE INDEX listings_owner_idx   ON listings (owner_user_id);

CREATE TABLE listing_categories (
  listing_id  bigint NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  category_id bigint NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  PRIMARY KEY (listing_id, category_id)
);
CREATE INDEX listing_categories_cat_idx ON listing_categories (category_id);
```

### 6.5 Reacties, matches, berichten

```sql
CREATE TABLE responses (
  id            bigserial PRIMARY KEY,
  listing_id    bigint NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  from_user_id  bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message       text NOT NULL,
  status        response_status NOT NULL DEFAULT 'nieuw',
  flagged       boolean NOT NULL DEFAULT false,
  flag_reason   text,
  reviewed_by   bigint REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at   timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (listing_id, from_user_id),
  CONSTRAINT responses_msg_len CHECK (char_length(message) >= 20)
);
CREATE INDEX responses_queue_idx ON responses (created_at)
  WHERE flagged = true AND reviewed_at IS NULL;

CREATE TABLE matches (
  id                bigserial PRIMARY KEY,
  listing_id        bigint NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  response_id       bigint REFERENCES responses(id) ON DELETE SET NULL,
  helper_user_id    bigint REFERENCES users(id) ON DELETE SET NULL,
  requester_user_id bigint REFERENCES users(id) ON DELETE SET NULL,
  source            match_source NOT NULL DEFAULT 'platform',
  matched_at        timestamptz NOT NULL DEFAULT now(),
  reported_by       bigint REFERENCES users(id) ON DELETE SET NULL,
  followup_sent_at  timestamptz,
  outcome           text,                    -- 'gelukt','niet_gelukt','loopt_nog'
  hours_estimate    numeric(6,1)
);
CREATE INDEX matches_listing_idx ON matches (listing_id);
CREATE INDEX matches_date_idx    ON matches (matched_at);

CREATE TABLE conversations (
  id          bigserial PRIMARY KEY,
  listing_id  bigint REFERENCES listings(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  closed_at   timestamptz
);

CREATE TABLE conversation_participants (
  conversation_id bigint NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id         bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_read_at    timestamptz,
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE messages (
  id              bigserial PRIMARY KEY,
  conversation_id bigint NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_user_id  bigint REFERENCES users(id) ON DELETE SET NULL,
  body            text NOT NULL,
  hidden_at       timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX messages_conv_idx ON messages (conversation_id, created_at);
```

### 6.6 Moderatie, meldingen, audit

```sql
CREATE TABLE reports (
  id             bigserial PRIMARY KEY,
  target_type    text NOT NULL,          -- 'listing','user','message','response'
  target_id      bigint NOT NULL,
  reporter_id    bigint REFERENCES users(id) ON DELETE SET NULL,
  reason         text NOT NULL,
  details        text,
  status         report_status NOT NULL DEFAULT 'open',
  handled_by     bigint REFERENCES users(id) ON DELETE SET NULL,
  handled_at     timestamptz,
  resolution     text,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX reports_open_idx ON reports (created_at) WHERE status = 'open';

CREATE TABLE audit_log (
  id           bigserial PRIMARY KEY,
  actor_id     bigint REFERENCES users(id) ON DELETE SET NULL,
  action       text NOT NULL,           -- 'user.view_contact','listing.hide',...
  target_type  text,
  target_id    bigint,
  reason       text,
  diff         jsonb,
  ip           inet,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_actor_idx  ON audit_log (actor_id, created_at DESC);
CREATE INDEX audit_target_idx ON audit_log (target_type, target_id);
REVOKE UPDATE, DELETE ON audit_log FROM PUBLIC;
```

### 6.7 Notificaties, zoekopdrachten, e-mail

```sql
CREATE TABLE saved_searches (
  id          bigserial PRIMARY KEY,
  user_id     bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  criteria    jsonb NOT NULL,
  frequency   alert_frequency NOT NULL DEFAULT 'wekelijks',
  last_run_at timestamptz,
  token       text NOT NULL DEFAULT encode(gen_random_bytes(24),'hex'), -- afmelden zonder inlog
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE notifications (
  id          bigserial PRIMARY KEY,
  user_id     bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        text NOT NULL,
  payload     jsonb NOT NULL DEFAULT '{}'::jsonb,
  read_at     timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX notifications_unread_idx ON notifications (user_id, created_at DESC)
  WHERE read_at IS NULL;

CREATE TABLE email_templates (
  key         text PRIMARY KEY,
  subject     text NOT NULL,
  body_md     text NOT NULL,
  updated_by  bigint REFERENCES users(id) ON DELETE SET NULL,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE email_log (
  id            bigserial PRIMARY KEY,
  to_email      citext NOT NULL,
  template_key  text,
  provider_id   text,
  status        text NOT NULL DEFAULT 'queued',
  error         text,
  sent_at       timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE settings (
  key         text PRIMARY KEY,
  value       jsonb NOT NULL,
  updated_at  timestamptz NOT NULL DEFAULT now()
);
```

### 6.8 Ontwerpbeslissingen in het model

1. **Eén `listings`-tabel met `type`.** Zoeken, modereren en rapporteren werken in één query over alle types. De verschillen tussen types zijn een handvol nullable kolommen plus een CHECK-constraint — goedkoper dan vier tabellen met vier keer dezelfde logica.
2. **Nooit exacte adressen in `geo`.** Zowel bij gebruikers als oproepen wordt de PC4-centroïde opgeslagen. Afstandsberekening op wijkniveau is nauwkeurig genoeg en het lek is daarmee bij de bron gedicht.
3. **`display_name` als generated column.** "Mustapha E." wordt door de database afgedwongen, niet door de frontend. Een fout in een template kan de achternaam niet lekken.
4. **`search_vector` als stored generated column.** Geen triggers die vergeten worden bij een bulk-import.
5. **`audit_log` zonder UPDATE- en DELETE-rechten.** Verantwoording moet onwijzigbaar zijn, ook voor jezelf.
6. **Tellers (`response_count`, `view_count`) gedenormaliseerd.** Overzichtspagina's mogen geen count-subquery per rij doen.

---

## 7. Matching en zoeken

### 7.1 Relevantiescore

De hoofdquery voor een gefilterd overzicht, inclusief scoring:

```sql
SELECT l.*,
       (  3.0 * cat_overlap
        + 2.0 * GREATEST(0, 1 - (dist_m / (:radius_km * 1000.0)))
        + 1.0 * COALESCE(text_rank, 0)
        + 0.5 * recency
       ) AS score
FROM (
  SELECT l.*,
    (SELECT count(*) FROM listing_categories lc
      WHERE lc.listing_id = l.id AND lc.category_id = ANY(:category_ids))::numeric
      / NULLIF(array_length(:category_ids,1),0)          AS cat_overlap,
    ST_Distance(l.geo, :user_geo)                        AS dist_m,
    ts_rank(l.search_vector, websearch_to_tsquery('dutch', :q)) AS text_rank,
    exp(-extract(epoch from (now() - l.published_at)) / 1209600.0) AS recency  -- halfwaarde 14 dgn
  FROM listings l
  WHERE l.status = 'actief'
    AND l.type = ANY(:types)
    AND (:q = '' OR l.search_vector @@ websearch_to_tsquery('dutch', :q))
    AND (:user_geo IS NULL OR ST_DWithin(l.geo, :user_geo, :radius_km * 1000))
) l
ORDER BY score DESC, published_at DESC
LIMIT :limit OFFSET :offset;
```

**Waarom deze weging:** categorie weegt het zwaarst omdat dat de enige expliciete intentie is die beide partijen hebben opgegeven. Afstand telt daarna, want burenhulp is per definitie lokaal. Tekst en actualiteit corrigeren aan de randen. De halfwaardetijd van veertien dagen zorgt dat oude oproepen zakken zonder te verdwijnen.

### 7.2 Suggesties bij nul resultaten

Bij geen treffers wordt de query herhaald met achtereenvolgens: straal verdubbeld, dan categoriefilter losgelaten, dan tekstfilter losgelaten. De pagina zegt expliciet wat er is losgelaten — "geen resultaten binnen 5 km, dit vonden we binnen 10 km".

### 7.3 Zoekalerts

Een achtergrondtaak draait per frequentie, voert per opgeslagen zoekopdracht dezelfde query uit met `published_at > last_run_at`, en verstuurt alleen bij treffers. `last_run_at` wordt pas bijgewerkt na succesvolle verzending, zodat een storing geen oproepen laat missen.

---

## 8. API- en route-ontwerp

De applicatie is server-rendered; de meeste interacties lopen via Server Actions en gewone formulieren. Een JSON-API bestaat alleen waar die echt nodig is.

### 8.1 Server Actions (geen publieke API)

```
auth.register · auth.login · auth.logout · auth.requestReset · auth.resetPassword
profile.update · profile.export · profile.delete
org.create · org.update · org.invite · org.removeMember
listing.saveDraft · listing.publish · listing.update · listing.close · listing.extend
response.create · response.accept · response.reject
message.send · conversation.markRead
match.register · match.followup
report.create
savedSearch.create · savedSearch.delete · savedSearch.unsubscribe
admin.* (afzonderlijk beveiligd, altijd met auditlog)
```

### 8.2 JSON-endpoints

```
GET  /api/zoeken            gebruikt door de filterbalk voor live verversen
GET  /api/kaart             geclusterde punten op PC4-niveau
GET  /api/categorieen       boomstructuur, sterk gecachet
POST /api/webhooks/email    bounce- en klachtverwerking van de mailprovider
GET  /api/health            liveness en readiness
GET  /sitemap.xml           dynamisch, gepagineerd per 5.000
GET  /rss/oproepen.xml      [NIEUW] feed per categorie of wijk, voor partners
```

**Regel:** elk endpoint dat gegevens teruggeeft over personen filtert velden op de server, op basis van de rol van de aanvrager. Er wordt nooit een volledig gebruikersobject naar de client gestuurd met de bedoeling het daar te verbergen.

### 8.3 Achtergrondtaken

Met `pg-boss` op dezelfde Postgres — geen extra Redis nodig.

| Taak | Frequentie | Wat |
|---|---|---|
| `listings.expire` | elk uur | Status naar `verlopen` op `expires_at` |
| `listings.expiry-warning` | dagelijks 09:00 | Herinnering 7 dagen voor verlopen |
| `alerts.direct` | elke 15 min | Directe zoekalerts |
| `alerts.daily` | dagelijks 08:00 | Dagelijkse digest |
| `alerts.weekly` | maandag 08:00 | Wekelijkse digest |
| `matches.followup` | dagelijks | Vervolgvraag 6 weken na match |
| `retention.anonymise` | wekelijks | Bewaartermijnen uitvoeren (§12.3) |
| `backup.verify` | dagelijks | Laatste back-up herstellen naar wegwerpdatabase en tellen |
| `search.reindex` | wekelijks | `VACUUM ANALYZE` en indexonderhoud |

---

## 9. Notificaties en e-mail

### 9.1 Sjabloonmatrix

| Sleutel | Trigger | Ontvanger | In-app |
|---|---|---|---|
| `auth.verify` | Registratie | Nieuwe gebruiker | – |
| `auth.reset` | Wachtwoord vergeten | Gebruiker | – |
| `auth.new_device` | Login vanaf onbekend apparaat | Gebruiker | ✓ |
| `listing.published` | Oproep live | Plaatser | ✓ |
| `listing.in_review` | Oproep naar moderatie | Plaatser | ✓ |
| `listing.expiring` | 7 dagen voor verlopen | Plaatser | ✓ |
| `listing.expired` | Verlopen | Plaatser | ✓ |
| `response.received` | Nieuwe reactie | Plaatser | ✓ |
| `response.accepted` | Reactie geaccepteerd | Reageerder | ✓ |
| `response.rejected` | Reactie afgewezen | Reageerder | ✓ |
| `message.received` | Nieuw bericht | Ontvanger | ✓ |
| `alert.matches` | Zoekalert | Abonnee | – |
| `match.followup` | 6 weken na match | Beide | ✓ |
| `org.invited` | Uitnodiging organisatie | Genodigde | – |
| `org.approved` | Organisatie goedgekeurd | Aanmelder | ✓ |
| `report.received` | Nieuwe melding | Moderatoren | ✓ |
| `admin.digest` | Dagelijks | Beheerders | – |

### 9.2 Eisen aan e-mail

- Elke sjabloon in `email_templates`, aanpasbaar in het beheer zonder deploy, met variabelen tussen accolades.
- Zowel HTML als platte tekst; de plattetekstversie moet zelfstandig leesbaar zijn.
- Afmeldlink in elke niet-transactionele mail, werkend zonder inloggen via `saved_searches.token`.
- SPF, DKIM en DMARC op `p=quarantine` binnen een maand na livegang, daarna `p=reject`.
- Bounces en klachten via webhook verwerken; na 3 harde bounces gaat het adres op onderdrukking en krijgt de gebruiker een melding in het platform.
- Alle uitgaande mail gelogd in `email_log`, zonder de inhoud van berichten.

---

## 10. Moderatie en veiligheid van de community

Dit is het onderdeel dat bepaalt hoeveel uur per week het platform kost. Investeer hier in automatisering.

### 10.1 Wat gemodereerd wordt

Nieuwe organisaties (altijd), oproepen bij een signaal, reacties bij een signaal, en alles waarvoor een melding binnenkomt.

### 10.2 Automatische signalering vóór publicatie

Een oproep of reactie gaat naar de wachtrij in plaats van direct live bij:

- Woorden uit een beheerbare signaallijst — betaling, lening, geld, crypto, WhatsApp-nummer in de titel
- Een e-mailadres, telefoonnummer of URL in een oproeptitel
- Meer dan 3 oproepen door dezelfde gebruiker binnen een uur
- Een account jonger dan 24 uur dat direct reageert op meer dan 5 oproepen
- Een reactie die identiek is aan een eerdere reactie van dezelfde gebruiker (copy-paste-spam)

Alles wat níet signaleert, gaat direct live. Vooraf alles goedkeuren is bij dit volume niet vol te houden en vertraagt echte hulpvragen.

### 10.3 Wachtrij en SLA

| Soort | Streeftijd |
|---|---|
| Melding "onveilige situatie" | binnen 4 uur |
| Overige meldingen | binnen 1 werkdag |
| Nieuwe organisatie | binnen 2 werkdagen |
| Gesignaleerde oproep | binnen 1 werkdag |

Het beheerdashboard toont per categorie de oudste openstaande zaak. Overschrijding kleurt de rij.

### 10.4 Maatregelen, oplopend

Waarschuwen → oproep verbergen → tijdelijk plaatsverbod (7 dagen) → account blokkeren. Elke maatregel wordt gelogd met reden en is zichtbaar op het accountdetail in het beheer.

---

## 11. Toegankelijkheid — WCAG 2.1 AA

Deze eisen zijn testbaar en horen in de definition of done van elke feature.

| Eis | Concreet |
|---|---|
| Contrast | Tekst ≥ 4,5:1; grote tekst en UI-onderdelen ≥ 3:1. Getoetst in beide thema's |
| Toetsenbord | Elke functie bereikbaar zonder muis; zichtbare focusring van minstens 2 px met 3:1 contrast |
| Skip-link | "Naar hoofdinhoud" als eerste focusbare element |
| Semantiek | Eén `h1` per pagina, koppen zonder niveausprongen, `main`/`nav`/`footer` als landmarks |
| Formulieren | Elk veld een zichtbaar `label`; fouten in tekst én gekoppeld via `aria-describedby`; nooit alleen kleur |
| Foutmeldingen | Zeggen wat er mis is en hoe het goed moet, in gewone taal |
| Afbeeldingen | Zinvolle `alt`; decoratief is `alt=""`. Het CMS dwingt een alt-tekst af bij uploaden |
| Beweging | `prefers-reduced-motion` gerespecteerd; geen automatisch bewegende carrousels |
| Zoomen | Bruikbaar tot 200% zoom en 320 px breedte zonder horizontaal scrollen |
| Taal | `lang="nl"` op `html`; anderstalige passages met eigen `lang` |
| Tijdslimieten | Sessie verloopt niet tijdens het invullen van een formulier zonder waarschuwing en verlengmogelijkheid |
| Kaart | Elke kaartweergave heeft een gelijkwaardige lijstweergave |

**Toetsing:** `axe-core` in de CI-pijplijn op elke belangrijke pagina, een handmatige toetsenbord- en schermlezertest per milestone (NVDA en VoiceOver), en één externe audit vóór livegang. Publiceer een toegankelijkheidsverklaring, ook als die niet verplicht blijkt.

---

## 12. Privacy en AVG by design

### 12.1 Verwerkingen en grondslagen

| Verwerking | Grondslag | Bewaartermijn |
|---|---|---|
| Account en profiel | Overeenkomst (art. 6.1.b) | Tot verwijdering; automatisch na 24 maanden inactiviteit |
| Oproep met mogelijk gezondheidsgegeven | Uitdrukkelijke toestemming (art. 9.2.a) | 12 maanden na sluiten, dan anonimiseren |
| Berichten | Overeenkomst | 24 maanden na laatste bericht |
| Moderatie en meldingen | Gerechtvaardigd belang (art. 6.1.f) | 24 maanden |
| Auditlog | Wettelijke verantwoordingsplicht | 24 maanden |
| Nieuwsbrief en alerts | Toestemming | Tot afmelding |
| Statistiek | Gerechtvaardigd belang, geaggregeerd | Onbeperkt, want niet herleidbaar |

### 12.2 Bijzondere persoonsgegevens

Een hulpvraag kan gezondheidsinformatie bevatten. Daarom:

1. Het plaatsingsformulier legt vóór het omschrijvingsveld uit dat de tekst openbaar is en vraagt om geen diagnoses of medicijnnamen te noemen.
2. De toestemmingsvraag bij plaatsen is apart en uitdrukkelijk, en wordt vastgelegd in `consents`.
3. Bij "voor een cliënt" verklaart de professional toestemming te hebben; dat wordt geregistreerd.
4. Gesloten hulpvragen worden na twaalf maanden geanonimiseerd: tekst weg, categorie en wijk blijven voor de statistiek.

### 12.3 Bewaartermijnen in code

De taak `retention.anonymise` is geen beleidsstuk maar een cronjob:

```sql
-- Slapende accounts: 24 maanden geen login en geen actieve oproepen
UPDATE users SET
  email = 'verwijderd+' || id || '@invalid',
  first_name = 'Verwijderde', last_name = 'gebruiker',
  password_hash = NULL, phone = NULL, street = NULL, house_number = NULL,
  postcode = NULL, bio = NULL, avatar_path = NULL, geo = NULL,
  status = 'deleted', anonymised_at = now()
WHERE status = 'active'
  AND last_login_at < now() - interval '24 months'
  AND anonymised_at IS NULL
  AND NOT EXISTS (SELECT 1 FROM listings l
                  WHERE l.owner_user_id = users.id AND l.status = 'actief');

-- Gesloten oproepen: tekst weg na 12 maanden, statistiek blijft
UPDATE listings SET
  title = 'Gesloten oproep', description = '[verwijderd na bewaartermijn]'
WHERE status IN ('gesloten','verlopen')
  AND closed_at < now() - interval '12 months'
  AND description <> '[verwijderd na bewaartermijn]';
```

Waarschuwingsmail 30 dagen vóór anonimisering van een account, met één klik om actief te blijven.

### 12.4 Rechten van betrokkenen als functie

Inzage, export (JSON en CSV) en verwijdering zitten in `/account/gegevens` en werken zelfstandig, binnen enkele seconden. Geen formulier dat bij een beheerder terechtkomt.

### 12.5 Documenten die er moeten liggen

DPIA, verwerkingsregister, verwerkersovereenkomsten met hosting en mailprovider, datalekprocedure met meldtermijn van 72 uur, privacyverklaring op B1-niveau, en een cookieverklaring die kort kan zijn omdat er geen trackingcookies zijn.

---

## 13. Beveiliging

| Onderwerp | Eis |
|---|---|
| Wachtwoorden | Argon2id, geheugen 19 MiB, iteraties 2, parallelisme 1 |
| Sessies | Server-side in `sessions`; cookie `HttpOnly`, `Secure`, `SameSite=Lax`; 30 dagen, verlengd bij gebruik |
| Sessie-invalidatie | Bij wachtwoordwijziging, rolwijziging en blokkade worden alle sessies ingetrokken |
| Autorisatie | Op de server bij elke actie opnieuw controleren; nooit vertrouwen op een verborgen knop |
| CSRF | Server Actions met origin-controle; expliciete token op klassieke formulieren |
| Rate limiting | Login 5 per 15 min per IP en per account; registratie 3 per uur per IP; reageren 10 per uur per account; zoeken 60 per minuut |
| Uploads | Alleen JPEG, PNG, WebP en PDF; magic-byte-controle, niet de extensie; maximaal 5 MB; opnieuw encoderen van afbeeldingen om EXIF en payloads te strippen; serveren vanaf een apart domein |
| Security headers | HSTS met preload, CSP zonder `unsafe-inline`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` restrictief |
| Injectie | Uitsluitend geparametriseerde queries via de ORM; geen string-concatenatie in SQL |
| XSS | Geen `dangerouslySetInnerHTML` op gebruikersinvoer; CMS-content door een allowlist-sanitizer |
| Geheimen | In de omgeving of een secrets manager, nooit in de repo; `gitleaks` in de CI |
| Afhankelijkheden | Dependabot wekelijks; `npm audit` blokkeert de build bij `high` of hoger |
| Logging | Nooit wachtwoorden, tokens, berichtinhoud of volledige adressen in logs |
| Pentest | Vóór livegang, daarna jaarlijks. Ook een `security.txt` met een meldadres |

---

## 14. Techniekstack en infrastructuur

### 14.1 Stack

| Laag | Keuze | Reden |
|---|---|---|
| Runtime | Node.js 22 LTS | |
| Framework | Next.js 15, App Router, TypeScript strict | Server-rendered voor SEO en snelheid op zwakke apparaten |
| UI | Tailwind CSS + shadcn/ui + Radix primitives | Radix levert de toegankelijkheidsmechanica die anders zelf gebouwd moet worden |
| Database | PostgreSQL 16 + PostGIS + pg_trgm | Eén systeem voor relaties, geo én zoeken |
| ORM | Drizzle | Typeveilig, migraties als SQL leesbaar in de repo |
| Auth | Auth.js v5, credentials + Google, TOTP voor beheer | |
| CMS | Payload CMS v3, in dezelfde app, eigen schema `cms` | Levert pagina's, menu, media en redactierollen kant-en-klaar |
| Taken | pg-boss op dezelfde database | Geen extra Redis-infrastructuur |
| E-mail | Postmark (EU) + React Email | |
| Bestanden | S3-compatibel bij Scaleway of OVH (EU) | |
| Statistiek | Plausible, zelfgehost | Cookieloos, dus geen cookiebanner |
| Rapportage | Metabase op een read-only replica | |
| Fouten | Sentry, EU-regio | |
| Uptime | Uptime Kuma, zelfgehost, buiten de eigen infrastructuur | |

**Scheiding van domein en CMS.** De applicatiedata staat in schema `app` met een eigen Drizzle-schema. Payload krijgt schema `cms` en beheert alleen redactionele content. Reden: de matchingquery's moeten vrij te optimaliseren zijn en mogen niet vastzitten aan de datamodellering van een CMS. Beide draaien op dezelfde databaseserver, dus een join blijft mogelijk waar dat nodig is.

### 14.2 Omgevingen

| Omgeving | Doel | Data |
|---|---|---|
| `local` | Ontwikkeling | Docker Compose met Postgres + PostGIS, seed-script |
| `preview` | Per pull request | Wegwerpdatabase met geanonimiseerde seed |
| `staging` | Acceptatie en toegankelijkheidstest | Kopie van productiestructuur, gemaskeerde data |
| `production` | Live | |

### 14.3 Infrastructuur

Twee applicatiecontainers achter Caddy, met automatische certificaten. Postgres als managed dienst of op een aparte machine met dagelijkse dumps én point-in-time recovery. Object storage bij dezelfde EU-aanbieder. Alles beschreven in `docker-compose.yml` en Terraform, zodat de omgeving opnieuw op te bouwen is zonder klikwerk.

**Back-up en herstel:** nachtelijke `pg_dump` naar object storage met 30 dagen retentie, WAL-archivering voor PITR tot 7 dagen, en een **wekelijkse automatische hersteltest** die de dump terugzet en de rijen telt. Een back-up die nooit is teruggezet is geen back-up.

### 14.4 CI/CD

GitHub Actions: lint, typecheck, unit, integratie tegen een echte Postgres in een service-container, Playwright end-to-end, axe-core toegankelijkheid, `gitleaks`, `npm audit`. Merge naar `main` deployt naar staging; een tag deployt naar productie. Migraties draaien vóór de nieuwe versie live gaat en moeten achterwaarts compatibel zijn, zodat terugrollen zonder dataverlies kan.

### 14.5 Rapportage

Metabase op een read-only replica, met vaste dashboards: oproepen per type en maand, matches per maand, doorlooptijd van plaatsing tot eerste reactie, percentage oproepen zonder enige reactie (de belangrijkste kwaliteitsindicator), actieve deelnemers, activiteit per wijk, en moderatiedoorlooptijd. Alle dashboards exporteerbaar als CSV voor de gemeentelijke verantwoording.

---

## 15. Kwaliteits- en prestatiebudgetten

Meetbaar, want anders is het een wens.

| Meting | Norm |
|---|---|
| Largest Contentful Paint, 4G-mobiel | < 2,0 s op overzicht en detail |
| Interaction to Next Paint | < 200 ms |
| Cumulative Layout Shift | < 0,1 |
| JavaScript op een detailpagina | < 120 kB gzipped |
| Serverantwoord, p95 | < 300 ms voor overzicht met filters |
| Zoekquery, p95 | < 150 ms bij 50.000 oproepen |
| Beschikbaarheid | 99,5% per maand |
| Lighthouse Accessibility | ≥ 95, met handmatige toets als doorslag |
| Testdekking op domeinlogica | ≥ 80% regels; matching en autorisatie 100% takken |

---

## 16. Vindbaarheid

- Serverside gerenderde detailpagina's met unieke `title` en `meta description` per oproep.
- `JobPosting`-structured data voor vacatures en `Event` voor activiteiten; dat levert rijke resultaten in Google.
- Gepagineerde `sitemap.xml`, dagelijks ververst, alleen actieve oproepen.
- Canonical op de gefilterde overzichten om dubbele content door filtercombinaties te voorkomen.
- Verlopen oproepen blijven bereikbaar op hun URL met een duidelijke melding en verwijzingen naar vergelijkbare actieve oproepen — beter voor bezoekers én voor de indexering dan een 404.
- Landingspagina's per kern: Hoofddorp, Nieuw-Vennep, Badhoevedorp, Zwanenburg, Rijsenhout, Lisserbroek, Vijfhuizen. Dit is het belangrijkste organische kanaal voor een lokaal platform.

---

## 17. Teststrategie en definition of done

**Testpiramide:** unit op domeinlogica (matching, autorisatie, bewaartermijnen), integratie op databaseniveau met echte Postgres, en end-to-end op de vijf kritieke paden: registreren, oproep plaatsen, zoeken en filteren, reageren, en modereren.

**Definition of done per feature:**

1. Werkt zonder JavaScript op de kernpaden
2. Bruikbaar met alleen het toetsenbord, met zichtbare focus
3. Getoetst op 320 px breed
4. Foutafhandeling in gewone taal, geen technische meldingen
5. Autorisatie server-side getest, ook het negatieve geval
6. Ingrepen op andermans gegevens gelogd in `audit_log`
7. Nederlandse teksten op B1-niveau
8. Werkt in beide kleurthema's
9. Geen nieuwe axe-core-fouten
10. Migratie is achterwaarts compatibel

---

## 18. Repo-structuur

```
/app                    Next.js routes (publiek, account, beheer)
  /(publiek)
  /(auth)
  /account
  /beheer
  /api
/components             UI-componenten
/lib
  /db                   Drizzle schema, migraties, seeds
  /auth                 sessies, rollen, autorisatiehelpers
  /matching             scorelogica, zoekopbouw
  /email                sjablonen en verzending
  /jobs                 pg-boss taken
  /validation           Zod-schema's, gedeeld client en server
/cms                    Payload configuratie en collecties
/tests
  /unit /integration /e2e /a11y
/infra                  docker-compose, Caddyfile, terraform
/docs                   audit, dit bouwdossier, ADR's, runbooks
```

**ADR's.** Elke architectuurbeslissing van gewicht krijgt een genummerd bestand in `/docs/adr/`: context, keuze, alternatieven, gevolgen. Dat is de goedkoopste verzekering tegen de bus-factor uit de audit.

---

## 19. Bouwvolgorde

### 19.1 M1 — Fundament (2 weken)
Repo, CI, Docker-omgeving, databaseschema en migraties, seed-data met realistische Haarlemmermeerse voorbeelden, ontwerpsysteem met tokens, basislayout, en de toegankelijkheidscontroles in de pijplijn. **Op te leveren:** een lege maar deployende applicatie met werkende CI.

### 19.2 M2 — Kern (5 weken)
Registreren en inloggen, profiel, organisaties met goedkeuring, plaatsingswizard voor alle vier types, overzicht met filters, detailpagina, reageren, berichten, en de transactionele e-mails. **Op te leveren:** een platform waarmee een echte match tot stand kan komen.

### 19.3 M3 — Beheer en moderatie (4 weken)
Beheerdashboard, deelnemers- en organisatiebeheer, moderatiewachtrij met automatische signalering, meldingen, matchregistratie, categorieënbeheer, auditlog, CMS voor pagina's en menu, e-mailteksten. **Op te leveren:** het platform is te beheren zonder ontwikkelaar.

### 19.4 M4 — Beter dan nu (4 weken)
Opgeslagen zoekopdrachten met alerts, kaartweergave, verbeterde matching met scoring, vervolgvraag na een match, Metabase-rapportage, PWA met offline-lezen, kern-landingspagina's, RSS voor partners. **Op te leveren:** de argumenten om over te stappen.

### 19.5 M5 — Klaar voor livegang (3 weken)
Externe toegankelijkheidsaudit en herstel, pentest en herstel, prestatie-optimalisatie tegen de budgetten uit §15, DPIA en juridische documenten, hersteltest van de back-up, runbooks, en de contentvulling: categorieën, pagina's, veelgestelde vragen, kennisbank.

**Optionele module — datamigratie.** Alleen relevant als er alsnog een export komt. Bouw dan een import-CLI die naar een staging-database schrijft, valideert op dubbelingen en ontbrekende velden, en een rapport oplevert vóórdat er iets naar productie gaat. Accounts komen binnen als `pending` en worden pas actief na heractivatie door de gebruiker zelf.

**Totaal: 18 weken tot livegang**, uitgaande van één ontwikkelaar met AI-ondersteuning plus iemand voor content, moderatie en communicatie. Zonder die tweede persoon schuift M5 en wordt de livegang risicovol.

---

## 20. Beslissingen, aannames en openstaande punten

### 20.1 Genomen beslissingen

| # | Beslissing | Reden | Terugdraaibaar? |
|---|---|---|---|
| B1 | Nieuw merk en nieuw domein, niet meeliften op de bestaande naam | Geen mandaat, geen zekerheid over merk- en domeinrechten | Ja, tot livegang |
| B2 | Datamigratie buiten het kritieke pad | Afhankelijkheid van een derde die we niet kunnen sturen | Ja, module M5 |
| B3 | Eén `listings`-tabel voor vier types | Één zoek-, moderatie- en rapportagepad | Duur later |
| B4 | Alleen PC4-locaties, nooit huisadressen in `geo` | Privacy bij de bron | Nee, en dat is de bedoeling |
| B5 | Payload CMS naast een eigen domeinschema | CMS-functionaliteit kopen, matching zelf houden | Ja |
| B6 | pg-boss in plaats van Redis | Eén minder systeem om te beheren en te beveiligen | Ja |
| B7 | Signaleren in plaats van vooraf alles goedkeuren | Vooraf modereren is bij dit volume niet vol te houden | Ja, instelbaar |
| B8 | EU-hosting bij een Europese aanbieder | Zorggerelateerde gegevens, gemeentelijke context | Ja |
| B9 | Geen native app | Kosten en onderhoud wegen niet op tegen een goede PWA | Ja, later |
| B10 | Minimumleeftijd 16 jaar | Voorzichtigste variant binnen de bandbreedte die andere platforms hanteren | Ja, instelling |

### 20.2 Aannames die getoetst moeten worden

1. Het volume blijft onder ongeveer 50.000 oproepen en 25.000 gebruikers. Daarboven wordt een aparte zoekdienst nodig.
2. De gemeente Haarlemmermeer is geen formele opdrachtgever in deze fase, dus er geldt nu geen aanbestedingsplicht. Zodra er gemeentelijk geld in gaat, verandert dat.
3. Er is geen koppeling met gemeentelijke systemen nodig in fase 1.
4. Nederlandstalig volstaat. Meertaligheid is een aparte, niet triviale uitbreiding.

### 20.3 Openstaand

- Definitieve naam en domein
- Rechtsvorm en verwerkingsverantwoordelijke: wie staat er straks in de privacyverklaring?
- Wie doet de moderatie in de eerste maanden?
- Startcontent: welke organisaties zijn bereid om als eerste vacatures te plaatsen? Zonder een startvoorraad van ongeveer 30 oproepen voelt het platform leeg bij livegang.
- Budget voor de externe toegankelijkheidsaudit en de pentest

---

## 21. Wat hier bewust niet in staat

Dit dossier bevat geen visueel ontwerp, geen huisstijl en geen definitieve teksten. Dat is een aparte stap na M1, wanneer de structuur vaststaat maar er nog niets is uitgekleed. Ook de campagne- en wervingsaanpak — het antwoord op het netwerkeffect uit de audit — is bewust geen technisch document.
