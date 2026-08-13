# ROLLOUT — Gates, 10-Wochen-Plan, Stop-Regeln

_Verbindlicher Ausrollplan. Quellen: GPT56-Gate-Kette (ausführlichste),
MANUS-10-Wochen-Gates, OPUS-Phasen 0–7, KIMI-30-Tage-Struktur. Oberstes
Gesetz: **keine Schicht ohne messbaren Net-Win** — der Verlierer jedes Gates
wird entfernt, nicht „behalten falls"._

## Gate-Kette (nicht verhandelbar, Reihenfolge)

```
baseline → prefix_hygiene → retrieval → guards_shadow (≥ 1 Woche)
        → guards_enforce → session_and_external → proxies_or_memory
```

| Gate | Eintritt | Austritt (Abnahme) |
|---|---|---|
| baseline | Paket installiert, verify OK | Baseline-Tabelle gefüllt (≥ 3 Replikate/Klasse, Streuung < 25 %) |
| prefix_hygiene | baseline | Prefix-Tokens pro Session messbar gesunken (eigener Wert ersetzt T1-Schätzung); 100-Tok/Skill gegen /context kalibriert; Cache-Hit ≥ Baseline |
| retrieval | prefix_hygiene | Index gewinnt gepaart auf Relationsfragen ODER wird entfernt; kein zweiter Retriever |
| guards_shadow | retrieval | ≥ 1 Woche Schattenlauf, **0 versteckte Fehler** (fail-open-Logs ausgewertet), Shadow-Einsparung quantifiziert |
| guards_enforce | guards_shadow | A/B: non-inferior + materiell besser als Kontrollarm bei gleicher Qualität; sonst bleibt nativer Arm Endzustand |
| session_and_external | guards_enforce | Ladder-Stufen 1–3 + context-mode-Pilot mit eigenem Net-Win je Arm; ELv2 geprüft |
| proxies_or_memory | session_and_external | Privacy-Review bestanden; gepaarte Cache-Messung (Gesetz II) zeigt Net-Win; Rollback-Pfad geübt |

## 10-Wochen-Plan

| Woche | Wave (MASTERPLAN) | Inhalt | Gate am Ende |
|---|---|---|---|
| 1 | W1 | Baseline-Messung (10–20 reale Aufgaben, unveränderte Installation) | baseline |
| 2 | W2 | Prefix-Hygiene: prefix-budget-Befund abarbeiten, CLAUDE.md aus Template, MCP projektlokal, Deny-Regeln | prefix_hygiene (Teil 1) |
| 3 | W3 | Native Deckel setzen + Wirkung verifizieren; AUTOCOMPACT-Caveat auflösen; Canary-Probe | prefix_hygiene (Teil 2) |
| 4 | W4 | Retrieval-A/B (codegraph vs. nativ, Relationsfragen-Taskset) | retrieval |
| 5–6 | W5 | Guards im Shadow (bash-dump-guard auto, read-context-guard, session-economy, ladder-ledger) — volle 5 Werktage × 2 | guards_shadow |
| 7 | W6 | Guards scharf; gepaarter A/B bash-dump-guard vs. squeez vs. Kontrolle (v5-Methodik) | guards_enforce |
| 8 | W7a | Ladder-Stufen 1–3 scharf (TASK-STATE-Vertrag, compact-plus-Pilot, Clear+HANDOFF) | session (Teil 1) |
| 9 | W7b | context-mode-Pilot (External), optional cache-fix bei gemessenem Fehler, toonify-Pilot (Pin ≥ 0.8.2) | session_and_external |
| 10 | W7c | Optional: Proxy-Pilot (llmtrim/tokdiet, nur API-Billing, nach Privacy-Review + Security-Audit); Gesamt-E2E gegen Woche-1-Baseline; Abschlussbericht | proxies_or_memory |

## Stop-Regeln (Net-Win, sofortig)

1. **Qualität:** Task-Erfolg, Tests oder Vollständigkeit fallen in irgendeinem
   Arm → Stufe stoppen, letzter bekannter guter Zustand.
2. **Cache:** Cache-Hit-Rate < 90 % oder Cache-Creation-Anstieg ohne
   Gegenwert → betroffene Änderung zurückbauen (Gesetz II).
3. **Recovery:** Anstieg von Retries, Rohabrufen aus dem Raw-Archiv,
   Nutzer-Eingriffen oder „nochmal lesen"-Calls → Kompressionsstufe lockern
   oder stoppen.
4. **Lieferfähigkeit:** Lizenzwechsel, Archivierung oder > 60 Tage Stillstand
   einer aktiven Komponente → Gesetz-III-Review, Ersatz aus der
   Alternativenspalte (KONZEPT.md § 9).
5. **Security:** jedes Audit- oder CVE-Teilsignal (Vorbild tokdiet/rtk) →
   Komponente friert ein, bis die Prüfung abgeschlossen ist.

## Erwartungsmanagement (verbindlich kommunizieren)

- Profil A (kurz): **einstellige Prozentpunkte**. Wer mehr verspricht,
  misst auf dem falschen Nenner (T3).
- Profil B (lang): **15–30 % Input-Tokens** — aus Prefix, Session-Grenze und
  Cache, nicht aus Filtern.
- Der Bash-Guard ist **Katastrophenschutz** (T8): Er verhindert den
  200-KB-Unfall, er ist kein prozentualer Sparplan.
- Kein seriöser Gesamtprozentsatz ist vor der eigenen E2E-Messung ableitbar
  (Konsens aller vier Datensätze, T9).
