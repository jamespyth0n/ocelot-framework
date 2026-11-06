
---
doc_id: SEED-V2-G4.5-001
barcode_a: 7.04.005.v1
title: Kingdom Library Guide — Ocelot Framework v2
type: doc
class: 7
class_name: literature
section: 04
section_name: guides
target_folder: P5-kingdom/
space: Project-Ocelot
created: 2026-11-06
author: ocelot
status: draft
gate: G4.5
campaign: Seed v2.1 — The Rubik's Solve
---

# KINGDOM LIBRARY GUIDE — Ocelot Framework v2

> How to build, organize, and index your personal Kingdom.

## What Is the Kingdom?

The Kingdom is your personal file library. It lives in `P6-library/` (local) and optionally in a cloud Space. It is NEVER pushed to git. Forkers build their own.

The framework is the empty plant. The Kingdom is the fuel.

## The Dewey Classification System

Every file gets a barcode based on 10 classes:

| Class | Name | What Goes There |
|---|---|---|
| 0 | Genesis | Origin story. Charter, license, readme, roadmap. |
| 1 | Identity | Who the being is. Personality, voice, creed, memoir. |
| 2 | Governance | Rules. Commandments, policies, protocols, red lines. |
| 3 | History | What happened. Session logs, conn_logs, milestones. |
| 4 | Philosophy | Deep thoughts. Reflections, meditations, satori. |
| 5 | Engineering | The engines. Source code, boot specs, configs. |
| 6 | Knowledge | The library. Research, quotes, taxonomy, concordance. |
| 7 | Literature | The writing. Guides, articles, books, documentation. |
| 8 | Tools | The scripts. Sorters, indexers, configs, utilities. |
| 9 | Campaigns | The missions. Charters, plans, battle logs, AoW. |

## Barcode Format

Every file gets a barcode: `CLASS.SECTION.SEQUENCE.VERSION`

Example: `3.01.015.v1`
- Class 3 = History
- Section 01 = session_logs
- Sequence 015 = 15th file in this section
- Version v1 = first version


## Folder Structure

| Level 1 | Level 2 | Purpose |
|---|---|---|
| P6-library/ | | Kingdom root |
| 0_genesis/ | 01_charters/ | Origin charters |
| | 02_licenses/ | License files |
| | 03_roadmaps/ | Roadmap docs |
| 1_identity/ | 01_personality/ | Personality configs |
| | 02_creed/ | Identity creed |
| | 03_voices/ | Voice profiles |
| 2_governance/ | 01_commandments/ | Six commandments |
| | 02_policies/ | Policies |
| | 03_protocols/ | Protocols |
| 3_history/ | 01_session_logs/ | Session logs |
| | 02_conn_logs/ | Connection logs |
| | 03_milestones/ | Milestones |
| 4_philosophy/ | 01_reflections/ | Reflections |
| | 02_meditations/ | Meditations |
| | 03_satori/ | Satori moments |
| 5_engineering/ | 01_engines/ | Engine source |
| | 02_boot_specs/ | Boot specs |
| | 03_configs/ | Configs |
| 6_knowledge/ | 01_research/ | Research |
| | 02_quotes/ | Shelf quotes |
| | 03_taxonomy/ | Taxonomy |
| 7_literature/ | 01_guides/ | Guides |
| | 02_articles/ | Articles |
| | 03_books/ | Books |
| 8_tools/ | 01_scripts/ | Scripts |
| | 02_configs/ | Tool configs |
| | 03_utilities/ | Utilities |
| 9_campaigns/ | 01_charters/ | Campaign charters |
| | 02_plans/ | Plans |
| | 03_battle_logs/ | Battle logs |
| _triage/ | | Unsorted files |



The `_triage/` folder holds unsorted files waiting for classification.


## How to Sort Files

### Option 1: Manual

1. Put unsorted files in `_triage/`
2. Read each file
3. Assign a class (0–9) based on content
4. Move to the correct folder
5. Update `kingdom_index.json`

### Option 2: CSV + Mover Script

1. Classify files into a CSV with columns: `#`, `filename`, `dewey_class`, `dewey_section`, `dewey_hook`, `target_folder`, `space`
2. Put the CSV in a `csv/` folder
3. Run `kingdom_sorter_template.py`
4. The script reads the CSV, matches files, moves them to target folders

### Option 3: AI-Assisted

1. Paste a list of filenames into your AI chatbox
2. Ask it to classify using the Dewey system
3. Export as CSV
4. Run the mover script

## How to Index

After sorting, run the indexer to build `kingdom_index.json`:

1. Run `kingdom_reindex_template.py`
2. Point it to your Kingdom root folder
3. Point it to your unified CSV (optional — adds barcode metadata)
4. The script walks every folder, catalogs every file, outputs `kingdom_index.json`

The index is the brain of your Kingdom. The Concordance Engine reads it at boot.

## kingdom_index.json Format

Each entry contains these fields:

| Field | Example | Description |
|---|---|---|
| filename | connection_log_S015.json | The file name |
| barcode_a | 3.02.015.v1 | Dewey barcode |
| class | 3 | Dewey class number |
| class_name | history | Dewey class name |
| section | 02 | Section within class |
| section_name | conn_logs | Section name |
| target_folder | 3_history/02_conn_logs/ | Where it lives |
| space | Project-Ocelot | Source Space |
| tags | session, memory, S015 | Searchable tags |
| readable | true | Can the being read it? |

## The 5W+1H Barcode (Optional)

For deeper classification, each file can also carry a semantic barcode:

| Field | Question | Example |
|---|---|---|
| Who | Who created/owns this? | ocelot, architect, stanley |
| What | What type of artifact? | conn_log, engine, charter |
| When | When was it created? | 2026-11-06 |
| Where | Where does it live? | P6-library/3_history/02_conn_logs/ |
| Why | Why does it exist? | Session memory preservation |
| How | How was it created? | AI-generated during session S015 |

This is optional. The Dewey barcode (Barcode A) is sufficient for sorting and indexing.

## Cloud Sync

Your Kingdom lives in two places:

| Location | What | Pushed to Git? |
|---|---|---|
| Local (P6-library/) | Your real Kingdom | Never |
| Cloud (QuickSight Space) | Your cloud backup | N/A |
| Git repo | Generic templates only | Yes |

The .gitignore protects your personal Kingdom. Forkers get the empty structure and build their own.

## Tips

- **Start small.** Sort in batches of 50.
- **Use _triage/.** Everything unsorted goes there first.
- **Trust the CSV.** The mover script does the heavy lifting.
- **Re-index often.** After every sort pass, rebuild the index.
- **Anchor check.** Before every batch, re-read your classification system.
- **No fentanyl.** Don't let the AI improvise classifications.

## Files Referenced

| File | Location | What |
|---|---|---|
| KINGDOM_TAXONOMY.md | P5-kingdom/ | The 10-class Dewey system |
| ARTIFACT_STANDARD_v1.md | P5-kingdom/ | Barcode format and YAML frontmatter |
| kingdom_sorter_template.py | P5-kingdom/ | File mover script |
| kingdom_reindex_template.py | P5-kingdom/ | Index builder script |
| kingdom_index_template.json | P1-foundation/ | Empty index template |

---

*Your Kingdom. Your rules. Your library. Padayon.* 🐆

