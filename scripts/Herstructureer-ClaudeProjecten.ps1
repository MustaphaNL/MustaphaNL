# =====================================================================
#  Herstructureer-ClaudeProjecten.ps1
#  ------------------------------------------------------------------
#  Ruimt de map "Claude projecten" op het bureaublad op:
#    1. Zoekt dubbele bestanden (op inhoud, via SHA256-hash) en
#       verplaatst de kopieen naar "_Dubbele bestanden".
#    2. Sorteert losse bestanden in de hoofdmap in nette submappen
#       per type (Documenten, PDF's, Afbeeldingen, enz.).
#    3. Maakt op het bureaublad de map
#       "Musty Product Manager for Dounyastore" aan met de volledige
#       structuur (00 t/m 09) inclusief templates en DPM-register.
#
#  Gebruik (PowerShell):
#    .\Herstructureer-ClaudeProjecten.ps1                   -> voert alles uit
#    .\Herstructureer-ClaudeProjecten.ps1 -DryRun           -> laat alleen zien
#                                                              wat er ZOU gebeuren
#    .\Herstructureer-ClaudeProjecten.ps1 -MustyInOneDrive  -> zet de map
#        "Musty Product Manager for Dounyastore" in je OneDrive
#        in plaats van op het bureaublad
#
#  Er wordt NIETS verwijderd. Alleen verplaatst of aangemaakt.
#  Van elke actie wordt een logbestand op het bureaublad gezet.
# =====================================================================

param(
    [switch]$DryRun,
    [string]$ClaudeMapNaam = "Claude projecten",
    [switch]$MustyInOneDrive   # zet de Musty-structuur in OneDrive i.p.v. op het bureaublad
)

$ErrorActionPreference = "Stop"

# --- Locaties -------------------------------------------------------
$Desktop   = [Environment]::GetFolderPath("Desktop")   # werkt ook bij OneDrive-bureaublad
$ClaudeMap = Join-Path $Desktop $ClaudeMapNaam
$LogPad    = Join-Path $Desktop ("Herstructurering-log {0}.txt" -f (Get-Date -Format "yyyy-MM-dd HHmm"))
$Log       = New-Object System.Collections.Generic.List[string]

function Schrijf($tekst) {
    Write-Host $tekst
    $Log.Add($tekst) | Out-Null
}

function Maak-Map($pad) {
    if (-not (Test-Path -LiteralPath $pad)) {
        if ($DryRun) { Schrijf "  [DRY-RUN] Zou map aanmaken: $pad" }
        else { New-Item -ItemType Directory -Path $pad -Force | Out-Null; Schrijf "  Map aangemaakt: $pad" }
    }
}

function Verplaats-Veilig($bron, $doelmap) {
    # Verplaatst een bestand zonder ooit iets te overschrijven.
    Maak-Map $doelmap
    $naam  = Split-Path $bron -Leaf
    $doel  = Join-Path $doelmap $naam
    $i     = 1
    while (Test-Path -LiteralPath $doel) {
        $basis = [IO.Path]::GetFileNameWithoutExtension($naam)
        $ext   = [IO.Path]::GetExtension($naam)
        $doel  = Join-Path $doelmap ("{0} ({1}){2}" -f $basis, $i, $ext)
        $i++
    }
    if ($DryRun) { Schrijf "  [DRY-RUN] Zou verplaatsen: $bron  ->  $doel" }
    else { Move-Item -LiteralPath $bron -Destination $doel; Schrijf "  Verplaatst: $bron  ->  $doel" }
}

Schrijf "====================================================="
Schrijf " Herstructurering gestart: $(Get-Date)"
if ($DryRun) { Schrijf " MODUS: DRY-RUN (er wordt niets echt verplaatst)" }
Schrijf " Bureaublad: $Desktop"
Schrijf "====================================================="

# =====================================================================
#  STAP 1 + 2: map "Claude projecten" opruimen
# =====================================================================
if (-not (Test-Path -LiteralPath $ClaudeMap)) {
    Schrijf ""
    Schrijf "LET OP: map '$ClaudeMapNaam' niet gevonden op het bureaublad."
    Schrijf "Mappen die er wel staan:"
    Get-ChildItem -LiteralPath $Desktop -Directory | ForEach-Object { Schrijf ("  - " + $_.Name) }
    Schrijf "Draai het script opnieuw met de juiste naam, bijvoorbeeld:"
    Schrijf "  .\Herstructureer-ClaudeProjecten.ps1 -ClaudeMapNaam 'Claude Projecten'"
}
else {
    # --- Stap 1: dubbele bestanden opsporen (op inhoud) ---------------
    Schrijf ""
    Schrijf "STAP 1: Dubbele bestanden zoeken in '$ClaudeMapNaam'..."
    $DubbelMap = Join-Path $ClaudeMap "_Dubbele bestanden"

    $alleBestanden = Get-ChildItem -LiteralPath $ClaudeMap -File -Recurse |
        Where-Object { $_.FullName -notlike (Join-Path $DubbelMap "*") }

    $perHash = $alleBestanden |
        Group-Object { (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash } |
        Where-Object { $_.Count -gt 1 }

    if ($perHash.Count -eq 0) {
        Schrijf "  Geen dubbele bestanden gevonden."
    }
    else {
        $aantal = 0
        foreach ($groep in $perHash) {
            # Oudste bestand blijft staan, de rest gaat naar _Dubbele bestanden
            $gesorteerd = $groep.Group | Sort-Object CreationTime
            $origineel  = $gesorteerd[0]
            Schrijf "  Dubbel gevonden ($($groep.Count)x): $($origineel.Name) - origineel blijft staan in $($origineel.DirectoryName)"
            foreach ($kopie in ($gesorteerd | Select-Object -Skip 1)) {
                Verplaats-Veilig $kopie.FullName $DubbelMap
                $aantal++
            }
        }
        Schrijf "  Totaal $aantal dubbele bestanden verplaatst naar: $DubbelMap"
    }

    # --- Stap 2: losse bestanden in de hoofdmap sorteren op type ------
    Schrijf ""
    Schrijf "STAP 2: Losse bestanden in de hoofdmap sorteren op type..."
    $typeMappen = @{
        "Documenten"    = @(".doc", ".docx", ".txt", ".rtf", ".odt", ".md")
        "PDF's"         = @(".pdf")
        "Spreadsheets"  = @(".xls", ".xlsx", ".csv", ".ods")
        "Presentaties"  = @(".ppt", ".pptx", ".odp")
        "Afbeeldingen"  = @(".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg", ".heic")
        "Video's"       = @(".mp4", ".mov", ".avi", ".mkv", ".webm")
        "Audio"         = @(".mp3", ".wav", ".m4a", ".ogg")
        "Archieven"     = @(".zip", ".rar", ".7z", ".tar", ".gz")
    }

    $losseBestanden = Get-ChildItem -LiteralPath $ClaudeMap -File
    if ($losseBestanden.Count -eq 0) {
        Schrijf "  Geen losse bestanden in de hoofdmap - niets te sorteren."
    }
    else {
        foreach ($bestand in $losseBestanden) {
            $ext = $bestand.Extension.ToLower()
            $doelNaam = "Overig"
            foreach ($naam in $typeMappen.Keys) {
                if ($typeMappen[$naam] -contains $ext) { $doelNaam = $naam; break }
            }
            Verplaats-Veilig $bestand.FullName (Join-Path $ClaudeMap $doelNaam)
        }
    }
    Schrijf "  (Bestaande projectmappen zijn met rust gelaten.)"
}

# =====================================================================
#  STAP 3: "Musty Product Manager for Dounyastore" aanmaken
# =====================================================================
Schrijf ""
Schrijf "STAP 3: Map 'Musty Product Manager for Dounyastore' aanmaken..."

# Doellocatie bepalen: bureaublad, of OneDrive als -MustyInOneDrive is meegegeven
$MustyBasis = $Desktop
if ($MustyInOneDrive) {
    $oneDrivePad = $env:OneDrive
    if (-not $oneDrivePad) { $oneDrivePad = $env:OneDriveConsumer }
    if (-not $oneDrivePad) { $oneDrivePad = $env:OneDriveCommercial }
    if ($oneDrivePad -and (Test-Path -LiteralPath $oneDrivePad)) {
        $MustyBasis = $oneDrivePad
        Schrijf "  Doel: OneDrive ($oneDrivePad)"
    }
    else {
        Schrijf "  LET OP: geen OneDrive-map gevonden op deze computer."
        Schrijf "  De structuur wordt daarom op het bureaublad gezet: $Desktop"
    }
}

$PM = Join-Path $MustyBasis "Musty Product Manager for Dounyastore"
$structuur = @(
    "00 - Handleiding & Strategie",
    "01 - Product Pipeline",
    "02 - Musty Approved",
    "03 - Leveranciers",
    "04 - Product Reviews",
    "05 - Marketing",
    "06 - Compliance (CE & GPSR)",
    "07 - Concurrentie",
    "08 - Producten Live",
    "09 - Archief"
)
Maak-Map $PM
foreach ($m in $structuur) { Maak-Map (Join-Path $PM $m) }

function Schrijf-Bestand($pad, $inhoud) {
    if (Test-Path -LiteralPath $pad) { Schrijf "  Bestaat al (overgeslagen): $pad"; return }
    if ($DryRun) { Schrijf "  [DRY-RUN] Zou bestand aanmaken: $pad" }
    else {
        [IO.File]::WriteAllText($pad, $inhoud, (New-Object System.Text.UTF8Encoding($true)))
        Schrijf "  Bestand aangemaakt: $pad"
    }
}

# --- Uitleg per map -------------------------------------------------
$uitleg = @{
    "00 - Handleiding & Strategie" = "Ons handboek: missie, doelgroep, tone of voice, Musty Product Framework, scoremodel, productcriteria, SEO-richtlijnen, marketingstrategie en AI-prompts. Deze map verandert niet vaak."
    "01 - Product Pipeline"        = "Iedere productkandidaat begint hier. Maak per product een map 'DPM-XXXX - Productnaam' en vul het Product Dossier-template in. Registreer het nummer in DPM-register.txt."
    "02 - Musty Approved"          = "De Hall of Fame: alleen producten die echt zijn goedgekeurd. Per product: score, status, leverancier, CE, GPSR en risico."
    "03 - Leveranciers"            = "Iedere leverancier krijgt een eigen dossier: AliExpress score, communicatie, reactiesnelheid, verzendtijd, CE/GPSR-documenten, retourervaringen en de Musty Supplier Score."
    "04 - Product Reviews"         = "Per product: echte reviews, Judge.me reviews, Amazon reviews, negatieve reviews, foto's, video's en veelgestelde vragen."
    "05 - Marketing"               = "Per product: SEO-titel en -beschrijving, Meta Ads, TikTok hooks, Facebook Ads, Pinterest pins, blog, nieuwsbrief, FAQ en USP's."
    "06 - Compliance (CE & GPSR)"  = "Per product: CE, Declaration of Conformity, EMC, RoHS, GPSR, handleiding, veiligheidswaarschuwingen, fabrikant, importeur en verantwoordelijke EU-partij."
    "07 - Concurrentie"            = "Per product bekijken we Amazon, Bol, Coolblue, Douglas, LookFantastic, AliExpress, Temu en TikTok Shop: wat verkopen zij, voor welke prijs, wat missen zij, waar kunnen wij beter zijn?"
    "08 - Producten Live"          = "Alle producten die in de webshop staan: productpagina, foto's, video's, SEO, reviews, advertenties, conversiecijfers, retourpercentage en klantvragen."
    "09 - Archief"                 = "Niet elk product haalt het - ook die bewaren we, zodat we over zes maanden niet opnieuw hetzelfde onderzoek doen."
}
foreach ($m in $structuur) {
    Schrijf-Bestand (Join-Path (Join-Path $PM $m) "LEESMIJ.txt") $uitleg[$m]
}

# --- DPM-register ----------------------------------------------------
$register = @"
DPM-REGISTER  (DPM = Dounyastore Product Musty)
================================================
Ieder product krijgt een uniek nummer dat NOOIT wordt hergebruikt.
Nieuw product? Pak het eerstvolgende vrije nummer en noteer het hier.

DPM-0001 | ANLAN RF Device  | Pipeline
DPM-0002 | EMS Neck Lifter  | Pipeline
DPM-0003 | PDRN Eye Cream   | Pipeline
DPM-0004 | LED Eye Wand     | Pipeline
DPM-0005 | (vrij)

Statussen: Pipeline -> Approved -> Live -> eventueel Archief.
Vanaf nu zeg je gewoon: "Musty, open DPM-0007."
"@
Schrijf-Bestand (Join-Path $PM "DPM-register.txt") $register

# --- Product Dossier template ----------------------------------------
$dossier = @"
PRODUCT DOSSIER - DPM-XXXX - [Productnaam]
===========================================
Kopieer dit bestand naar de productmap en vul alles in.

 1. Samenvatting        :
 2. Productfoto         :
 3. Musty Score         :        /100
 4. Trendanalyse        :
 5. Doelgroep           :
 6. Marktanalyse        :
 7. Concurrentie        : (zie 07 - Concurrentie)
 8. Reviews             : (zie 04 - Product Reviews)
 9. Pluspunten          :
10. Minpunten           :
11. Retourrisico        : Laag / Middel / Hoog
12. Defectrisico        : Laag / Middel / Hoog
13. CE                  : (zie 06 - Compliance)
14. GPSR                : (zie 06 - Compliance)
15. Leverancier         : (zie 03 - Leveranciers)
16. Winstberekening     : inkoop EUR ___ | verzend EUR ___ | verkoop EUR ___ | marge ___%
17. Marketingideeen     :
18. SEO                 : (zie 05 - Marketing)
19. Blog                :
20. FAQ                 :
21. Status              : Pipeline / Approved / Live / Archief
"@
Schrijf-Bestand (Join-Path (Join-Path $PM "01 - Product Pipeline") "_TEMPLATE - Product Dossier.txt") $dossier

# --- Leveranciersdossier template ------------------------------------
$leverancier = @"
LEVERANCIERSDOSSIER - [Naam leverancier]
=========================================
Kopieer dit bestand naar een eigen map per leverancier.

Naam                 :
Platform             : AliExpress / Alibaba / anders
Link naar store      :
AliExpress Score     :
Communicatie         :
Reactiesnelheid      :
Verzendtijd          :
Retourervaringen     :
CE-documenten        : (in deze map bewaren)
GPSR-documenten      : (in deze map bewaren)
MUSTY SUPPLIER SCORE :        /100

Producten van deze leverancier:
DPM-____ | ____________________ | status
"@
Schrijf-Bestand (Join-Path (Join-Path $PM "03 - Leveranciers") "_TEMPLATE - Leveranciersdossier.txt") $leverancier

# =====================================================================
#  Afronden
# =====================================================================
Schrijf ""
Schrijf "====================================================="
Schrijf " Klaar: $(Get-Date)"
if ($DryRun) { Schrijf " Dit was een DRY-RUN. Draai zonder -DryRun om het echt uit te voeren." }
Schrijf "====================================================="
$Log | Set-Content -Path $LogPad -Encoding UTF8
Write-Host ""
Write-Host "Logbestand opgeslagen op het bureaublad: $LogPad"
