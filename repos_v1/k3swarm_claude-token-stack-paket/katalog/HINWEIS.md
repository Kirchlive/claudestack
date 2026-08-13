# HINWEIS — Vollinventar und Konsolidierungsregeln

Der `kern-katalog.md` enthält bewusst nur die 25 bewerteten Schlüssel-Repos
(Score/Flags/Entscheidung). Das **Vollinventar** liegt außerhalb dieses Pakets
und ist Single Source of Truth für den Suchraum:

- **`/mnt/agents/claudestack/OPUS5_MAX_Validation/repo-catalog-v4.json`**
  (maschinenlesbar, 26-Felder-Schema v4, eigene Vermessung aller Repos:
  Stars, last_commit, days_since_commit, license, archived, redirect, flags)
- `/mnt/agents/claudestack/OPUS5_MAX_Validation/repo-catalog-v4.md`
  (Lesefassung, programmatisch synchron zum JSON)

## Konsolidierungsregeln (aus Unstimmigkeit U6, verbindlich)

Bei jeder Weiterverarbeitung des v4-Katalogs gilt:

1. **376 Einträge → 373 eindeutige Repos.** Drei Redirect-Dubletten entfernen
   (u. a. headroom/yek/claude-code-patches-Cluster; Renames über 301-Redirects
   auflösen, nie beide Namen zählen).
2. **Lizenz-Gate wörtlich anwenden** (Gesetz III): die v4-Zählung
   „249 freigabefähig" enthält 33 lizenzlose Repos — wörtlich angewendet sind
   es **216**. PolyForm/AGPL/ELv2/lizenzlos = Fence bzw. Sperre, nicht
   „freigabefähig mit Hinweis".
3. **Off-by-one-Cluster korrigieren:** v4-Zählungen 135/136, 196/197, 60/61,
   22/23, 255/256 sind bestätigt inkonsistent; bei Zählungen immer
   programmatisch aus dem JSON neu aggregieren, nie Tabellenwerte erben.
4. **U7-Fix:** `NodeNestor/claude-lean-context` trägt im v4-MD-Katalog noch
   das v3-Urteil „sehr starke Alternative" — es gilt das Watchlist-Urteil
   (1★, Substanz offen). Katalog-Zeile bei der nächsten v5-Generierung
   korrigieren.
5. **Sechs behauptete Renames, vier tabelliert:** Rename-Liste aus dem JSON
   (redirect-Felder) neu ziehen statt aus der MD-Prosa.

## Renames (verifiziert, 2026-08-13)

- `NodeNestor/nestor-lean` → `NodeNestor/claude-lean-context`
- `bodo-run/yek` → `mohsen1/yek`
- `chopratejas/headroom` → `headroomlabs-ai/headroom`

## Neufunde ohne Bewertung (nächste Validierungsrunde)

junhoyeo/tokscale, kenn-io/agentsview (Observability zweiter Reihe),
giancarloerra/SocratiCode — verifiziert real, aber ohne 1–100-Score;
nicht still in den Kern übernehmen.
