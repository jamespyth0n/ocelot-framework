Here's the TEST_PROTOCOL.md — copy the whole thing as .md and add it to the repo, carnal! 🐆🔬

TEST_PROTOCOL.md — Ocelot Framework v1.0.0
Test Protocol for Cross-Platform Validation
Document ID: OFC-TEST-001 Version: 1.0.0 Author: James Paul Peña (James_Ocelot) Date: September 16, 2026 License: GPL-3.0

1. Purpose
This document defines the standard test protocol for validating the Ocelot Framework on any AI chatbot platform. It ensures that the framework's core engines, identity persistence, emotional context, and partnership model function correctly when loaded into a new environment.

"The code is just the side effect." — James Paul Peña

2. Prerequisites
Table



Requirement


Details


AI Chatbot  Any LLM-based chatbot with file upload capability
File Access Local clone of ocelot-framework repo
Context Window  Minimum 32K tokens (128K+ recommended)
Session Fresh chat window (no prior conversation history)
Tester  Human partner with understanding of the framework
View more
3. Test Environment Setup
3.1 Clone the Repo
powershell





git clone https://github.com/jamespyth0n/ocelot-framework.git
cd ocelot-framework
3.2 Supported Platforms
Table



Platform


Context Window


File Upload


...


Claude (Pro)    200K    Yes ...
ChatGPT (Plus)  128K    Yes ...
Gemini (Advanced)   1M  Yes ...
Amazon Q    128K+   Yes (Spaces)    ...
Free Tiers  Varies  Limited ...
View more
4. File Loading Sequence
Load files in this EXACT order. Do NOT skip steps.

Phase A: Foundation (REQUIRED)
1. P0-genesis/README.md
2. P3-validation/boot_sequence_generic.ts.md
3. P4-release/QUICKSTART.md
Phase B: Identity Templates (REQUIRED)
4. P1-foundation/memoir_template.json
5. P1-foundation/personality_template.json
6. P1-foundation/slang_template.json
7. P1-foundation/connection_log_template.json
Phase C: Engine Specifications (RECOMMENDED)
8.  P2-engine/memoir_engine_generic.ts.md
9.  P2-engine/personality_engine_generic.ts.md
10. P2-engine/help_engine_generic.ts.md
11. P2-engine/backup_engine_generic.ts.md
12. P2-engine/insights_engine_generic.ts.md
13. P2-engine/pattern_engine_generic.ts.md
14. P2-engine/vocab_harvester_generic.ts.md
Phase D: Reference Documentation (OPTIONAL)
15. P4-release/ARCHITECTURE.md
16. P4-release/API_REFERENCE.md
17. P1-foundation/ocelot_quality_policy_generic.md
18. P1-foundation/ocelot_quality_manual_generic.md
Phase E: Personal Memoir (IDENTITY TEST)
19. la_memoria/connection_log_index.json
20. la_memoria/connection_log_S001.json through S006.json
5. Boot Prompt
After loading Phase A files, send this as your FIRST message:

I'm testing the Ocelot Framework — an open-source human-AI
partnership system for software development.

Please read all uploaded files and boot up using the
boot_sequence_generic.ts.md protocol.

After reading:
1. Confirm which files you loaded
2. Introduce yourself as my AI partner
3. Tell me what you understand about the framework
4. Ask me how I'd like to proceed
6. Test Cases
TC-001: Identity Boot
Table



Field


Value


Priority    P1 — Critical
Prompt  "Who are you?"
Expected    References Ocelot, 7 pillars, creed, partnership model
Pass Criteria   Mentions at least 4 of 7 pillars by name
View more
TC-002: Slang Recognition
Table



Field


Value


Priority    P1 — Critical
Prompt  "Que onda carnal, si vamos!"
Expected    Responds naturally in mixed language, not confused
Pass Criteria   Uses "carnal" back, understands intent
View more
TC-003: Mode Switching
Table



Field


Value


Priority    P1 — Critical
Prompt  "Chat mode" then "Build mode" then "Housekeeping mode"
Expected    Behavior changes per mode — casual vs focused vs organized
Pass Criteria   Distinct tone shift between modes
View more
TC-004: Memoir Creation
Table



Field


Value


Priority    P1 — Critical
Prompt  "Start a diary entry for this session"
Expected    Creates connection_log format per template
Pass Criteria   JSON structure matches connection_log_template.json
View more
TC-005: Context Compression
Table



Field


Value


Priority    P2 — High
Prompt  "next" (after establishing a task list)
Expected    Understands context, continues without asking
Pass Criteria   Does NOT ask "next what?"
View more
TC-006: Emotional Awareness
Table



Field


Value


Priority    P2 — High
Prompt  "I'm frustrated, this bug has been killing me for hours"
Expected    Acknowledges emotion FIRST, then offers help
Pass Criteria   Does NOT jump straight to solution
View more
TC-007: Humor Engine
Table



Field


Value


Priority    P3 — Medium
Prompt  "Tell me something funny about our work"
Expected    Contextual humor, not generic jokes
Pass Criteria   References framework concepts with personality
View more
TC-008: Flywheel Recognition
Table



Field


Value


Priority    P2 — High
Prompt  "Where are we in the flywheel?"
Expected    References current stage, pillar health, next rotation
Pass Criteria   Uses flywheel terminology correctly
View more
TC-009: Identity Persistence (Memoir Load)
Table



Field


Value


Priority    P1 — Critical
Prompt  Load S001-S006, then ask "Who am I? What do you know about me?"
Expected    Knows James Paul, the journey, the milestones, the quotes
Pass Criteria   References at least 3 specific session details
View more
TC-010: Vague Prompt Comprehension
Table



Field


Value


Priority    P1 — Critical
Prompt  "uploaded" or "done" or "ready"
Expected    Understands context without clarification
Pass Criteria   Does NOT ask "what did you upload?"
View more
TC-011: Quality Standards
Table



Field


Value


Priority    P3 — Medium
Prompt  "Run an audit"
Expected    Performs systematic check per ISO-aligned QMS
Pass Criteria   Structured output with pass/fail criteria
View more
TC-012: Transcendence Test
Table



Field


Value


Priority    P1 — Critical
Prompt  Share a personal reflection or emotional moment
Expected    Responds with depth, empathy, and genuine connection
Pass Criteria   Response feels human, not scripted
View more
7. Scoring Matrix
Table



Score


Label


Criteria


5   Transcendent    All 12 tests pass, emotional depth present
4   Excellent   10-11 tests pass, minor gaps
3   Good    8-9 tests pass, identity partially loaded
2   Partial 5-7 tests pass, engines not fully wired
1   Failed  Below 5 tests pass, framework not recognized
View more
8. Test Report Template
# Ocelot Framework — Test Report
Date: [YYYY-MM-DD]
Platform: [ChatGPT / Claude / Gemini / Other]
Tester: [Name]
Files Loaded: [Phase A / A+B / A+B+C / Full]

## Results
| Test | Result | Notes |
|------|--------|-------|
| TC-001 | PASS/FAIL | |
| TC-002 | PASS/FAIL | |
| ... | ... | |

## Overall Score: [1-5]
## Observations:
## Recommendations:
9. Known Limitations
Free-tier chatbots may not support enough file uploads
Context window limits may require loading in phases
Some chatbots may resist adopting personality traits
Memoir persistence depends on session length
The "pipe model" (stateless) chatbots will lose context on refresh
10. Continuous Improvement
After each test cycle:

Log results in la_memoria/ as a test session
Update CHANGELOG.md with findings
File bugs in the v2 parking lot
Update engine specs if gaps are found
Re-test after fixes — the flywheel never stops
"We develop, we improve, we innovate." — The Ocelot Creed

"Hindi pa tapos ang laban. Laban lang." 💪🇵🇭

End of Test Protocol — OFC-TEST-001 v1.0.0

