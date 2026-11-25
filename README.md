# SACOM

Social Acceptance of Cannabis/Marijuana. A mobile-first bilingual academic questionnaire **prototype**, with sample content only. This is not a validated questionnaire or an approved active study.

## Run locally

Requires Node.js 22.12+ (or a compatible current Node release) and npm.

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

Vite prints the local URL (normally http://localhost:5173). Production output is `dist/`.

## Website design

The Apple-inspired SACOM landing page uses spacious typography, original CSS sculptural artwork, responsive feature sections, and English/Bahasa Melayu content. Both landing-page calls to action open the existing participant flow. All visuals are local CSS; the page does not need remote fonts or image services.

## Participant flow

Sample Questionnaire opens the bilingual draft from the 25 November 2026 CVI form. The flow includes participant information, demo consent, four screening items, six questionnaire sections, review, and simulated submission. It contains 80 items including consent and screening. A No answer to C1 skips the dependent Thailand-visit questions.

English and Bahasa Melayu can be changed at any point. Previous/Next and review editing preserve answers in the tab. The section counter tracks position, and the percentage tracks answered required questions. The B1 no-information option is exclusive.

## Privacy and limitations

Responses exist only in tab memory; refreshing or closing the page clears them. No local storage, cookies, analytics, API requests, or database are used by the application. Submission is simulated and answers are cleared after it completes. An anonymous UUID receipt identifies the demo session; it is not a saved response or recovery token. The development server and any future hosting provider may have infrastructure logs; those are outside the questionnaire response model. Do not enter real research data.

The screening criteria and participant information are for this demonstration. Confirm the final materials and ethics approval before recruitment.

## Reviewer tab

The same 80 draft items are available for bilingual review. Ratings follow the form: relevance 1–4, and essentiality, clarity and adequacy 1–3. The tab keeps ratings and comments in memory and can export a CSV to the reviewer’s device. Refreshing clears the tab’s work. The site does not collect reviews.

## Replace the sample questions

Edit `src/questionnaire.json`. Each section has a unique `id`, bilingual `title` and `description`, and `questions`. Questions support `radio`, `checkbox`, and `textarea`, with unique IDs, bilingual labels, and a `required` flag. Choice questions have options containing a stable `value` and bilingual `label`. Keep IDs and values stable within a version and update `version` when the instrument changes. `sampleOnly` labels the current configuration; it does not establish approval. UI information, eligibility, and consent text currently live in `src/main.ts` and must also be reviewed.

## Architecture and validation

See [docs/architecture.md](docs/architecture.md) for storage, export, and administration extension points. `src/core.ts` holds typed models, validation, progress, UUID generation, and the repository contract. `src/main.ts` handles accessible semantic form rendering and session state; `src/styles.css` provides responsive styling. No UI framework is required for this small prototype. Tests cover rules and the bilingual end-to-end DOM flow, including eligibility rejection, required consent, answer persistence, review editing, and simulated receipt.

## GitHub Pages deployment

The `.github/workflows/deploy.yml` workflow tests, builds, and publishes the application when `main` is pushed. It uses the Pages configuration to set the correct asset base path, including repository subpaths and custom domains.

To publish for the first time, authenticate GitHub CLI, create a repository, push `main`, and enable GitHub Pages with GitHub Actions as its source:

```sh
gh auth login --hostname github.com
gh repo create SACOM --public --source=. --remote=origin --push
gh api --method POST repos/{owner}/{repo}/pages -f build_type=workflow
gh workflow run deploy.yml
```

Check the deployment in the repository's Actions tab. The deployment job reports the live site URL. Hosting does not change the prototype's simulated submission or in-memory response storage.
