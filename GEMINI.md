# Project Instructions: LabourApp

## Multilingual Support
- The application uses `react-i18next` for localization.
- Supported languages: English (`en`), Hindi (`hi`), Marathi (`mr`), Kannada (`kn`).
- **Standard**: NEVER use hardcoded strings in UI components. Always use the `t()` function from `useTranslation()`.
- **Naming Convention**: Use semantic keys in JSON locale files (e.g., `common.save`, `auth.loginTitle`).
- **Dynamic Content**: Localize dynamic labels (professions, job types, salary periods) using keys in the `workerHome` or `categories` sections.

## Code Review Graph
- **Mandate**: ALWAYS exclude `node_modules`, `dist`, and `.expo` directories from the code knowledge graph.
- **Maintenance**: If the graph becomes bloated, run `git rm -r --cached .` followed by a full rebuild (`code-review-graph build`) to ensure only source files are indexed.
- **Verification**: Current graph should track ~100 files (source code only).

## Development Workflow
- **Backend**: Express.js with Supabase.
- **Frontend**: Expo/React Native.
- **Testing**: Ensure all new features or bug fixes are verified across all supported languages.
