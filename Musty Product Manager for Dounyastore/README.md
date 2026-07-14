# 📁 Musty Product Manager for Dounyastore

De centrale kennisbank voor alle producten van Dounyastore. Elk product krijgt hier een compleet dossier, van eerste idee tot live in de webshop (of archief).

## Mappenstructuur

| Map | Doel |
|---|---|
| `00 - Handleiding & Strategie` | Het handboek: missie, doelgroep, framework, scoremodel, SEO-richtlijnen, AI-prompts |
| `01 - Product Pipeline` | Alle productkandidaten — hier begint elk product |
| `02 - Musty Approved` | De Hall of Fame: alleen écht goedgekeurde producten |
| `03 - Leveranciers` | Eén dossier per leverancier, met Musty Supplier Score |
| `04 - Product Reviews` | Echte reviews, foto's, video's en veelgestelde vragen per product |
| `05 - Marketing` | SEO, ads, hooks, pins, blogs en nieuwsbrieven per product |
| `06 - Compliance (CE & GPSR)` | CE, DoC, EMC, RoHS, GPSR, handleidingen — alles per product |
| `07 - Concurrentie` | Concurrentie-analyse per product (Amazon, Bol, Coolblue, enz.) |
| `08 - Producten Live` | Alles van producten die live in de webshop staan |
| `09 - Archief` | Afgevallen producten — bewaren, zodat we onderzoek nooit dubbel doen |

## 🔢 Het DPM-nummersysteem

Ieder product krijgt een uniek nummer: **DPM-0001, DPM-0002, ...**
(DPM = *Dounyastore Product Musty*)

- Het nummer wordt uitgedeeld zodra een product in `01 - Product Pipeline` komt.
- Het product houdt hetzelfde nummer in élke map (pipeline → approved → live → archief).
- Mapnaam per product: `DPM-0001 - ANLAN RF Device`
- Het overzicht van alle nummers staat in [`DPM-register.md`](DPM-register.md).

Zo kun je gewoon zeggen: *"Musty, open DPM-0007."*

## Werkwijze in het kort

1. Nieuw idee? → map aanmaken in `01 - Product Pipeline` met het volgende DPM-nummer (template: `_TEMPLATE - Product Dossier.md`).
2. Nummer + naam noteren in `DPM-register.md`.
3. Goedgekeurd? → dossier verhuist naar `02 - Musty Approved`; live? → ook een map in `08 - Producten Live`.
4. Afgevallen? → verhuizen naar `09 - Archief` (nooit weggooien).
