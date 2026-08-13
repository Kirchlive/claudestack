---
schema: claudestack.incoming-reconciliation/v1
language: de
as_of: 2026-08-13
status: complete_static_reconciliation
inputs:
  corrected_meta_zip_sha256: 1683781f2acae25adca019431e2979c320a3da9ffac046e1f8c22328cbe74657
  meta_three_way_sha256: abcca4bb6d60278373ca8642a856b92a4c845e12f88bdbb489f0a9558528f96c
  meta_round_2_sha256: b5669fae1c66eb5e074f38123c8ddbfb12f6fcd8a6efca4ca72c41a1e34aae42
  meta_round_3_sha256: 5b32ad1b08bc90ab7d3e41c971b0b80be351468ca812bb105d819c493d86a3b0
  opus5_zip_sha256: 4ed27e49cf56ff29e068c1917649f63b9a0e2c8c4656d0f25c3014116576033f
  gpt56sol_zip_sha256: 430ca0b901907a1d3455b66cd2ed278b46cb7dcc818d0f232ffc51bc96601ac8
  k3swarm_zip_sha256: 946a748132ea056dfa7a537dabb844f51f363dd2875569622aa85bd2524e72c6
  source_repo_commit: b0b300c43188f237c9e0317b9a95370db767db5d
  settings_sha256: e492cab63fe9ed5be0f7c866bfb6a4e9eff460857258bfeed38030a6062ca8e7
  tracked_pretool_guard_sha256: b33dedecb97c911a757ce6ced4e4ed297f9ff085d240c44a2aabf87f39534746
  gpt55_posttool_reducer_v3_sha256: 0a0322449305dde779e19918958c8a598fd526971aeda673d91cb384161fa081
scope:
  incoming_content_files_compared: 14
  runtime_snapshot_files_inspected: 3
  archive_code_executed: false
  new_external_web_research: true
  external_research_scope: official_claude_code_hook_docs_and_toonify_github_primary
  local_e2e_token_benchmark: false
  user_settings_mutated: false
  superseded_input_excluded: meta-validierung.zip
decision_policy:
  runtime_score_model: security_and_correctness_aware_gpt56_v1
  consensus_scores_normative: false
  inter_model_risk_dissent_preserved: true
  max_mutating_owners_per_surface: 1
  security_veto_over_mean_score: true
canonical_effect:
  dispatcher_runtime_architecture_changed: false
  architecture_refined_with_pre_execution_gate: true
  repo_decisions_changed: true
  opus_catalog_count_corrected: true
  guard_identity_collision_documented: true
  corrected_meta_errata_overlay_applied: true
  toonify_watchlist_refined: true
---

# Abgleich der nachgelieferten Meta-Validierungen und Agent-Pakete

`meta-validierung-korrekt.zip` ersetzt vollständig das zuvor irrtümlich
zugeordnete `meta-validierung.zip`. Das ausgeschlossene Archiv trägt zu keiner
Zahl, Bewertung oder Entscheidung dieses Berichts bei. Innerhalb des korrekten
Archivs ist `META-VALIDIERUNG-3RUNDE.md` das normative Errata-Overlay; die
älteren Dokumentkörper bleiben aus Provenienzgründen unverändert und enthalten
deshalb weiterhin ausdrücklich supersedierte Werte.

## 1. Ergebnis

Die neuen Daten bestätigen den Kern des vorhandenen Pakets:

1. native Claude-Code-Funktionen zuerst;
2. höchstens ein mutierender Owner je Kontextfläche; null bleibt zulässig;
3. kein Default-Proxy und kein eigener Compact-Rewriter ohne lokalen Nachweis;
4. Output-Elision nur mit Recovery, Integritätsprüfung und Net-Win-Gate;
5. `ccusage` bleibt Observer, kein Reducer;
6. Dispatcher bleibt `conditional`, bis ein lokaler Canary bestanden ist.

Eine Datenkorrektur wurde übernommen:

- OPUS-Katalogbasis auf v4.1 präzisiert: 375 Einträge, davon 374 im
  OPUS-Snapshot als `exists:true` markiert, und 368 case-insensitiv normalisierte
  kanonische Namen. Erreichbarkeit wurde in diesem Lauf nicht neu geprüft.

Zusätzlich wurde eine Dreiwege-Artefaktkollision aufgelöst: Der aktuell
getrackte Root-`hooks/bash-dump-guard.mjs` ist ein absichtlicher
`PreToolUse:Bash`-Deny-Gate. `GPT55SOL_PRO/bash-dump-guard.mjs` ist ein separat
vorhandener v3-`PostToolUse`-Outputreducer. K3 bewertet eine dritte, im ZIP nicht
mitgelieferte v3.1-Variante. Die drei Artefakte dürfen nicht gleichgesetzt
werden.

Keine Repo-Entscheidung wurde durch Mittelwertbildung geändert. Grund: OPUS und
K3 messen andere Konstrukte als die sicherheitsorientierte Runtime-Rubrik. Ein
hoher Aktivitäts-/Lizenz-/Konvergenzwert darf keinen Permission-, Korrektheits-
oder Recovery-Defekt ausmitteln.

Die Revisionsrunde bestätigt die zentralen Rechenkorrekturen, ist aber selbst
nicht fehlerfrei: `cache-fix` steht exakt bei 75, also sind vier Konfliktkandidaten
`>=75`, nicht vier `>75`. Außerdem sind die drei Aggregationen Ableitungen aus
98 Vergleichspunkt-Zeilen mit 383 beobachteten Scores, nicht wörtlich aus 98
skalaren Zellen. Beides wird unten normativ korrigiert.

## 2. Lieferumfang und Integrität

```tsv
input_id	typ	bytes	zeilen	o200k_proxy_token	sha256
META_R1	markdown	85280	1289	33703	abcca4bb6d60278373ca8642a856b92a4c845e12f88bdbb489f0a9558528f96c
META_R2	markdown	51848	704	17027	b5669fae1c66eb5e074f38123c8ddbfb12f6fcd8a6efca4ca72c41a1e34aae42
META_R3	markdown	17877	163	5002	5b32ad1b08bc90ab7d3e41c971b0b80be351468ca812bb105d819c493d86a3b0
OPUS_UPDATE	markdown	27952	427	9108	41cd4779019d8e9e71e8e7d85f1c78b93ebfced1305cb61ac2bda8cf9ec5309b
OPUS_ISSUES	json	10434	446	4078	f2074c41f82857e18106680b8b1aba81050c421602a0ed5c8829b6ed7d8d8898
OPUS_CATALOG	json	342347	12434	107941	b44d8426ec1547ed5e0868762b28a79643aba94268b31594c421e8c1019b5113
OPUS_SCORES	json	9452	482	4305	d864a29c548c11e6cf7b9e6f6642fba21d7865b9c0c3397b3460bb80e511d6ea
GPT_CROSSWALK	markdown	28874	402	9292	7ca812ce691c0e704b15f3991e7a28a4bf96e18cf952acb69dc1e427bf258b91
GPT_METRICS	json	31755	941	11277	a11dcdba9524d7f5ff86d5133a22cce2de99012a609826bc7c4d36b3bc4fda63
GPT_SECOND_VALIDATION	markdown	24982	485	7571	c4993049f92c5f9a0ac7332f6ec60ebca448a588d6f45f99105047148ba87895
GPT_FINAL	markdown	19707	396	5659	93c96fe021eb570eb1aab241f4e214cf23f944223cfc46607b7000f7bfe2037b
K3_VALIDATION	markdown	11144	161	4111	c4b335b5135ff73704c31dd88f68463e2eb0697d2ce22f05431831557108716b
K3_VERIFICATION	markdown	19777	156	7081	6392e93c0990d17e7007f067dfacdc4608fb97722d42e1206034c8d29a1c3038
K3_SECOND_VALIDATION	markdown	15612	176	5702	3aac376b0f08c572175f1eadedb5128b8402ad6f14faa3bb914b1b6acf72e846
TOTAL_CONTENT	mixed	697041	18662	231857	na
```

Die Tokenwerte sind `tiktoken/o200k_base`-Vergleichsproxys. Sie sind weder
Anthropic-Tokenizerwerte noch Laufzeitkosten. ZIP-Metadaten und `__MACOSX`-
Artefakte sind nicht in `TOTAL_CONTENT` enthalten.

Alle vier Archive wurden vor Extraktion auf Pfadtraversal und Symlinks geprüft.
Es wurde kein darin enthaltener Code ausgeführt.

## 3. Quellenabhängigkeit

```tsv
source_id	rolle	integritaet_1_5	rechnung_1_5	traceability_1_5	unabhaengigkeit_1_5	entscheidungsrelevanz_1_5	gesamt_1_5	status
GPT56SOL	intake_duplicate_der_vor_reconciliation_artefakte	5	5	5	1	4	4.0	keine_neue_stimme
OPUS5_PHASE3	derivative_zweitvalidierung_mit_neuen_metadaten	5	4	3	2	3	3.4	kontext_und_leads
K3SWARM_PHASE3	derivative_synthese_mit_teilverifikation	4	4	2	2	3	3.0	supplement_nicht_primaer
META_R1	meta_analyse_derselben_r1_gitter	5	4	4	2	3	3.6	rechnung_stark_prosa_teils_widerspruechlich
META_R2	meta_analyse_derselben_r2_scores	5	4	4	2	4	3.8	diagnose_stark_kleine_defekte
META_R3	tertiaeres_errata_overlay_und_modellantwort-synthese	5	4	4	2	5	4.0	normatives_errata_overlay_neue_claims_teils_reported_only
RUNTIME_SETTINGS	lokaler_snapshot	5	5	5	5	5	5.0	direkter_ist_beleg
PACKAGE_TESTS	lokale_same-family_verifikation	5	5	5	2	5	4.4	Vertragsbeleg_keine_unabhaengige_Validierung
```

`gesamt_1_5` ist das ungewichtete Mittel der fünf offengelegten Achsen. Es ist
eine Quellenqualitätsnote, keine Repo- oder Agentenrangfolge.

Wesentlich: Beim Intake war das GPT-Paket über alle vier Dateien byteidentisch
mit den damaligen `validate/01`, `03`, `04` und `05` (Hashes in Abschnitt 2).
`04` und `05` wurden danach durch diesen Abgleich absichtlich fortgeschrieben.
OPUS, K3 und die drei Meta-Dokumente nutzen überlappende Ausgangsdaten. Der
Nutzertext ist eine Verdichtung von `META_R3`, keine weitere Evidenzstimme.
Bestätigung innerhalb dieses Korpus erhöht Nachvollziehbarkeit, aber nicht
automatisch Quellenunabhängigkeit.

## 4. Titelweiser Abgleich

### 4.1 `META-VALIDIERUNG-3WEGE.md` v1.2

```tsv
abschnitt	titel	status	befund
0	Spaltenmapping	validiert	A=GPT-Crosswalk; B=K3-Gitter; C=OPUS-Gitter
1	Rechenpruefung	teilvalidiert	A korrekt; B/C-Korrekturen plausibel; B-Zellquelle fehlt im K3-ZIP
2	Nennerproblem	validiert	Absenz darf nicht still als Qualitaetsnote wirken
3	Durchschnitt	praezisieren	breite Trennung GPT+OPUS vor KIMI+K3 stabil; Feinrang aggregationsabhaengig
4	Zellabweichungen	verwendbar	zeigt Rasterabhaengigkeit; keine unabhaengige Replikation
5	Auffaelligkeiten	weitgehend_validiert	Selbstbewertung/Zirkel/Absenz berechtigte Caveats
6	externe Einzelquellen	nicht_neu_geprueft	CVE und Rules bleiben in diesem Lauf Source-Claims
7	gemeinsamer Korpus	validiert	Auftragstreue und Ladder-Nutzung sinnvoll getrennt
8	reale Konfiguration	validiert_und_praezisiert	Ist-Konflikte bestaetigt; Guard-Identitaetsdrift aufgeloest
9	Reihenfolge	validiert	Baseline und Prefix-Messung vor Runtime-Promotion
10	Schlussbetrachtung	teilvalidiert	Methodenkritik stabil; keine neue E2E-Evidenz
11	Volluebersicht	praezisieren	drei Ableitungen derselben 98_Punktzeilen_383_beobachteten_Scores_sind_keine_unabhaengigen_Wege
12	98 Einzelpunkte	rechnerisch_validiert	Zeilenmittel und Spannen korrekt
13	38 Themen	verwendbar	Mapping ist Interpretationsschicht
14	Gesamtuebersicht	verwendbar	Fuehrungshaeufigkeit des Rasters, kein Wirkungsbeleg
15	Aggregationsrobustheit	teilvalidiert	Feinrang bleibt von Aggregationsentscheidung abhaengig
16	maschinenlesbare Bloecke	validiert_mit_errata	Rohblock korrekt; Anzeige-/Rundungsfehler siehe unten
```

Vertiefung des wichtigen Ist-Abschnitts 8:

```tsv
abschnitt	titel	status	stackfolge
8.2	Regelduplizierung_Caveman_Ponytail	accepted	Root-Regeln_kuerzen_Plugin-Doppelung_entfernen
8.3	mehrere_Retrievalpfade	accepted	exakt_einen_Retrieval-Owner_je_Aufgabe
8.4	Agent-Teams_Fan-out	partial	Subagenten_hart_begrenzen_kein_pauschales_Fan-out
8.5	claude-mem_context-mode_Fences	accepted_as_gate	Privacy_Telemetrie_Lizenz_vor_Aktivierung_pruefen
8.settings	Skillbudget_1M_Permissions_Nudges_Pfade	partial	/context_messen_Permissions_nicht_ausweiten_Nudge-Budget_absolute_Pfade_portabilisieren
```

Harte Errata:

```tsv
locator	ist	korrekt
58_vs_545	OPUS_A_4.63_vs_4.62	exakt_4.625_rundungsmodus_deklarieren
583	Dokument_B_Gesamt_3.88	492_div_127=3.874015_ueblich_3.87
623	Dokument_C_Gesamt_4.28	546_div_128=4.265625_ueblich_4.27
136-145_vs_429-437	Paarreihenfolge_unentscheidbar_vs_Feinrang_methodenunabhaengig	breite_Paartrennung_stabil_Feinrang_aggregationsabhaengig
30_vs_472-482	neue_Abschnitte_aendern_keinen_Befund	Gesetz_I_zu_Gesetz_II_ist_eine_Aenderung
429	drei_unabhaengige_Aggregationswege	drei_Ableitungen_der_98_Punktzeilen_383_beobachteten_Scores
498-502	vier_Mittelwert-5-Punkte_als_vollstaendig	C_VP-03_und_C_VP-08_haben_KIMI_n_a_nur_D27_und_VP-11_sind_vierfach
```

Rohsummen, die stabil bleiben:

```tsv
grid	GPT	OPUS	K3	KIMI	status
A_GPT_crosswalk	156	148	125	134	direkt_reproduziert
B_K3_grid_corrected	130	144	107	111	meta_claim_Zellquelle_im_ZIP_fehlend
C_OPUS_grid_corrected	157	143	136	110	meta_TSV_reproduziert
```

### 4.2 `META-VALIDIERUNG-RUNDE2.md` v2.0

```tsv
abschnitt	titel	status	befund
0	Was_vorliegt	praezisieren	K3 hat 25 Repos plus 1 Eigenbau gleich 26 Einheiten
1	Rechenpruefung	validiert	18_32_26 Scorezeilen summieren fehlerfrei
2	Rubrikenvergleich	stark_validiert	Modelle beantworten verschiedene Fragen
3	Umfang_Ueberschneidung	korrigieren	Union39 und Schnitt15 korrekt; Verteilung 15_7_17
4	Versatz_Korrelation	validiert	Mittel_Differenzen_und_Spearman_reproduziert
5	Divergenzen	validiert_mit_Nennerfix	Replace_Reject-Vergleich auf gemeinsamen 6er-Nenner setzen
6	Zirkelschluss	validiert	OPUS_D20 und K3_Kon10 sind Korpuspopularitaet
7	Delta_R1_R2	verwendbar	Gerundete R1-Anzeigen nicht rueckmultiplizieren
8	unabhaengig_reproduziert	praezisieren	gleiche Datei plus gleicher Proxy ist Reproduktion nicht Quellenunabhaengigkeit
9	Meta-Selbstkorrektur	validiert	mehrere R1-Annahmen korrigiert
10	Bash-Owner	stark_validiert	Single-Owner-Konsens; konkrete Besetzung nicht konvergent
11	maschinenlesbare Rohbloecke	korrigieren	Mediane und Inventarwerte siehe Errata
12	Fazit	validiert	gemeinsame Runtime-Rubrik braucht Security und Korrektheit
13	Repo-Inventar	korrigieren	15 alle drei; 7 exakt zwei; 17 exakt eins
14	Achsen-Crosswalk	validiert	macht fehlende OPUS-Securityachse sichtbar
15	A0-A4	validiert_mit_Dokumentationsluecke	A0 Rohreferenz plus vier Transformationen A1-A4
16	Abstandsdiagnose	validiert	Evidenzdissens und Security-Luecke sind Haupttreiber
17	39 Repo-Ergebnisse	reproduziert	Alias context-mode-mcp-only zu context-mode muss explizit sein
18	Verfaelschungsmessung	reproduziert	MAE_Rangtreue_Spearman stimmen nach Rundung
19	bewusst_nicht_angeglichen	validiert	inhaltliche Defekte duerfen nicht wegnormiert werden
20	Angleichungsfazit	validiert_als_deskriptiv	A4 ist keine Runtime-Entscheidungsregel
21	maschinenlesbare Angleichung	validiert_mit_Semantikhinweis	Abd ist Achsenabdeckung nicht Quellenabdeckung
```

Reproduzierte Rohstatistik:

```tsv
modell	n	summe	mittel	median	min	max
GPT56	18	1219	67.7222	69.5	34	96
OPUS5	32	2423	75.7188	76.5	54	100
K3SWARM	26	1964	75.5385	74.5	56	93
```

```tsv
paar	n	mittel_delta	median_delta	spanne	spearman_rho
GPT_OPUS	15	-16.8000	-14.0	-49_bis_10	0.486104
GPT_K3	15	-14.2667	-12.0	-48_bis_15	0.257834
OPUS_K3	22	4.3636	5.5	-14_bis_15	0.770061
```

Harte Errata:

```tsv
locator	ist	korrekt
13	vier_Stufen_A0-A4	Rohreferenz_A0_plus_vier_Transformationen_A1-A4
27	26_Repos_plus_1_Eigenbau	25_Repos_plus_1_Eigenbau_26_Einheiten
72-76_293-296	Mediane_70_76_74	exakt_69.5_76.5_74.5
141	GPT_Nenner7_OPUS_K3_Nenner6	gemeinsamer_Nenner6_GPT49.5_OPUS75.5_K3_76.8333
381	15_9_15	15_7_17
Inventar	Union40_ohne_Alias	context-mode-mcp-only_zu_context-mode_explizit_mappen
522	gemeinsam_bewertete_Menge	alle_n_groesser_gleich_2_also_22_Repos
478	Abdeckung_real_belegt	Union_of_axes_coverage_nicht_Quellenabdeckung
114_597	rho_ca_0.26_als_praktisch_unabhaengig	schwache_monotone_Uebereinstimmung_keine_statistische_oder_Quellenunabhaengigkeit
```

Die A1-A4-Werte sind nach folgender, im Quelldokument nur impliziter Formel
reproduzierbar:

```text
A1 = GA8 entfernen; restliche native Modellmaxima auf 100 normieren
A2 = nur GA2 + GA5 + GA6; native Modellmaxima auf 100 normieren
A3 = Summe(Gewicht × Achsenerfüllung) / Summe(Gewichte der Modellachsen)
A4 = Summe(Gewicht × Mittel vorhandener Modell-Achsenerfüllungen)
     / Summe(Gewichte der für das Repo mindestens einmal vorhandenen Achsen)
Abdeckung = letzter Nenner / 100
```

`Abdeckung=100 %` bedeutet deshalb nicht drei unabhängige Quellen. Ein GPT-only-
Repo erreicht 100 %, weil GPT alle GA1-GA7-Achsen führt. Bei `n=1` ist A4 eine
umgewichtete Einzelmeinung, kein Konsens.

### 4.3 OPUS5 Phase 3

```tsv
abschnitt	titel	status	befund
0	zwei_Crosswalks	korrigieren	stale Aggregate kippen OPUS vom publizierten Rang4 auf korrigierten Rang2; Selbstbias-Schluss zu stark
1	Konfliktaufloesung	gemischt	wertvolle Leads; Issue_Status_CVE_ToolSearch_Rules in diesem Lauf nicht neu primaergeprueft
2	Tokenberechnungen	teilvalidiert	Tokenizer korrekt; Bytes_Zeichen_Dateimengen und MCP-Rechnung fehlerhaft
3	Dateiabgleich	weitgehend_validiert	Katalog und Drift nuetzlich; Scopebegriffe praezisieren
4	Repo-Zweitvalidierung	rechnerisch_validiert_entscheidung_nicht	32 Summen korrekt; Rubrik hat keine Security_Korrektheit_Owner_OPS-Achse
5	Artefaktaenderungen	als_Leads	keine automatische Uebernahme ohne Primaerpruefung
6	maschinenlesbare Bloecke	teilvalidiert	strukturiert; mehrere externe Issueclaims nicht in issues2 belegt
7	Phase4_Festlegung	nicht_normativ	Squeez_Snip_Toonify nicht allein aus dieser Rubrik freigeben
```

Wichtige OPUS-Einzelentscheidungen K1-K10:

```tsv
opus_claim_id	titel	OPUS_status	Reconciliation-Status	kanonische_Folge
K1	Union-Groesse	entschieden	teilvalidiert	375_Zeilen_374_exists_true_368_casefold; Rohabrufe_fehlen
K2	Agenten-Rangfolge	eingestellt	accepted	keine_Agentenrangfolge_als_Stackregel
K3	ENABLE_TOOL_SEARCH	entschieden_neue_Antwort	nicht_neu_primaergeprueft	Source-Claim; keine_Configaenderung_aus_diesem_Lauf
K4	Skill-Listing-Stueckkosten	zugunsten_K3	plausibel_nicht_neu_gemessen	Budgetdeckel_statt_n_mal_100; Zielmaschine_messen
K5	claude_rules-Reinjektion	zugunsten_KIMI	nicht_neu_primaergeprueft	Source-Claim; kurze_hart_path-scoped_Rules_bleiben
K6	Subagenten	begrifflich_aufgeloest	accepted	Kontextisolation_und_Tokenvolumen_trennen_hart_begrenzen
K7	updatedToolOutput-Form	zugunsten_GPT56	direkt_am_v3-Artefakt_bestaetigt	strukturierte_Bash-Response_shape_erhalten
K8	permissionDecision_allow	zugunsten_GPT56	OPUS-Begruendung_widerlegt	Output-Reducer_darf_trotzdem_keine_Permission_entscheiden
K9	rtk_CVE-2026-33068	Fehlzuordnung_aufgeloest	nicht_neu_extern_geprueft	CVE-Claim_nicht_als_lokaler_Fakt; offene_Permissionrisiken_bleiben_separat
K10	Plugin-Prefix	open	open	/context_Baseline_auf_Zielmaschine
```

`K8` ändert die Runtime-Entscheidung nicht. Statischer Quellcode der geprüften
Reducer zeigt unabhängig von der historischen Issue-Begründung Auto-Allow- bzw.
Permission-Seams; kanonischer Output-Reducer emittiert niemals `allow`.

```tsv
opus_befund	gemeldet	statisch_korrigiert	wirkung
Katalog	375_Eintraege_374_exists_true	Snapshotfeld_bestaetigt_368_casefold_kanonisch_keine_neue_Erreichbarkeitspruefung	FC01_aktualisiert
CLAUDE_md_Bytes	8361	8416_Bytes_8361_Zeichen	Label_korrigieren
ladder_config_Bytes	7627	7647_Bytes_7627_Zeichen	Label_korrigieren
10_mjs_Token	21570	19335_mjs_only_21570_mit_JSON	Dateimengen_nicht_mischen
Hook_PreBash	2_gemeldet_3_behauptet	5_passende_Gruppen_2_bekannte_Input-Mutatoren	Nenner_definieren
MCP_7x1000	67000	7000	Arithmetikfehler
ponytail_OPUS	97	93_nach_eigener_Eigenbenchmark-Regel	OPUS-intern_korrigieren
boost_OPUS	70	62_bis_66_nach_Hersteller_Eigenbenchmark-Regel	OPUS-intern_korrigieren
llmtrim_Lizenz	C15	MPL_2_0_in_Formel_nicht_kategorisiert	Score_formal_offen
```

Der OPUS-Dateiabgleich verwendet einen anderen oder fehlerhaft beschrifteten
Snapshot als die hier gelieferten ZIP-Inhalte:

```tsv
paket	OPUS_gemeldet_dateien_bytes	geliefert_nutzdateien_bytes	gelieferte_typen	status
GPT56SOL	4_359510	4_105318	md3_json1	Scope_abweichend
K3SWARM	2_42399	3_46533	md3	Inventar_abweichend
OPUS5	4_445070	4_390185	md1_json3	Scope_abweichend
```

### 4.4 K3SWARM Phase 3

```tsv
abschnitt	titel	status	befund
VALIDIERUNG_1	Vierwege-Abgleich	nicht_reproduzierbar	vergleich-4wege.md fehlt im Bundle
VALIDIERUNG_2	Token_T1-T9	rechnerisch_weitgehend_korrekt	Mischung aus Modellen_Fremdclaims_und_bestandenen Messungen
VALIDIERUNG_3	Scores_1-100	rechnerisch_validiert	26 Summen korrekt; Security_Korrektheit zu schwach gewichtet
VALIDIERUNG_4	U1-U9	teilvalidiert	mehrere Claims nur berichtet oder aus OPUS_KIMI uebernommen
VALIDIERUNG_5	Ladder_v1-v5	als_bericht_brauchbar	v5 enger 3+3-Scope; Effekt_bewiesen ist zu stark
VALIDIERUNG_6	Paket-Eigenpruefung	nicht_lokal_reproduzierbar	referenziertes anderes Paket fehlt; 37_38 berichtet
ZWEIT_1	Tokenberechnungen	teilvalidiert	T1_T7 korrekt gerechnet; Nenner und Kausalitaet begrenzen Aussage
ZWEIT_2	Repo-Matrix	praezisieren	Matrix_hat_25_Repozeilen; Scoretabelle_hat_plus_Eigenbau_26_Einheiten; ponytail_nicht_volle_4_4-Kernempfehlung
ZWEIT_3	Unstimmigkeiten	als_Leads	Toonify und Issueclaims erst primaer pruefen
ZWEIT_4	Repo-Scores	rechnerisch_validiert	nicht mit Runtime-Scores mitteln
ZWEIT_5	Delta	teilvalidiert	Bash-Owner-Konvergenzbehauptung widerspricht eigener Matrix
ZWEIT_6	Status	transparent	Issue-Tiefe teilweise; eigene E2E-Messung offen
VERIF_1	Repo-Verifikation	teilnachvollziehbar	ca95 API-Abrufe behauptet; Rohresponses_Manifest fehlen
VERIF_2	Halluzinationen	brauchbar	negative Suche ohne komplettes Queryprotokoll begrenzt
VERIF_3	Neufunde	Watchlist	vor Stackaufnahme tief pruefen
VERIF_4	Claude-Fakten	gemischt	Abschnitt nutzt auch Sekundaerquellen
VERIF_5	Gesamteinschaetzung	nicht_normativ	wechselt Bewertungsdimension gegen VALIDIERUNG
```

Zusätzliche K3-Metriken werden als `reported_measurement`, nicht als lokal
reproduziert geführt: 318 Token/1000 Zeichen, Squeez 86,3 ms gegen RTK 5,7 ms,
806 Calls mit 40,6 % Bash, 286 Squeez-MCP-Starttoken, Retrieve-Break-even 47 %.

### 4.5 GPT56SOL

Alle vier gelieferten GPT-Dateien waren beim Intake byteidentisch mit den
damaligen kanonischen Artefakten. `validate/04` und `validate/05` wurden durch
diesen Abgleich inzwischen absichtlich ergänzt. Titelweiser Ausgangsinhalt und
Scores bleiben unverändert. Das Paket erzeugt keine zusätzliche Evidenzstimme.

### 4.6 `META-VALIDIERUNG-3RUNDE.md` v1.0

`META_R3` supersediert fehlerhafte Werte und Formulierungen in `META_R1` und
`META_R2`, verändert deren historische Dokumentkörper aber nicht. Maschinen-
konsumenten müssen deshalb zuerst diese Overlay-Tabelle anwenden.

```tsv
abschnitt	titel	status	befund
0	Lage	reported_synthesis	Modellreaktionen zusammengefasst; drei Primaerantworten nicht vollstaendig im korrigierten ZIP
1	Errata_gegen_eigene_Meta-Dokumente	weitgehend_reproduziert	E1-E8_E10 aus Tabellen oder Logik pruefbar; E9-Skript nicht enthalten
1.1	drei_substanzielle_Fehler	validiert	15_7_17; gemeinsamer_n6; Aggregationen_nicht_unabhaengig
1.2	sieben_Praezisionsfehler	validiert_mit_scope	Mediane_25plus1_Vollbelegung_Rundung_Reproduktion_Alias_Gesetzrang
1.3	OPUS-Autorschaftseinwand	plausibel	Selbstdeklaration_plus_Inhaltsuebereinstimmung_staerker_als_Ordnerposition
1.4	nicht_getroffene_Befunde	praezisieren	inhaltliche_Konvergenz_ja_Quellenunabhaengigkeit_nein
2.1	K3SWARM-Revision	reported_only	Befehle_Exitcodes_73zu0_37zu38_im_Bericht; ausfuehrbares_revidiertes_Paket_und_Rohlogs_fehlen
2.2	OPUS5-Revision	mixed	Rangkorrektur_reproduziert; PR-Deckel_97zu65_und_originale_15er-Kreuztabelle_fehlen
2.3	GPT56-Rueckpruefung	direct_same_family	Selbstabstufung_1von5_und_Security-Veto_im_kanonischen_GPT-Bericht
3	Guard-Identitaetskollision	teil_direkt	Root-Deny-Gate_und_GPT55-v3_direkt; K3-v3.1_nur_berichtet_und_nicht_geliefert
4	verbleibende_Widersprueche	validiert_mit_errata	Konvergenzterm_aktiv; Toonify_Release_primär_geprueft; Katalogversionen_nicht_mischen
5	Residuen	accepted	K3-Metriken_reported_only_v3.1_fehlt_aktive_Zirkelterme_keine_E2E-Baseline
6	Fazit	teilvalidiert	Korpusdiagnose_stark; Grenzwert_und_98-Zellen-Formulierung_korrigieren
```

Normative Errata gegen die Revisionsrunde selbst:

```tsv
erratum_id	locator	alt	kanonisch	reproduzierbarkeit
R3E01	91_161	vier_Werkzeuge_ueber_75	drei_gt_75_oder_vier_gte_75	direkt_aus_87_83_83_75
R3E02	32_155	dieselben_98_Zellen	98_Vergleichspunkt-Zeilen_383_beobachtete_Scores	Modellnenner_98_98_97_90
R3E03	9_24_155	rund_ein_Dutzend	exakt_10_Errata_E1_bis_E10	Frontmatter_und_Tabelle
R3E04	76_78_157	Provenienzkritik_erledigt	Suite-Lieferprovenienz_verbessert_Messprovenienz_offen	Rohlogs_und_Rohlaeufe_fehlen
R3E05	60	alle_drei_unabhaengig_bestaetigen	inhaltliche_Konvergenz_bei_ueberlappender_Datenbasis	OPUS_K3_Meta_sind_abhaengig
R3E06	132	vier_Releases_an_einem_Tag	drei_Releases_v0.8.0_v0.8.1_v0.8.2_am_2026-08-12	offizielle_GitHub-Release-Liste
```

Stabile Rechenkorrekturen:

```tsv
claim_id	alt	kanonisch	status
MC01	Inventar_15_9_15	15_7_17	direkt_reproduziert
MC02	ReplaceReject_GPT51.1_n7_vs_OPUS75.5_K376.8_n6	gemeinsamer_n6_GPT49.5_OPUS75.5_K376.8333	direkt_reproduziert
MC03	Mediane_70_76_74	69.5_76.5_74.5	direkt_reproduziert
MC04	26_Repos_plus_1_Eigenbau	25_Repos_plus_1_Eigenbau_26_Einheiten	26_Scoreeinheiten_direkt_Klassifikation_berichtet
MC05	vier_vierfach_belegte_5.00-Punkte	nur_D27_und_VP-11_vierfach; VP-03_VP-08_dreifach	direkt_reproduziert
MC06	drei_unabhaengige_Aggregationswege	drei_abhaengige_Aggregationen_einer_gemeinsamen_Punktmatrix	direkt_reproduziert
```

Die drei Aggregationen sind robust gegen die gewählte Aggregationsform, aber
nicht unabhängig. `A4` bleibt außerdem `reported_derived`: Form, Gewichte und
Ausgaben sind dokumentiert, die vollständigen per-Repo-Achsenrohwerte für eine
erneute Berechnung aus allein diesen drei Meta-Dateien fehlen.

## 5. Repo- und Stackentscheidung

`raw_GPT` bleibt Runtime-Entscheidungswert, weil nur diese Rubrik technische
Korrektheit, Security/Recovery und Owner-Kompatibilität explizit trägt.
`meta_A4` ist eine deskriptive Umgewichtung. Bei einem sicherheitskritischen
Widerspruch gilt `security_veto`, nicht Mittelwert.

Die von `META_R3` bevorzugte Kreuzdarstellung ist die operative
Entscheidungsregel. Der OPUS-Wert beschreibt einen Mix aus Lieferfähigkeit,
Wartung, Lizenz, Korpusnennung und Evidenztier; er ist kein Korrektheitswert.

```tsv
repo	raw_OPUS_repository_score	raw_GPT_runtime_score	GPT_label	kanonische_Folge
ccusage	100	86	use	unstrittiger_read-only_Observer
ponytail	97	74	conditional	kurze_Rule_vor_exaktem_Pilot
planning-with-files	93	75	conditional	Muster_nur_fuer_lange_cross-session_Tasks
codegraph	90	80	conditional	gepinntes_exklusives_Retrieval-A_B
squeez	87	59	replace	nur_nach_Permission_Redaction-Fixes_als_isolierter_Sole-Owner-Arm
codeburn	86	70	conditional	read-only_Diagnose_keine_kausale_Ersparnis
omni	83	57	replace	isolierter_Ersatzarm_nach_Recovery-und-Permission-Audit
magic-compact	83	34	reject	kein_Pilot_ohne_neuen_Runtime-und-Reentry-Nachweis
serena	82	69	conditional	nur_LSP_Edit_Refactor-Aufgaben
codebase-memory-mcp	79	76	conditional	nur_grosse_polyglotte_Repos_exklusiv
sigmap	75	85	conditional	exakte_Signaturfragen_exklusiv
context-mode	75	66	conditional	MCP-only_Full-Hooks_reject
claude-code-cache-fix	75	39	reject	nur_nach_reproduziertem_Cachedefekt_neu_bewerten
tokf	71	58	replace	nur_mit_externer_Permission-Engine_und_unmaskierten_Exitcodes
compact-plus	54	50	replace	erst_nach_Haertung_und_nachgewiesenem_Native-Gap
```

Unter dieser Definition ist `ccusage` das einzige `use`-Werkzeug ohne
Runtime-Re-Entry-Gate. Vier Konfliktkandidaten liegen bei OPUS `>=75` und bei GPT
auf `replace` oder `reject`: `squeez` 87/59, `omni` 83/57,
`magic-compact` 83/34 und `claude-code-cache-fix` 75/39. Streng `>75` sind es
nur drei. Hohe Lieferfähigkeit öffnet höchstens ein Fix-plus-A/B-Gate; sie hebt
kein Runtime-Veto auf. Das berichtete Ponytail-Experiment 97→65 wird mangels
gelieferter Revisionsformel nicht als neuer Score übernommen.

```yaml
cross_axis_decision_rule:
  delivery_is_entry_gate_not_correctness_evidence: true
  github_metadata_may_impute_runtime_correctness: false
  replace_or_reject_overridden_by_high_delivery_score: false
  security_recovery_permission_veto_over_mean: true
  conflict_candidate_next_step: fix_then_isolated_paired_ab
  pr_backlog_cap_is_correctness_proxy: false
```

### 5.1 Nicht aufgelöster Risikodissens

Diese Unterschiede sind weder Rechenfehler noch per Mittelwert aufzulösen.
`canonical_local_policy` bezeichnet die konservative Paketentscheidung; die
abweichenden Modellurteile bleiben als eigene Evidenz erhalten.

```yaml
risk_dissent:
  classification: policy_risk_dissent_not_arithmetic_error
  toonify_mcp:
    gpt56:
      decision: reject
      scope: default
      reentry_requires: [code_audit, issue_audit, benchmark_raw_values, local_e2e]
      exact_pin_after_gate: v0.8.2
    opus5:
      source_label: freigabefaehiger_kern
      normalized_deployment: pilot_candidate
      repository_score: 85
    k3swarm:
      decision: conditional_pilot
      repository_score: 78
      reported_fix_measurement: reported_only
    resolved: false
    canonical_local_policy: reject_default_with_isolated_reentry
    evidence_scope: release_confirmation_is_version_evidence_not_function_evidence
  proxy_surface:
    gpt56:
      llmtrim: reject
      tokdiet: reject
    opus5:
      llmtrim: conditional_single_proxy_candidate_after_cache_measurement
      tokdiet: suspended
    k3swarm:
      llmtrim: conditional_primary_option_b
      tokdiet: conditional_fallback_after_security_audit
    resolved: false
    canonical_local_policy: no_default_proxy
    reason: ca_proxy_cache_security_and_attribution_risk
```

Quellenlocators: OPUS `UPDATE-PHASE3.md` Zeilen 310, 322 und 422–424;
K3 `zweitvalidierung-update.md` Zeilen 78–80, 102–108 und 147–158. Toonify
`v0.8.2` bestätigt nur Version, Tag und Release-Commit. Codefunktion,
Issuezustand, Rohmesswerte und lokaler E2E-Nutzen bleiben offene Gates.

```tsv
repo	raw_GPT	raw_OPUS	raw_K3	meta_A4	n	kanonischer_Wert	canonical_decision	incoming_disposition	Grund
native-claude-code	96	na	na	93.3	1	96	use	confirmed	Basis_kein_Konsensclaim
ccusage	86	100	93	92.5	3	86	use	confirmed	read_only_Observer
ponytail	74	97	92	87.1	3	74	conditional	confirmed	kurze_Rule_vor_Plugin
planning-with-files	75	93	87	84.7	3	75	conditional	confirmed	Referenzrolle_nur_lange_cross-session_Tasks
gpt_k3-posttooluse-output-reducer-v3.1	na	na	83	84.1	1	na	not_in_matrix	reference_only	K3-bewertetes_Artefakt_nicht_mitgeliefert
codegraph	80	90	83	81.9	3	80	conditional	confirmed	Relationsfragen_Version_pinnen
local-dispatcher	84	na	na	81.9	1	84	conditional	confirmed	Canary_ausstehend
codeburn	70	86	81	80.5	3	70	conditional	confirmed	read_only_Diagnose
claude-mem	na	82	na	79.0	1	na	conditional	insufficient_new_evidence	Memory-Overlap_Privacy_Security_Primaeraudit_fehlt
toonify-mcp	na	85	78	78.8	2	na	reject	watchlist_exact_v0.8.2	Formatkonverter_Default_abgelehnt_Release_und_Tag_bestaetigt_Code_Issues_Benchmark_E2E_offen
claude-rolling-context	na	na	73	78.7	1	na	not_in_matrix	not_evaluated	Proxy-Einzelstimme_keine_Runtime-Rubrik
boost	na	70	na	78.5	1	na	conditional	insufficient_new_evidence	OPUS-Score_nach_eigener_Rubrik_nur_62_bis_66
llmtrim	na	83	75	77.1	2	na	reject	watchlist_only_for_future_reaudit	Proxy_nur_nach_Cachemessung_Lizenzrubrik_offen
squeez	59	87	80	77.0	3	59	replace	confirmed	Referenzrolle_plus_AutoAllow_64KiB_Secretgrenze_Owner-Konflikt
headroom	na	68	na	76.2	1	na	reject	insufficient_new_evidence	Proxy-Einzelstimme_Primaerpruefung_fehlt
caveman	na	68	na	76.2	1	na	not_in_matrix	reference_only	Verhaltensregel_kurz_ableiten_keine_Runtime-Aufnahme
snip	na	86	71	76.0	2	na	not_in_matrix	watchlist	Security_Compatibility_Audit_fehlt
serena	69	82	74	75.8	3	69	conditional	confirmed	LSP_Edit_Refactor
sigmap	85	75	70	75.7	3	85	conditional	confirmed	exakte_Signatur_Evidenz
cc-safe-setup	na	na	68	75.7	1	na	not_in_matrix	reference_only	Setup-Muster_nicht_Runtime-Reducer
codebase-memory-mcp	76	79	74	75.7	3	76	conditional	confirmed	gross_polyglott_exklusiv
omni	57	83	77	74.8	3	57	replace	confirmed	AutoAllow_unarchivierte_grosse_Ausgabe
mcp-compressor	na	71	67	71.8	2	na	not_in_matrix	watchlist	nur_Schemaflaeche
tokdiet	na	78	72	71.1	2	na	reject	watchlist_only_for_future_reaudit	OPUS_suspendiert_K3_nur_API-Billing_nach_Security-Audit_lokal_kein_Default-Proxy
token-saver	61	na	na	70.7	1	61	replace	confirmed	AutoAllow_keine_vollstaendige_Recovery
lowfat	na	78	64	70.0	2	na	not_in_matrix	watchlist	Bash-Owner_Security-und-Recovery-Audit_fehlt
context-mode	66	75	77	69.9	3	66	conditional	confirmed	MCP_only_FullHooks_separat_reject
tokf	58	71	72	69.7	3	58	replace	confirmed	AutoAllow_Exitcode_Masking
claude-code-router	na	71	na	68.9	1	na	not_in_matrix	reject_default	Routing-Proxy_nur_bei_gemessenem_Defekt
quiet-bash	na	69	65	68.3	2	na	not_in_matrix	watchlist	Bash-Owner_Security-und-Recovery-Audit_fehlt
magic-compact	34	83	82	67.5	3	34	reject	confirmed	Lossless_Claim_und_Claude-Kompatibilitaet_unbelegt
rtk	na	57	na	66.2	1	na	conditional	remove_current_parallel_owner	Referenzrolle_nur_nach_isolierter_Permission-Pruefung
claude-code-cache-fix	39	75	82	65.9	3	39	reject	confirmed	Proxy_nur_bei_reproduziertem_Defekt
token-optimizer	na	65	na	61.7	1	na	not_in_matrix	not_evaluated	Prefix-Hygiene_nativ_zuerst
compact-plus	50	54	68	61.6	3	50	replace	confirmed	Native_Gap_und_Haertung_noetig
claude-lean-context	na	na	56	57.3	1	na	not_in_matrix	not_evaluated	K3-Einzelstimme_Primaerpruefung_fehlt
tokscale	na	54	na	52.9	1	na	not_in_matrix	not_evaluated	Observer-Einzelstimme_Primaerpruefung_fehlt
tokensave	na	54	na	52.9	1	na	not_in_matrix	not_evaluated	Retrieval-Einzelstimme_Primaerpruefung_fehlt
agentsview	na	54	na	52.9	1	na	not_in_matrix	not_evaluated	Observer-Einzelstimme_Primaerpruefung_fehlt
```

```yaml
table_completeness:
  repo_units: 39
  gpt_scores_present: 18
  opus_scores_present: 32
  k3_scores_present: 26
  all_three: 15
  exactly_two: 7
  exactly_one: 17
  missing_runtime_score_marker: na
  rule_for_gpt_missing: no_canonical_numeric_value_without_security_correctness_audit
```

Die OPUS-Werte 97 für Ponytail und 70 für Boost sind in der eigenen OPUS-Formel
zu korrigieren. Die Tabelle zeigt zur Vergleichbarkeit die gelieferten Rohwerte;
sie werden nicht zum kanonischen Runtime-Wert gemittelt.

## 6. Direkt validierte Implementierungswirkung

Die reale `settings.json` enthält:

```tsv
finding_code	severity	befund	aktion
MULTIPLE_BASH_INPUT_OWNERS	error	RTK_und_Squeez_mutieren_PreToolUse_Bash	vor_Canary_auf_einen_oder_null_reduzieren
ABSOLUTE_MACHINE_PATH	warning	mehrere_Users_rob_Pfade	portable_Config_erzeugen
DIRECT_SCRIPT_EXECUTION	warning	context-mode-cache-heal_ohne_node	Node_explizit_aufrufen
LEGACY_LADDER_HOOK	warning	gate_und_filter_auch_auf_nicht-Bash-Matchern	vor_Canary_entfernen_oder_neu_validieren
```

Reproduzierter Doctor-Snapshot: `preToolBash=5`, `postToolBash=3`,
`findings=18`, davon ein Error, 15 absolute Pfade, zwei Legacy-Ladder-Hooks
und eine direkte Script-Ausführung. Warnungskategorien überlappen pro Command.

Die gleichnamigen Guard-Artefakte wurden getrennt:

```tsv
artefakt	sha256	ereignis	funktion	evidenz	folgerung
root_hooks/bash-dump-guard.mjs	b33dedecb97c911a757ce6ced4e4ed297f9ff085d240c44a2aabf87f39534746	PreToolUse:Bash	Deny-Gate_vor_Ausfuehrung	direkt_234_Zeilen_geprueft	Platzierung_absichtlich
GPT55SOL_PRO/bash-dump-guard.mjs_v3	0a0322449305dde779e19918958c8a598fd526971aeda673d91cb384161fa081	PostToolUse:Bash	Outputreducer	direkt_1064_Zeilen_geprueft	separates_Referenzartefakt
K3_bash-dump-guard_v3.1	na	PostToolUse:Bash	behaupteter_fixierter_Outputreducer	nur_berichtet_Artefakt_im_ZIP_fehlt	K3_Score83_nur_hierauf_beziehen
```

Keine Nutzer-Settings wurden verändert. Das Paket erzeugt weiterhin nur ein
Fragment zur manuellen Prüfung.

## 7. Übernommene, verworfene und offene Daten

```tsv
decision_id	input_befund	status	konsequenz
R01	OPUS_v4.1_Countmodell	accepted	FC01_V01_korrigiert
R02	Single_Owner_ueber_alle_Datensaetze	accepted	Architektur_unveraendert
R03	gleichnamige_Guard-Varianten	resolved	Identitaetskollision_dokumentiert_keine_Doctor-Regel
R04	OPUS_Squeez87	context_only	Squeez59_replace_bleibt
R05	K3_Magic82	context_only	Magic34_reject_bleibt
R06	K3_CacheFix82	context_only	CacheFix39_reject_bleibt
R07	Meta_A4	context_only	n_Abdeckung_und_Security-Veto_noetig
R08	K3_Ladder_Zusatzmetriken	reported_only	keine_E2E_Wirkungsbehauptung
R09	Toonify_v0.8.2_Release_Tag_Commit	accepted_version_only	exakter_Pilot-Pin_v0.8.2_oder_6df804a
R10	OPUS_Issue_Status_ToolSearch_Rules	open_primary_check	keine_Configaenderung
R11	K3_revidierte_Suite_73_PASS_0_FAIL_und_37_38	reported_only	nicht_mit_lokalen_32_Pakettests_addieren
R12	GPT56_Bundle	duplicate	keine_zusaetzliche_Stimme
R13	Regel_und_Plugin-Doppelung	accepted	Prefix-Dedupe_vor_Runtime-Tool
R14	Retrieval-Mehrfachowner	accepted	pro_Aufgabe_exklusiv_waehlen
R15	Fan-out_und_Memory-Privacy	accepted_as_gate	begrenzen_und_vor_Aktivierung_Lizenz_Telemetrie_pruefen
R16	META_R3_Errata-Overlay	accepted	supersediert_stale_Prosa_und_TSV-Werte_in_META_R1_R2
R17	OPUS_D20_und_K3_Kon10_aktiv	context_only	keine_Korpuspopularitaet_als_Runtime-Evidenz
R18	OPUS_15er-Kreuzdarstellung	accepted_as_decision_form	Lieferfaehigkeit_und_Runtime-Korrektheit_nicht_mitteln
R19	Toonify_Burst_vier_Releases	corrected	drei_Releases_am_2026-08-12
```

## 8. Fehlende Daten

```tsv
gap_id	fehlend	wirkung	abschlussgate
G01	lokale_gepaarte_E2E-Aufgaben	keine_Stack-Prozentersparnis	mindestens_10_vollstaendige_Paare
G02	Anthropic-exakte_Tokenzaehlung	o200k_nur_Proxy	Provider_Count_Tokens_oder_Usagefelder
G03	OPUS_Rohabrufe_und_Hashes	Repo-Metadaten_nur_Snapshotclaim	versioniertes_Abrufmanifest
G04	K3_ausfuehrbares_Revisionspaket_Rohlogs_v3.1-Guard	Suite-und_Messclaims_nicht_lokal_reproduzierbar	vollstaendiges_hashfixiertes_Paket
G05	Meta_A4_Rohmatrix_im_Dokument	Formel_muss_inferiert_werden	Repo_x_Modell_x_Achse_JSON
G06	Toonify_Code_Issues_Benchmarkrohwerte_E2E	kein_Runtime-Score	isolierter_Canary_mit_exaktem_v0.8.2-Pin
G07	Plugin-Prefix_der_Zielmaschine	Startup-Kosten_unbekannt	/context_Baseline_vor_nach
G08	produktiver_Claude-Canary	Dispatcher_nicht_promoted	Quality_Recovery_Permission_Kostengates
G09	Zielmaschinen_Plugin_Rules_Memory-Fences	Prefix_Privacy_Lizenz_unbekannt	context_Dedupe_und_Policy-Audit
G10	OPUS_Revisionsartefakt_mit_PR-Deckel_und_15er-Kreuztabelle	97zu65_nicht_reproduzierbar	Formel_Rohwerte_und_hashfixierte_Ausgabe
```

## 9. Endgültige Stack-Folge

```yaml
stack:
  prefix:
    default: short_stable_root_CLAUDE_md
    volatile_state: task_state_only_when_needed
  bash_pre_execution_gate:
    owner: root_pretool_deny_gate
    role: deny_only
    command_rewrite_allowed: false
    deny_allowed: true
    cardinality: multiple_deny_only_gates_supported_but_explicit_inventory_required
    status: retain_after_explicit_project_policy_review
  bash_input:
    default_owner: null
    max_mutating_owners: 1
  bash_output:
    candidate_owner: claudestack_dispatcher
    default_mode: shadow
    promotion: local_paired_canary_only
  read:
    candidate_owner: claudestack_dispatcher
    mutation_mode: enforce_canary_only
  retrieval:
    default: native_search_and_bounded_read
    optional_choose_one: [sigmap, codegraph, codebase-memory-mcp, serena]
  external_data:
    optional: context_mode_mcp_only
  usage:
    optional_observer: ccusage
  compaction:
    owner: native_claude_code
  proxy:
    default_owner: null
security:
  permission_allow_emitted: false
  security_veto_over_consensus_mean: true
  recovery_before_elision: true
rollout:
  order: [baseline, prefix_hygiene, shadow, read_canary, bash_output_canary, broader_enforce]
  current_state: release_candidate_not_promoted
```

## 10. Evidenzstatus

Auflösbares Evidenzregister:

```tsv
evidence_id	quelle	locator	stance
E001	vier_gelieferte_Archive	Abschnitt_2_Hashes	context
E002	GPT56SOL.zip	vier_Intake-SHA-Paare_Abschnitt_2	duplicate
E003	OPUS5/repo-catalog-v4.json	count_counts.exists_casefold-Auswertung	supports_with_scope_limit
E004	OPUS5/scores100.json	32_Scorezeilen_und_Formelkomponenten	supports_arithmetic
E005	OPUS5/UPDATE-PHASE3.md	Zeilen_170-223	contradicts_labels_and_arithmetic
E006	OPUS5/UPDATE-PHASE3.md	Zeilen_257-324_422-424	supports_OPUS_risk_position_contradicts_local_runtime_policy
E007	K3SWARM/zweitvalidierung-update.md	Zeilen_78-80_102-108_147-158	supports_K3_risk_position_and_arithmetic
E008	K3SWARM/VALIDIERUNG.md	Zeilen_94-160	context_reported_only
E009	META-VALIDIERUNG-3WEGE.md	maschinenblock_98_Zeilen	supports_recalculation
E010	META-VALIDIERUNG-3WEGE.md	Zeilen_136-145_429-437_545_583_623	contradicts_prose
E011	META-VALIDIERUNG-RUNDE2.md	Rubriken_und_39er-Tabelle	supports_diagnosis
E012	META-VALIDIERUNG-RUNDE2.md	Zeilen_72-141_377-520	contradicts_errata
E013	work/claudestack-main-20260813/settings.json	e492cab6_Hookgruppen	current_snapshot
E014	reverted_intermediate_doctor_claim	OUTPUT_GUARD_ON_PRETOOLUSE	superseded_false_identity
E015	root_hooks/bash-dump-guard.mjs_und_GPT55SOL_PRO/bash-dump-guard.mjs	SHA_b33dedec_und_0a032244	direct_source_supersedes_E014
E016	offizielle_Claude-Code-Hooks-Dokumentation	matcher-patterns_PreToolUse_PostToolUse	supports_matcher_and_surface_contract
E017	meta-validierung-korrekt.zip	SHA_1683781f_und_sichere_3er-Inventur	supersedes_wrong_meta_archive
E018	META-VALIDIERUNG-3RUNDE.md	Zeilen_22-163	supports_errata_with_reported-only_limits
E019	PCIRCLE-AI/toonify-mcp_offizielle_GitHub-Releases	v0.8.0_v0.8.1_v0.8.2_am_2026-08-12	supports_version_contradicts_four-release-claim
E020	META_R2_39er-Rohwerttabelle_plus_GPT-Labels	15_gemeinsame_Repos_und_Kreuzdarstellung	supports_reconstructed_decision_matrix
```

```tsv
claim_id	importance	evidence	confidence	status
C-INDEPENDENCE	central	E002	high	GPT_is_duplicate
C-OPUS-COUNT	high	E003	high	accepted
C-SCORE-MATH	high	E004_E007	high	arithmetic_only
C-SECURITY-GATE	central	E006_E011_E013	high	accepted
C-META1-MATH	high	E009_E010	high	accepted_with_errata
C-META2-DIAGNOSIS	central	E011_E012	high	accepted_with_errata
C-REAL-CONFLICT	central	E013	high	direct_snapshot
C-GUARD-IDENTITY	central	E013_E015	high	direct_source_supersedes_E014
C-HOOK-MATCHERS	high	E016	high	implemented_tested
C-META3-ERRATA	central	E017_E018_E020	high	accepted_with_second-order-errata
C-CROSS-AXIS	central	E004_E011_E018_E020	high	delivery_and_runtime_correctness_separated
C-RISK-DISSENT	central	E006_E007_E019	high	preserved_not_resolved_by_mean
C-TOONIFY-VERSION	high	E019	high	v0.8.2_confirmed_exact_pin_recommended
C-K3-REVISION	high	E008_E018	medium	reported_only_raw_package_missing
C-E2E-SAVINGS	central	G01_G02	unknown	not_claimed
```

Primärquelle E016:
[Claude Code Hooks – Matcher patterns und Decision Control](https://code.claude.com/docs/en/hooks#matcher-patterns).
Die Doku spezifiziert fehlend/leer/`*` als Match-all, exakte Pipe-/Komma-Listen
und sonst JavaScript-RegExp. Ungültige Regex werden vom Package-Doctor als
Konfigurationsfehler behandelt; aktuelles Claude-Code-Fehlerverhalten ist nicht
normativ dokumentiert.

Primärquelle E019:
[Toonify MCP Release v0.8.2](https://github.com/PCIRCLE-AI/toonify-mcp/releases/tag/v0.8.2)
und [Release-Commit `6df804a`](https://github.com/PCIRCLE-AI/toonify-mcp/commit/6df804a698dde3047d3a33df587b09ba8f270247).
Der Release erschien am 2026-08-12 06:46:28 UTC. Am selben Tag listet GitHub
genau v0.8.0, v0.8.1 und v0.8.2; der vorherige Release v0.7.2 datiert vom
2026-05-01. `>=0.8.2` ist eine Mindestversion, kein reproduzierbarer Pin.
