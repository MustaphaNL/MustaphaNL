# 🗂️ Laptop-mappen herstructureren — handleiding

Claude (in de cloud) kan niet rechtstreeks bij de bestanden op je laptop. Daarom staat hier alles klaar om het zelf in één keer te doen.

## Wat staat er in deze repository?

1. **`scripts/Herstructureer-ClaudeProjecten.ps1`** — een PowerShell-script dat op je laptop:
   - dubbele bestanden in **Bureaublad → Claude projecten** opspoort (op inhoud, dus ook bij een andere bestandsnaam) en de kopieën verplaatst naar de submap **`_Dubbele bestanden`** (het oudste exemplaar blijft staan);
   - losse bestanden in de hoofdmap netjes sorteert in submappen per type (Documenten, PDF's, Afbeeldingen, Video's, enz. — bestaande projectmappen blijven onaangeraakt);
   - op het bureaublad de map **`Musty Product Manager for Dounyastore`** aanmaakt met de volledige structuur `00` t/m `09`, inclusief uitleg per map, het DPM-register en de templates.
2. **`Musty Product Manager for Dounyastore/`** — dezelfde structuur, maar dan als nette Markdown-versie in deze repository (handig als naslag of om in de cloud mee te werken).

## Zo voer je het uit op je laptop (Windows)

1. Download het script: open in GitHub `scripts/Herstructureer-ClaudeProjecten.ps1` → knop **Download raw file**. Zet het bijvoorbeeld op je bureaublad.
2. Open **PowerShell** (Startmenu → typ "PowerShell").
3. Eerst veilig oefenen (er wordt dan niets verplaatst, je ziet alleen wat er zóu gebeuren):

   ```powershell
   powershell -ExecutionPolicy Bypass -File "$env:USERPROFILE\Desktop\Herstructureer-ClaudeProjecten.ps1" -DryRun
   ```

4. Ziet het er goed uit? Draai hem dan echt:

   ```powershell
   powershell -ExecutionPolicy Bypass -File "$env:USERPROFILE\Desktop\Herstructureer-ClaudeProjecten.ps1"
   ```

   Wil je de map **Musty Product Manager for Dounyastore** liever in je **OneDrive** dan op het bureaublad? Voeg dan `-MustyInOneDrive` toe:

   ```powershell
   powershell -ExecutionPolicy Bypass -File "$env:USERPROFILE\Desktop\Herstructureer-ClaudeProjecten.ps1" -MustyInOneDrive
   ```

5. Klaar! Op je bureaublad vind je een **logbestand** met precies wat er is verplaatst en aangemaakt.

## Veiligheid

- Het script **verwijdert nooit iets** — het verplaatst alleen (dubbele bestanden gaan naar `_Dubbele bestanden`, zodat je ze zelf nog kunt controleren voordat je ze eventueel weggooit).
- Bestanden worden nooit overschreven; bij een naamconflict krijgt het bestand automatisch een volgnummer.
- Heet je map net iets anders dan "Claude projecten"? Geef dan de juiste naam mee:

  ```powershell
  ... -ClaudeMapNaam "Claude Projecten"
  ```
