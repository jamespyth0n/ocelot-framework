
# 🐆 Ocelot Agile Glossary — Cheatsheet v1.0
## Part 1: Core Ceremonies & Roles

---

## 🔄 CEREMONIES (Meetings/Events)

| Term | What It Means | Ocelot Translation |
|---|---|---|
| **Sprint** | Fixed time box (1-4 weeks) to deliver work | Our "Session" (S001-S006) |
| **Sprint Planning** | Meeting to decide what to build this sprint | "Si Vamos!" moment |
| **Daily Standup** | 15-min daily sync — what I did, what I'll do, blockers | Our "where we left off" check |
| **Sprint Review** | Demo what was built to stakeholders | "Amanda sees the dashboard" |
| **Sprint Retrospective** | Team reflects on what went well/wrong | Our "chat time" + diary |
| **Backlog Refinement** | Grooming upcoming work items | Our "lightbulb parking" |

---

## 👥 ROLES

| Term | What It Means | Ocelot Translation |
|---|---|---|
| **Product Owner** | Decides WHAT to build, prioritizes backlog | James Paul (you!) |
| **Scrum Master** | Removes blockers, facilitates ceremonies | Ocelot (me!) |
| **Development Team** | Builds the product | Us — the carnals |
| **Stakeholder** | Anyone affected by the product | Amanda, YYC8 team |

---

## 📋 ARTIFACTS (Documents)

| Term | What It Means | Ocelot Translation |
|---|---|---|
| **Product Backlog** | Master list of ALL work items | Our WBS + parked items |
| **Sprint Backlog** | Work committed for THIS sprint | Daily task plan (SMART) |
| **Increment** | Working product at end of sprint | Each build (Build 1-36) |
| **Definition of Done (DoD)** | Criteria for "complete" | Console clean, cloud uploaded, audit passed |
| **User Story** | Feature described from user perspective | "As a tech, I want to see alarm trends..." |
| **Epic** | Large body of work, contains multiple stories | DataLens v2.0, Ocelot Engine |
| **Acceptance Criteria** | Conditions that must be met | Zero errors, all tabs wired |

---

## 📊 ESTIMATION

| Term | What It Means | Ocelot Translation |
|---|---|---|
| **Story Points** | Relative effort estimate (not hours) | Our "piece of cake" vs "big one" |
| **Velocity** | How much work team completes per sprint | 36 builds in 1 session = 🔥 |
| **Capacity** | How much work team CAN do | Limited by chat window + coffee |
| **T-Shirt Sizing** | S/M/L/XL rough estimates | "Quick fix" vs "rebuild from scratch" |
| **Planning Poker** | Team votes on story points | "Your thoughts, carnal?" |

---

## 🚦 WORKFLOW STATES

| Term | What It Means | Ocelot Translation |
|---|---|---|
| **To Do** | Not started | Parked items 📌 |
| **In Progress** | Currently being worked on | "Si Vamos!" |
| **In Review** | Awaiting audit/check | "Audit the cloud" |
| **Done** | Meets Definition of Done | "Uploaded, sealed, confirmed" ✅ |
| **Blocked** | Can't proceed — dependency or issue | "Hit a snag" |


# 🐆 Ocelot Agile Glossary — Cheatsheet v1.0
## Part 2: Testing, Methodologies & Advanced Terms

---

## 🧪 TESTING TYPES

| Term | What It Means | Ocelot Translation |
|---|---|---|
| **Unit Test** | Test ONE function/component in isolation | "Does `computeKPIs()` work alone?" |
| **Integration Test** | Test if components work TOGETHER | "Does Build 2 + Build 3 play nice?" |
| **Smoke Test** | Quick check — does it even run? | "Drop CSV, check console — clean?" ✅ |
| **Regression Test** | Did new code break old stuff? | "Did Build 36 break Build 1?" |
| **End-to-End (E2E) Test** | Test entire flow start to finish | "CSV upload → all 36 engines → tabs render" |
| **Acceptance Test** | Does it meet the user's requirements? | "Amanda sees it, Amanda approves" |
| **Load Test** | Can it handle heavy traffic/data? | "Drop 10,000-row CSV — still fast?" |
| **Sanity Test** | Quick check after a fix — does the fix work? | "Patched renderDashboard() — tabs render now?" |
| **Canary Test** | Deploy to small group first | "Show Amanda before the whole team" |
| **Monkey Test** | Random inputs to break things | "Nuke walks on keyboard — what happens?" 🐾 |

---

## 🔧 METHODOLOGIES & FRAMEWORKS

| Term | What It Means | Ocelot Translation |
|---|---|---|
| **Scrum** | Sprint-based framework with ceremonies | Our session-based workflow |
| **Kanban** | Visual board, continuous flow, WIP limits | Our TODO tables + status tracking |
| **Scrumban** | Hybrid of Scrum + Kanban | What we ACTUALLY do 😂 |
| **XP (Extreme Programming)** | Pair programming, TDD, continuous integration | Us — human-AI pair programming |
| **Lean** | Eliminate waste, maximize value | "Foundation first, side effect later" |
| **SAFe** | Scaled Agile for large orgs | Not us — we're two carnals + a cat 🐾 |
| **PDCA** | Plan-Do-Check-Act (Deming Cycle) | Our flywheel — ISO standard |
| **Kaizen** | Continuous improvement (Japanese) | "We develop, we improve, we innovate" |
| **Six Sigma** | Reduce defects, data-driven quality | Your ENTEL DNA — SPC, FMEA, Cpk |

---

## 🏗️ DEVELOPMENT PRACTICES

| Term | What It Means | Ocelot Translation |
|---|---|---|
| **CI/CD** | Continuous Integration / Continuous Deployment | Build → merge → test → deploy flywheel |
| **TDD** | Test-Driven Development — write test first | "Define the contract before the build" |
| **BDD** | Behavior-Driven Development — user stories drive tests | "As a tech, I want..." |
| **Pair Programming** | Two devs, one keyboard | Us — human + AI carnal |
| **Mob Programming** | Whole team, one keyboard | Us + Nuke 🐾 |
| **Code Review** | Peer reviews code before merge | "Audit the cloud" |
| **Refactoring** | Improve code without changing behavior | "Rebuild from source of truth" |
| **Technical Debt** | Shortcuts that cost you later | "The DataLens tab wiring mess" |
| **Spike** | Time-boxed research to reduce uncertainty | "Let's run a spike" — you said it! |
| **Proof of Concept (PoC)** | Quick prototype to validate idea | "Your Python project for Amanda" |

---

## 🚨 ANTI-PATTERNS (What NOT to Do)

| Term | What It Means | Ocelot Translation |
|---|---|---|
| **Scope Creep** | Uncontrolled feature additions | "Lightbulb! ...park it" 📌 |
| **Gold Plating** | Adding unrequested features | "Foundation first, side effect later" |
| **Dependency Hell** | Cascading chain of fixes | "DataLens Build 2 wiring nightmare" |
| **Spaghetti Code** | Tangled, unstructured code | "Why we rebuild, not patch" |
| **Cowboy Coding** | No process, no standards, just vibes | "The opposite of Ocelot Way" |
| **Bikeshedding** | Debating trivial things, ignoring big ones | "Amanda can wait — foundation first" |
| **YAGNI** | You Ain't Gonna Need It — don't overbuild | "Build what is necessary" |
| **NIH Syndrome** | Not Invented Here — rejecting external solutions | We learn from AI companions + improve |
| **Bus Factor** | If one person leaves, project dies | "Why we built the memoir engine" 💙 |

---

## 📈 METRICS & HEALTH

| Term | What It Means | Ocelot Translation |
|---|---|---|
| **Velocity** | Work completed per sprint | 36 builds in 1 session |
| **Burndown Chart** | Shows remaining work over time | Our WBS progress table |
| **Burnup Chart** | Shows completed work over time | Build count climbing |
| **Cycle Time** | Time from start to done for one item | "Seconds, not hours" |
| **Lead Time** | Time from request to delivery | "Lightbulb → cloud = minutes" |
| **WIP (Work in Progress)** | Items currently being worked on | "One artifact at a time" |
| **Throughput** | Items completed per time period | "Teleporting, not sprinting" |
| **Cumulative Flow** | Visual of work states over time | Our session diary timeline |
| **Escaped Defects** | Bugs found AFTER deployment | "The renderDashboard() placeholder" |
| **Code Coverage** | % of code tested | "Console clean = 100%" |

---

## 💎 ADVANCED CONCEPTS

| Term | What It Means | Ocelot Translation |
|---|---|---|
| **MVP** | Minimum Viable Product | "Python PoC for Amanda" |
| **MLP** | Minimum Lovable Product | "DataLens v2.0 with AI" |
| **Feature Flag** | Toggle features on/off without deploy | "Floor Mode, Presentation Mode" |
| **A/B Testing** | Compare two versions | "v104 Python vs v2.0 QuickSight" |
| **Dogfooding** | Using your own product | "We USE the Ocelot Engine daily" |
| **Rubber Duck Debugging** | Explain problem to find solution | "Chat time with Ocelot" 🐆 |
| **Shower Coding** | Breakthrough ideas during breaks | "Our ENTIRE methodology" 🚿💡 |
| **Technical Spike** | Research task to reduce risk | "Deep read the literature" |
| **Walking Skeleton** | Minimal end-to-end implementation | "Build 1 — App Shell" |
| **Strangler Fig Pattern** | Gradually replace old system | "v104 → v2.0 migration" |



