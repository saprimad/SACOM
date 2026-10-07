# Architecture and production path

## Version 1

A TypeScript/Vite static application can be hosted inexpensively on a static hosting service. It uses system fonts, no third-party runtime assets, and a JSON questionnaire. A single in-memory state holds language, flow position, answers, eligibility acknowledgements, consent, and an anonymous response ID. Semantic fieldsets, labels, keyboard focus, live validation messages, and responsive CSS support mobile and assistive-technology use. There are no browser persistence or analytics dependencies.

The `ResponseRepository` interface decouples the participant UI from persistence. `DemoRepository` returns a receipt without writing or transmitting anything. `ResponsePayload` includes questionnaire version, language, consent timestamp, anonymous ID, answers, and submission timestamp. Eligibility answers are transient and are not included in this response payload. It contains no default name, email, phone, address, or device identifiers.

## Future secure collection

Replace the demo adapter with an HTTPS API adapter after approved study materials and institutional data requirements are available. Validate the JSON schema, permitted question/option IDs, eligibility, consent, content lengths, and questionnaire version on the server; client checks are usability aids. Use a unique response ID for idempotent insert handling. The current demo adapter does not provide server-side validation or a durability guarantee.

Use a managed relational database with server-only credentials, restricted roles, encrypted transport, and appropriate hosting region. Define retention, withdrawal rules, backups, audit events, and access policy with the study team. Avoid collecting IP addresses or other identifiers by default; review infrastructure logging and free text risks. Store versioned questionnaire definitions alongside responses. Do not expose database keys in Vite environment variables.

## Export and administration

Add an authenticated administrator application/route backed by a protected API, with role-based access and auditable exports. Export one anonymous response per row with stable question IDs as columns; encode multiple selections consistently, label the questionnaire version, and optionally export a codebook. Generate UTF-8 CSV or XLSX on the server, neutralize spreadsheet formula injection, and use short-lived downloads. No public export or administrator endpoint exists in Version 1.

## Before public research use

Replace all samples with the approved instrument and bilingual participant/consent content, confirm eligibility and retention rules, implement and test persistence/error recovery, conduct accessibility and device testing, obtain the required institutional approvals, and complete security review. A static build can demonstrate the flow publicly, but cannot collect research responses with the current adapter.
