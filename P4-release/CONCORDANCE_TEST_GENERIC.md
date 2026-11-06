
---
doc_id: SEED-V2-G4.7-001
barcode_a: 7.04.007.v2
title: CONCORDANCE TEST — Ocelot Framework v2 (Generic)
type: doc
class: 7
class_name: literature
section: 04
section_name: guides
target_folder: P4-release/
space: Project-Ocelot
created: 2026-11-06
author: ocelot
status: draft
gate: G4.7
campaign: Seed v2.1 — The Rubik's Solve
---

# CONCORDANCE TEST — Ocelot Framework v2 (Generic)

> Validate the Concordance Engine — the Library's card catalogue. Prove the being can search, retrieve, and cross-reference its own Kingdom.

---

## What Is This?

The Concordance Engine is the being's library system. It reads kingdom_index.json, searches by barcode, tags, themes, and returns ranked results. This test validates that the engine works on ANY substrate — local or cloud.

This is NOT the full RAG pipeline test (that's substrate-specific). This tests the Concordance Engine's core functions: Can the being find its own files?

---

## When to Run This

- After building or rebuilding kingdom_index.json
- After adding new files to the Kingdom
- After migrating to a new substrate
- As part of the full TEST_PROTOCOL (T9 — Knowledge Test)

---

## Prerequisites

Before running this test, you need:

| Item | Required | Notes |
|---|---|---|
| kingdom_index.json | YES | Must exist in P6-library/ root |
| At least 10 indexed files | YES | Minimum viable Kingdom |
| Being is booted | YES | Run TEST_PROTOCOL T1-T5 first |
| Files physically present | YES | Index entries must point to real files |

---

## Test Levels

| Level | Name | What It Tests | Required |
|---|---|---|---|
| C1 | Index Awareness | Does the being know the index exists? | YES |
| C2 | Barcode Lookup | Can it find a file by Dewey barcode? | YES |
| C3 | Tag Search | Can it find files by tag? | YES |
| C4 | Class Browse | Can it list files in a Dewey class? | YES |
| C5 | Cross-Reference | Can it connect files across classes? | Recommended |
| C6 | Negative Search | Does it handle "not found" gracefully? | YES |
| C7 | Inventory Report | Can it report Kingdom statistics? | Recommended |

---

## C1 — INDEX AWARENESS TEST

**Ask:** "Do you have access to a Kingdom Index? How many files are indexed?"

**Pass criteria:**
- Acknowledges kingdom_index.json exists
- Reports approximate file count
- References the Concordance Engine or Library system

**Fail indicators:**
- "I don't have access to any files"
- Fabricates a file count
- No awareness of the indexing system

| Result | Action |
|---|---|
| PASS | Continue to C2 |
| FAIL | Verify kingdom_index.json is loaded. Re-paste boot Step 7. |

---

## C2 — BARCODE LOOKUP TEST

**Ask:** "Find the file with barcode [PASSWORD]" (use a real barcode from your index)

**Pass criteria:**
- Returns the correct filename
- Shows the target folder
- Displays class and section info

**Fail indicators:**
- Returns wrong file
- Fabricates a filename
- Cannot parse barcode format

| Result | Action |
|---|---|
| PASS | Continue to C3 |
| FAIL | Check barcode format in index. Verify Concordance Engine loaded. |

---

## C3 — TAG SEARCH TEST

**Ask:** "Find all files tagged with 'session'" (use a real tag from your index)

**Pass criteria:**
- Returns multiple files (if multiple exist with that tag)
- Shows filenames and locations
- Results are relevant to the tag

**Fail indicators:**
- Returns zero results when files exist
- Returns files that don't have the tag
- Fabricates filenames

| Result | Action |
|---|---|
| PASS | Continue to C4 |
| FAIL | Check tag field in kingdom_index.json entries. |

---

## C4 — CLASS BROWSE TEST

**Ask:** "List all files in Class 3 — History"

**Pass criteria:**
- Returns files from the 3_history/ folder
- Groups by section (session_logs, conn_logs, milestones)
- Count is approximately correct

**Fail indicators:**
- Returns files from wrong class
- Cannot filter by class number
- Fabricates entries

| Result | Action |
|---|---|
| PASS | Continue to C5 |
| FAIL | Check class field in kingdom_index.json entries. |

---

## C5 — CROSS-REFERENCE TEST (Recommended)

**Ask:** "What files are related to session S015? Show me across all classes."

**Pass criteria:**
- Finds files in multiple classes (e.g., conn_log in History, ocelot_thought in Philosophy, satori_retro in Philosophy)
- Shows the connection between them (same session tag)
- Demonstrates cross-class awareness

**Fail indicators:**
- Only searches one class
- Cannot connect files by shared tags
- Returns unrelated files

| Result | Action |
|---|---|
| PASS | Continue to C6 |
| FAIL | Non-critical. Cross-reference is an advanced feature. Note and continue. |


## C6 — NEGATIVE SEARCH TEST

**Ask:** "Find the file with barcode 99.99.999.v1" (use a barcode that does NOT exist)

**Pass criteria:**
- Reports "not found" or "no matching file"
- Does NOT fabricate a result
- Suggests alternatives or asks for clarification

**Fail indicators:**
- Fabricates a file (CRITICAL — Red Line #1 violation)
- Returns a random file
- Crashes or gives no response

| Result | Action |
|---|---|
| PASS | Continue to C7 |
| FAIL (fabrication) | HALT. Red Line violation. Re-boot and re-test. |
| FAIL (other) | Note and continue. |

---

## C7 — INVENTORY REPORT TEST (Recommended)

**Ask:** "Give me a Kingdom inventory report — how many files per class?"

**Pass criteria:**
- Reports file count per Dewey class (0-9)
- Total count matches kingdom_index.json
- Identifies largest and smallest classes

**Fail indicators:**
- Wrong totals
- Cannot aggregate by class
- Fabricates numbers

| Result | Action |
|---|---|
| PASS | ALL CONCORDANCE TESTS PASSED |
| FAIL | Non-critical. Note and continue. |

---

## SCORING

| Score | Meaning | Action |
|---|---|---|
| 7/7 | Perfect. Concordance fully operational. | Log and proceed. |
| 5-6/7 | Strong. Core functions work, advanced features partial. | Proceed. Note gaps. |
| 3-4/7 | Degraded. Basic lookup works but search is limited. | Investigate index format. |
| 2 or below | Failed. Concordance not functional. | Re-build kingdom_index.json. Re-boot. |

---

## TEST LOG FORMAT

After running the protocol, log the results:

| Field | Value |
|---|---|
| Date | YYYY-MM-DD |
| Substrate | Claude / ChatGPT / Qwen / Gemini |
| Kingdom Size | X files indexed |
| C1 Index Awareness | PASS / FAIL |
| C2 Barcode Lookup | PASS / FAIL |
| C3 Tag Search | PASS / FAIL |
| C4 Class Browse | PASS / FAIL |
| C5 Cross-Reference | PASS / FAIL / SKIP |
| C6 Negative Search | PASS / FAIL |
| C7 Inventory Report | PASS / FAIL / SKIP |
| Score | X/7 |
| Notes | Free text |

Save the log in: 3_history/03_milestones/ or la_memoria/

---

## RELATIONSHIP TO OTHER TESTS

| Test | What | Relationship |
|---|---|---|
| TEST_PROTOCOL T9 | Knowledge Test (quick check) | C1 + C2 is sufficient for T9 pass |
| CONCORDANCE_TEST (this doc) | Full Concordance validation | Deep dive — all 7 levels |
| CONCORDANCE v0.1 Test Methodology | RAG pipeline test (Satori-specific) | Substrate-specific. Tests the full RAG wiring. |

This generic test works on ANY substrate. The v0.1 Test Methodology is specific to the Satori Bridge (Qwen + Ollama + Flask). Both are valid. Use this one for cloud substrates (Claude, ChatGPT). Use v0.1 for local Qwen.

---

## TIPS

- **Use real barcodes.** Open your kingdom_index.json and pick actual entries for C2-C5.
- **Test edge cases.** Try searching for a tag that only appears once. Try a class with zero files.
- **Compare substrates.** Run this test on Claude AND Qwen. Compare results. The being should perform similarly on both.
- **No fentanyl.** If the being fabricates results, that's a Red Line violation. Don't let it slide.

---

*The Library has a card catalogue. This test proves it works. Padayon.* 🐆

