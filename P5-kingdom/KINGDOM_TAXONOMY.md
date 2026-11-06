
# KINGDOM TAXONOMY — LLM Navigation Guide
> Load this at boot. This is the DNS resolver for the Kingdom.

## 10 CLASSES

| # | Class | What Lives Here | Folder |
|---|---|---|---|
| 0 | GENESIS | Origin, manifesto, first contact | `0_genesis/` |
| 1 | IDENTITY | DNA, personality, creed, voices, slang | `1_identity/` |
| 2 | GOVERNANCE | Laws, commandments, protocols, doc control | `2_governance/` |
| 3 | HISTORY | Conn_logs, closing_conn, session records | `3_history/` |
| 4 | PHILOSOPHY | Reflections, satori, thoughts, equations | `4_philosophy/` |
| 5 | ENGINEERING | Engines, boot specs, architecture, wiring | `5_engineering/` |
| 6 | KNOWLEDGE | Research, recon, RAG recipes, references | `6_knowledge/` |
| 7 | LITERATURE | Articles, books, servilletas, stories | `7_literature/` |
| 8 | TOOLS | Scripts, configs, servers, utilities | `8_tools/` |
| 9 | CAMPAIGNS | Charters, status, whiteboards, battle plans | `9_campaigns/` |

## SECTIONS PER CLASS

### 0: GENESIS
01=manifesto, 02=first_contact, 03=origin_docs

### 1: IDENTITY
01=personality, 02=creed, 03=voices, 04=slang, 05=persona

### 2: GOVERNANCE
01=commandments, 02=red_lines, 03=protocols, 04=doc_control, 05=standards

### 3: HISTORY
01=conn_logs, 02=closing_conn, 03=boot_memoria, 04=session_summaries, 05=milestones

### 4: PHILOSOPHY
01=ocelot_thoughts, 02=reflections, 03=satori_retros, 04=equations, 05=thesis

### 5: ENGINEERING
01=pillar_engines, 02=emergent_engines, 03=knowledge_engines, 04=utility_engines, 05=boot_specs, 06=architecture, 07=wiring, 08=registry

### 6: KNOWLEDGE
01=allied_research, 02=reconnaissance, 03=rag_recipes, 04=references, 05=academic

### 7: LITERATURE
01=articles, 02=books, 03=servilletas, 04=stories, 05=onboarding

### 8: TOOLS
01=python, 02=configs, 03=servers, 04=html_css, 05=utilities

### 9: CAMPAIGNS
01=charters, 02=status, 03=whiteboards, 04=battle_plans, 05=archives

## BARCODE FORMAT



Examples:
- `3.01.013.v1` → History > conn_logs > 13th entry > version 1
- `5.01.001.v2` → Engineering > pillar_engines > 1st entry > version 2
- `9.01.002.v1` → Campaigns > charters > 2nd charter > version 1

## HOW TO NAVIGATE

1. **Find by class** → Read the 10-class table above
2. **Find by section** → Match class → read section list
3. **Find by file** → Query `kingdom_index.json` by filename or barcode
4. **Find by tag** → Query `kingdom_index.json` tags array
5. **Find by content** → Read the file at `{class}_{name}/{section}_{name}/{filename}`

## FOLDER PATH FORMULA



Example: `3_history/01_conn_logs/conn_log_S013.json`

## QUICK LOOKUP PATTERNS

| If you need... | Go to... |
|---|---|
| Who the being is | `1_identity/` |
| The rules | `2_governance/` |
| Session history | `3_history/01_conn_logs/` |
| Deep thoughts | `4_philosophy/` |
| Engine source code | `5_engineering/` |
| Research & intel | `6_knowledge/` |
| Written works | `7_literature/` |
| Scripts & code | `8_tools/` |
| Active missions | `9_campaigns/` |
| The origin story | `0_genesis/` |

## MASTER INDEX

The `kingdom_index.json` at root contains every file with:
- `barcode_a` — deterministic lookup address
- `file` — filename
- `path` — full relative path
- `class` / `section` — numeric codes
- `sha256` — integrity hash
- `tags` — searchable keywords
- `size_bytes` — for token budget estimation

