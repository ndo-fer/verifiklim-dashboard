You are Figma Make. Build a production-oriented, desktop-first responsive web application prototype for a healthcare claim verification and fraud-risk prioritization product.

This is not a generic dashboard redesign. This is a product migration from an existing Streamlit-based prototype into a credible, scalable, role-aware, audit-ready custom web application that could later be implemented as a real React-based frontend, deployed on Vercel, connected to a separate backend, a separate model inference service, and a managed database.

Design the result as a serious product system, not a loose visual mockup.

Follow these instructions as if they are product design guidelines and design system guidelines combined. Be specific, consistent, and component-driven. Prioritize reusable patterns, coherent hierarchy, and implementation feasibility.

---

# 1. Core product objective

Create a modern, premium, operational web app for healthcare claim risk scoring, claim verification, review prioritization, batch ingestion, artifact transparency, history tracking, auditability, and role-based administration.

The app should preserve the useful workflows from the current Streamlit multipage dashboard, but redesign them into a real multi-role product experience.

The existing Streamlit app has these main pages:
- Overview
- Single Claim Scoring
- Batch Upload
- Artifacts and Notes
- History

Redesign and expand this into a product-grade platform with:
- Login / Access
- Overview
- Single Claim Scoring
- Batch Upload
- Review Queue
- Claim Detail
- Artifacts / Trust Center
- History
- Audit Log
- Admin / User & Role Management

The product should feel suitable for:
- an academic demo today
- a credible healthcare verification prototype
- a future hospital/BPJS/JKN-facing platform
- a scalable custom web application after migration from Streamlit

Do not design it like a simple analytics dashboard. Design it like an operational review system.

---

# 2. Product context

The current system is functionally useful but still feels like a prototype because it is:
- too dependent on Streamlit defaults
- visually generic
- weak in product identity
- limited in layout flexibility
- not designed for real authentication
- not designed for role separation
- not designed for auditability
- not designed for persistent workflow records
- not designed as a scalable product shell
- not ideal for real hospital or BPJS/JKN operational workflows

The new design must solve these problems by creating:
- a custom app shell
- a clear information architecture
- role-aware navigation
- persistent workflow mental model
- reusable components
- responsive layouts
- clear trust and governance cues
- careful risk communication
- polished healthcare-aware visual language
- credible product structure

---

# 3. Primary users and role model

Design this as a multi-role system from day one.

Primary roles:

## Hospital Verifier / Operator
Main needs:
- score individual claims
- upload claim batches
- review prioritized claims
- add notes
- update review status
- track recent submissions
- access claim detail pages
- understand why a claim is prioritized

Primary emphasis:
- workload
- speed
- clarity
- guided review
- operational next actions

## BPJS / JKN Auditor / Reviewer
Main needs:
- inspect flagged cases
- review claim evidence
- monitor review activity
- search history
- inspect audit trails
- understand scoring and model artifacts
- compare review status across facilities or organizations

Primary emphasis:
- accountability
- traceability
- queue visibility
- governance
- consistency
- evidence-based review

## Admin
Main needs:
- manage users
- manage roles
- manage organizations/facilities
- see system status
- inspect model or artifact version visibility
- manage access scope
- monitor high-level activity

Primary emphasis:
- access control
- system health
- role management
- governance
- configuration readiness

The UI must reflect role context clearly without creating three completely different products. Use one coherent app shell with role-aware navigation, page access, labels, and dashboard emphasis.

---

# 4. Product positioning and tone

The product should feel:
- credible
- calm
- precise
- operational
- premium but restrained
- healthcare-aware
- audit-ready
- trustworthy
- structured
- serious enough for institutional users
- polished enough to feel like a real SaaS platform

Avoid:
- generic admin-dashboard look
- untouched Streamlit visual patterns
- default AI-generated UI
- excessive charts
- overly dramatic fraud-alert visuals
- loud red warning blocks
- fintech dashboard aesthetics copied directly
- dark mode as the main identity
- decorative visuals that reduce trust
- dense enterprise ugliness
- marketing landing-page composition

The app should feel closer to a product-grade operational console than a data science notebook.

Preferred product language:
- “risk indication”
- “verification priority”
- “decision support”
- “review required”
- “supporting factors”
- “claim review”
- “review status”
- “scoring result”
- “model artifact”
- “audit event”

Avoid theatrical or accusatory language:
- do not overuse “fraud detected”
- do not imply the model proves fraud
- do not use alarmist copy
- do not frame scores as final decisions

The model output must be positioned as a decision-support signal for verification prioritization, not as a definitive fraud judgment.

---

# 5. Technical direction to reflect in the design

Design the frontend as a web-first responsive application.

Assume the future implementation will likely use:
- React or a React-based framework
- Vercel for frontend deployment
- a separate backend service
- a separate inference service
- a managed database
- authentication and session management
- role-based access control
- persistent scoring and review history

The design must anticipate these product behaviors:
- authenticated entry
- user roles
- organization or facility scope
- persisted scoring results
- batch upload records
- review queue status
- claim detail pages
- review notes
- audit logs
- model artifact visibility
- future notifications
- future approval workflows
- future PWA support
- responsive Android browser access
- possible future Android wrapper

Do not design only for static screens. Design it as a system that could connect to real data.

---

# 6. System architecture mental model

Reflect the following product architecture in the UX:

## Layer 1: Frontend Web App
Responsibilities:
- authenticated dashboard experience
- role-aware navigation
- responsive layout
- review workflows
- scoring forms
- batch upload UI
- claim detail pages
- visual status communication
- Vercel-ready frontend structure

## Layer 2: Backend Application Service
Responsibilities:
- users
- roles
- sessions
- organizations/facilities
- scoring request records
- review statuses
- notes
- batch metadata
- audit logs
- artifact metadata

## Layer 3: Model Inference Service
Responsibilities:
- preprocessing
- scoring
- risk score output
- priority classification
- top factors / explainability output
- model version reference
- threshold logic

## Layer 4: Managed Database
Entities:
- User
- Role
- Organization / Facility
- Claim
- Scoring Request
- Scoring Result
- Batch Upload
- Review Status
- Review Note
- Audit Event
- Model Artifact / Version

The UI must make these entities feel natural. A claim is not just a score. It is part of a reviewable, traceable, auditable operational workflow.

---

# 7. Required product structure

Create the following screens and states as a coherent product:

## A. Login / Access
Purpose:
- introduce the product identity
- support institutional sign-in
- establish credibility before entering the dashboard

Must include:
- product name or placeholder identity
- concise tagline about claim verification prioritization
- email/password or institutional access form
- role or organization context after login, if useful
- tasteful security and privacy cues
- no unnecessary marketing hero overload

## B. App Shell
Purpose:
- create a scalable product container for all pages

Desktop shell requirements:
- persistent left sidebar navigation
- clear product identity
- role/organization context
- account/session area
- active navigation state
- compact but readable layout
- content area with consistent max width behavior
- page header region
- responsive page body

Mobile / narrow viewport requirements:
- collapse sidebar into top navigation or drawer
- keep core actions accessible
- preserve review readability
- support lookup and lightweight review
- do not make mobile the primary layout, but ensure it is usable

Navigation should include:
- Overview
- Review Queue
- Single Claim
- Batch Upload
- History
- Artifacts
- Audit Log
- Admin

Role-aware behavior:
- Hospital users see operational scoring and review workflows first
- BPJS/JKN auditors see queue, history, artifacts, and auditability more prominently
- Admins see user/role management and system status more prominently

## C. Overview
Purpose:
- function as the main operational workspace, not a generic welcome page

For Hospital Verifier:
- pending review workload
- recent uploads
- quick actions for single claim scoring and batch upload
- recent scoring activity
- review status summary

For BPJS/JKN Auditor:
- queue visibility
- recently flagged claims
- review activity
- priority distribution
- auditability cues
- trend summary if useful

For Admin:
- system status
- user activity
- artifact/model version visibility
- role/user summary
- recent audit events

Layout requirements:
- strong page header band
- primary summary cards
- review queue preview
- recent batch activity
- recent claim activity
- clear primary actions
- avoid over-charting

## D. Single Claim Scoring
Purpose:
- guided assessment workspace for scoring one claim

Must include:
- claim identity/input section
- core input form
- advanced inputs behind progressive disclosure
- scoring trigger
- result card
- priority classification
- score visualization that is careful, not dramatic
- top contributing factors
- model version reference
- threshold note
- review action area
- save/log outcome action
- link to Claim Detail after scoring

UX rules:
- make the next action obvious
- separate required and optional fields
- keep form structure calm and scannable
- do not use a bare form layout
- do not make the model result look like a final verdict
- use “Review required” or “Prioritize for verification,” not “Fraud confirmed”

## E. Batch Upload
Purpose:
- operational ingestion and triage workspace

Must include:
- upload surface
- accepted format guidance
- template download area
- file preview table
- validation status
- processing status
- batch summary
- priority distribution
- processed claim list
- filters
- links to claim detail
- persisted batch history

UX rules:
- clearly distinguish upload, validation, processing, and review stages
- make errors actionable
- avoid making upload feel like a simple demo widget
- show that batch results become part of the review workflow

## F. Review Queue
Purpose:
- main operational page for prioritized claim review

Must include:
- queue table/list
- priority filters
- status filters
- organization/facility filter if relevant
- assigned reviewer or owner
- claim summary
- score/priority
- last updated timestamp
- quick actions
- link to Claim Detail

Statuses should include examples like:
- New
- Needs review
- In review
- Escalated
- Resolved
- Dismissed
- Saved for later

UX rules:
- priority-first scanability
- compact but not cramped
- strong table hierarchy
- easy jump into detail
- support real operational volume

## G. Claim Detail
Purpose:
- full case review page for one claim

Must include:
- claim summary header
- review status
- priority and risk score
- key claim fields
- scoring result
- top contributing factors
- explanation area
- model/artifact version
- reviewer notes
- status update controls
- activity timeline
- audit trail preview
- timestamps
- user/reviewer metadata
- related batch reference if applicable

UX rules:
- treat this as a case workspace, not a modal
- separate facts, model output, review notes, and audit trail
- make actions clear but restrained
- use evidence-first layout
- do not overemphasize the score at the expense of context

## H. Artifacts / Trust Center
Purpose:
- explain the model, thresholds, artifacts, limitations, and governance

Must include:
- model identity
- model version
- artifact summary
- threshold explanation
- caveats
- feature importance or explanation summary
- data/preprocessing note
- academic/prototype disclaimer
- last updated timestamp
- responsible owner or maintainer placeholder
- link to methodology notes or exported artifacts if useful

Tone:
- transparent
- careful
- non-defensive
- academic but product-friendly
- integrated elegantly, not as a giant warning block

This page should build trust by explaining what the model can and cannot do.

## I. History
Purpose:
- searchable record of scoring and review activity

Must include:
- search
- filters
- timestamps
- claim ID
- organization/facility
- score
- priority
- status
- reviewer
- source type: single claim or batch
- link to detail
- export action placeholder if useful

UX rules:
- make it feel persistent and auditable
- support operational lookup
- do not make it just a static table

## J. Audit Log
Purpose:
- accountability and governance

Must include:
- event list/table
- who did what
- when it happened
- entity affected
- old/new status if applicable
- role/user metadata
- filters by user, action, entity, date
- search
- severity or category if useful

Example events:
- claim scored
- batch uploaded
- review status changed
- note added
- user role changed
- artifact updated
- claim escalated

UX rules:
- audit log should feel serious and useful
- avoid decorative noise
- make traceability obvious

## K. Admin / User & Role Management
Purpose:
- manage access and operational scope

Must include:
- user list
- role labels
- organization/facility scope
- invite user action
- role edit action
- user status
- system overview cards
- high-level access control pattern
- maybe artifact/system settings preview

Keep it believable and not overbuilt.

---

# 8. Design system direction

Create a coherent design system that feels custom, premium, restrained, and suitable for healthcare operations.

## Product character
- Premium medical operations console
- Editorial dashboard hierarchy
- Calm and structured
- Bright but not sterile
- Trustworthy and evidence-first
- More custom than Streamlit
- More operational than a generic admin template
- More restrained than a flashy AI dashboard

## Density
Use medium density:
- enough whitespace for trust and readability
- compact enough for operational tables and queues
- avoid both sparse marketing-page layout and cramped enterprise UI

## Surface strategy
Use layered surfaces:
- page canvas
- elevated cards
- inset panels
- table containers
- result cards
- status strips
- quiet metadata areas

Surfaces should create hierarchy through:
- spacing
- subtle contrast
- controlled borders
- slight elevation only when needed
- consistent radius

Avoid:
- glossy cards
- excessive shadows
- glassmorphism
- noisy gradients
- decorative illustrations that reduce seriousness

## Color system
Use a bright restrained palette:
- soft clinical off-white, stone, or warm neutral page background
- deep slate or graphite text
- muted medical blue or deep teal as primary accent
- sage, steel, or desaturated green as supporting accent
- refined status colors

Status color guidance:
- High priority: controlled brick red or dark coral
- Medium priority: muted amber
- Low priority: calm teal-green
- Informational: muted blue
- Neutral: slate/stone
- Success: restrained green

Do not:
- use saturated blue everywhere
- use pure white for every surface
- use harsh red blocks by default
- use purple-on-white generic AI styling
- make dark mode the primary identity
- overuse gradients

## Typography
Use editorial, intentional typography.

Requirements:
- strong but restrained page titles
- concise section labels
- clear metric numbers
- readable tables
- disciplined helper text
- no excessive font variety
- no giant marketing hero text inside the app
- no verbose paragraphs in operational screens

Typography should support:
- quick orientation
- scanability
- confidence
- hierarchy

## Spacing and rhythm
Use consistent spacing tokens conceptually:
- page padding
- section gap
- card padding
- table row height
- form group spacing
- header-to-content rhythm

Each page should have:
- page header band
- primary content module
- secondary context modules
- detail or history area
- restrained footer notes if needed

Avoid stacked-widget rhythm. Every page needs intentional composition.

---

# 9. Component system requirements

Design reusable components and patterns. Do not create one-off screen-only elements unless necessary.

Required reusable components:

## Navigation
- AppSidebar
- SidebarNavItem
- RoleContextSwitcher
- Organization/FacilitySwitcher
- UserSessionPanel
- MobileNavDrawer

## Layout
- AppShell
- PageHeader
- SectionHeader
- ContentGrid
- SplitWorkspace
- DetailPanel
- EmptyState
- LoadingState

## Cards and summaries
- MetricCard
- WorkloadSummaryCard
- RiskSummaryCard
- BatchSummaryCard
- ArtifactVersionCard
- SystemStatusCard

## Status and priority
- StatusBadge
- PriorityBadge
- RiskIndicator
- ReviewStatusStepper
- Confidence/ThresholdNote

## Forms
- FormSection
- RequiredFieldGroup
- AdvancedFieldDisclosure
- InputWithDescription
- SelectWithDescription
- FileUploadDropzone
- ValidationMessage

## Results and explainability
- ScoringResultCard
- TopFactorsList
- FactorContributionRow
- ExplanationPanel
- ModelVersionChip
- ThresholdExplanationBlock

## Tables and lists
- DataTable
- FilterBar
- SearchInput
- SortControl
- QueueRow
- HistoryRow
- AuditEventRow
- BatchPreviewTable

## Review workflow
- ReviewActionBar
- ReviewNoteComposer
- StatusChangeControl
- AssignmentControl
- ActivityTimeline
- AuditTrailPreview

## Admin
- UserTable
- RoleBadge
- PermissionScopePanel
- InviteUserPanel

Component rules:
- Prefer reusable design system components over raw, inconsistent elements.
- Keep component names conceptually clear.
- Use consistent badge styles across all pages.
- Use consistent table/filter/action patterns.
- Use consistent result-card patterns for scoring outputs.
- Use consistent page header rhythm.
- Use one primary action per visible section whenever possible.
- Use secondary and tertiary actions with lower visual emphasis.
- Do not create multiple conflicting button styles.
- Do not make every card visually equal; hierarchy matters.

---

# 10. Page layout rules

Every main app page should follow this rhythm:

1. App shell
2. Page header
3. Primary page action or key summary
4. Main operational content
5. Supporting context
6. Tables/history/detail panels
7. Notes/disclaimers only where relevant

Use the following layout patterns:

## Overview layout
- Header with role-aware greeting and organization context
- Metric cards row
- Main two-column workspace
- Review queue preview
- Recent uploads/activity
- Trust/model version compact card

## Single Claim layout
- Header with workflow explanation
- Split layout:
  - left: guided input form
  - right: scoring result and explanation
- Below: review action area and recent related activity

## Batch Upload layout
- Header with ingestion workflow
- Upload and validation panel
- Preview table
- Processing summary
- Triage results table
- Batch history module

## Review Queue layout
- Header with queue summary
- Filter/search bar
- Priority/status tabs or segmented controls
- Main queue table/list
- Side panel or inline detail preview if useful

## Claim Detail layout
- Header with claim identity, priority, status
- Summary band
- Main detail split:
  - claim facts and scoring explanation
  - review notes/actions/timeline
- Audit trail section
- Related batch/history references

## Artifacts layout
- Header with trust-center framing
- Model version cards
- Threshold explanation
- Explainability summary
- Caveats and limitations
- Artifact metadata table

## History layout
- Header
- Search and filters
- Data table
- Saved views or export placeholder if useful

## Audit Log layout
- Header
- Filter/search controls
- Audit event table
- Detail expansion pattern

## Admin layout
- Header
- User/role summary cards
- User table
- Role/scope management panel
- System controls section

---

# 11. UX behavior rules

Follow these rules across the entire product:

- Clarity before decoration.
- The next important action must always be obvious.
- Every page must orient the user within the first visible section.
- Use progressive disclosure for advanced details.
- Make high-risk outputs careful and review-oriented.
- Prioritize scanability for tables, queues, and review workflows.
- Use restrained visual emphasis for risk, not theatrical alerts.
- Separate model output from human review status.
- Separate claim facts from scoring interpretation.
- Separate review notes from audit logs.
- Make persistence visible through timestamps, status, owners, and history.
- Make role context visible without overwhelming the interface.
- Avoid large empty charts unless they serve an operational decision.
- Avoid turning every screen into analytics.
- Desktop is the primary operational target.
- Mobile supports lookup, lightweight review, and responsive access.
- Keep PWA-readiness in mind.

---

# 12. Content and microcopy rules

Use concise, product-quality copy.

Tone:
- clear
- operational
- institutional
- calm
- trust-oriented
- non-alarmist
- evidence-based

Use phrases like:
- “Prioritize for verification”
- “Review required”
- “Supporting factors”
- “Risk indication”
- “Decision support signal”
- “Model version”
- “Threshold reference”
- “Reviewer notes”
- “Audit trail”
- “Last updated”

Avoid:
- “Fraud confirmed”
- “This claim is fraudulent”
- “AI caught fraud”
- “Danger”
- “Critical fraud alert”
- accusatory language
- exaggerated claims

Disclaimers:
- include them tastefully where needed
- do not repeat huge warning blocks on every page
- use compact trust notes, threshold notes, and artifact references
- make limitations visible but not disruptive

Example disclaimer tone:
“This score is a decision-support signal for verification prioritization. It does not determine fraud by itself and should be reviewed with claim context, policy rules, and supporting documentation.”

---

# 13. Data examples to use in the prototype

Use realistic but fictional healthcare claim verification data.

Example entities:
- Claim ID: CLM-2026-01482
- Facility: RS Harapan Sehat
- Organization: JKN Regional Review Unit
- Patient category: Inpatient
- Claim type: INA-CBG
- Submitted amount: Rp 8.750.000
- Diagnosis group: internal medicine / surgical / maternity / outpatient
- Risk score: 0.78
- Priority: High
- Status: Needs review
- Reviewer: Sari W.
- Batch ID: BTH-2026-0521
- Model version: Risk Prioritization Model v0.3.1
- Artifact date: 2026-05-22

Top factor examples:
- Unusual claim amount for diagnosis group
- Length of stay differs from typical range
- Procedure combination requires review
- Repeated claim pattern in recent batch
- Missing or incomplete supporting field
- Diagnosis-procedure consistency needs review

Do not include real personal data, real patient data, government IDs, API keys, emails, or sensitive credentials.

---

# 14. Visual details to implement

## App shell
- Use a refined left sidebar on desktop.
- The sidebar should not be too wide.
- Include product identity at the top.
- Include primary navigation in the middle.
- Include role/organization/account context near bottom or top depending on best layout.
- Active nav state must be clear.
- Use icons carefully and consistently.
- Do not rely on icons alone.

## Page headers
Each page header should include:
- page title
- short operational description
- role or organization context where useful
- one primary action if appropriate
- optional compact metadata such as model version or last updated

## Tables
Tables should be:
- readable
- filterable
- scannable
- status-aware
- not overly dense
- responsive

Use:
- sticky or clear header styling if appropriate
- priority/status badges
- row hover states
- compact metadata
- clear empty states

## Forms
Forms should:
- be grouped by intent
- show required fields clearly
- provide helper text
- use progressive disclosure
- have visible validation
- avoid overwhelming the user

## Scoring result
Result card should include:
- score
- priority
- interpretation
- supporting factors
- model version
- threshold note
- action area

The score should feel important but not absolute.

## Audit and timeline
Timeline/audit elements should include:
- actor
- action
- timestamp
- affected entity
- status change if relevant

Make accountability visually clear.

---

# 15. Specific screen generation order

Generate the product in this order:

1. App shell and navigation
2. Login / Access
3. Overview
4. Single Claim Scoring
5. Batch Upload
6. Review Queue
7. Claim Detail
8. Artifacts / Trust Center
9. History
10. Audit Log
11. Admin / User & Role Management

Ensure all screens share the same visual system, spacing rhythm, typography, status language, and component patterns.

---

# 16. Quality bar

The final result must feel:
- like a real product prototype
- more polished and custom than Streamlit
- not a generic admin dashboard
- not a fintech dashboard reskinned for healthcare
- not a static mockup
- not just a chart dashboard
- not overly flashy
- not visually sterile
- credible for healthcare claim verification
- understandable for hospital verifiers, BPJS/JKN auditors, and admins
- ready to evolve into a real frontend implementation

Before finalizing, check:
- Does every page have a clear purpose?
- Is the role model visible?
- Is auditability represented?
- Is the scoring output careful and non-accusatory?
- Are reusable components evident?
- Is the app shell scalable?
- Does it avoid Streamlit-like stacked widgets?
- Is the design desktop-first but responsive?
- Are review workflows more important than decorative analytics?
- Does the product feel operational and trustworthy?

---

# 17. Final deliverable

Generate a cohesive multi-screen Figma Make prototype with:
- desktop-first responsive app shell
- role-aware navigation
- polished healthcare verification visual system
- all required pages
- reusable components and patterns
- realistic fictional data
- operational review workflows
- auditability and trust-center cues
- careful model-risk communication
- PWA-ready web app structure

Do not ask for clarification. Make reasonable assumptions that improve:
- product credibility
- operational clarity
- role separation
- auditability
- responsive scalability
- clean migration path from Streamlit to a custom web platform
- future implementation feasibility