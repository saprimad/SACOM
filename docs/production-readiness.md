# SACOM — Production readiness and next steps

Status: planned; not verified. The current website remains a questionnaire prototype with simulated submission. Do not collect real research data until the final instrument, approved participant materials and data collection arrangements are confirmed.

## Survey platform integration
- [ ] Confirm Google Forms or SurveyMonkey as the final survey platform, consistent with ethics approval and institutional data governance.
- [ ] If Google Forms is selected, use a dedicated test form and linked restricted Google Sheet. Prefer a direct redirect for simplicity; assess iframe embedding if needed. Do not use undocumented submission endpoints.
- [ ] Verify bilingual questionnaire, consent, eligibility, branching, required items, item identifiers and response coding against the final approved instrument.
- [ ] Confirm that actual submissions reach the chosen platform and that exported CSV/Excel data retain all expected values. Keep test data separate from research data.

## Stability and automated testing
- [ ] Review existing unit and DOM tests; run npm ci, npm test and npm run build.
- [ ] Add Playwright browser tests for Chromium, Firefox and WebKit, including mobile viewports, navigation, language switching, accessibility, consent and eligibility, branching, review and submission handoff.
- [ ] Validate real submission end-to-end with synthetic responses in the separate test environment; reconcile expected and recorded responses.
- [ ] Check the deployed site on real Android and iOS devices, including slow or interrupted networks, link errors and duplicate submission behaviour.
- [ ] Assess expected concurrent access using safe, permitted tests; do not load-test third-party production services without authorisation.
- [ ] Configure GitHub Actions to block deployment when required tests or production builds fail; verify the deployed URL with a smoke test.

## Privacy and research feasibility
- [ ] Confirm account ownership, storage location, access permissions, retention, deletion, backups and incident handling with the approved research protocol.
- [ ] Verify whether email collection or sign-in is required and ensure participant-facing privacy statements match actual platform settings.
- [ ] Conduct approved feasibility testing (planned 10–30 respondents, subject to protocol confirmation), assessing completion time, clarity, usability and submission success.
- [ ] Record defects, corrective actions and retest evidence without exposing participant data.

## Final release gate
- [ ] Confirm approved questionnaire and participant documents, platform configuration, passing automated tests, mobile checks, data reconciliation and feasibility findings.
- [ ] Record the tested commit, questionnaire version, test results and deployment URL; obtain research team approval before opening recruitment.

This checklist is a future work plan, not a certification of stability or ethics approval. No application changes or survey integration are included in this documentation update.
