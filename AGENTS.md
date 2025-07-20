# AGENTS.md

This file provides instructions to AI agents (e.g., OpenAI Codex) working in
this repository.

## Project Description

The PC System Reference Tool helps individuals and teams choose better
objectives by scoring them across four dimensions: Fun, Achievement, Ease, and
Impact. It provides a simple interface for comparing goals, ranking their
benefits to yourself and to others, and identifying which ones are most worth
pursuing. Use it to plan solo projects or coordinate with groups more
effectively.

The reference tool is implemented with some sliders and charts that display
Fun & Achievement in a Personal plane, and Ease & Impact in a Collective plane.
A dimension reduction function is applied to plot Personal and Collective values
derived from the first two planes in one unified plane.

## Code Style & Conventions

1. Follow existing project conventions (indentation, naming, file layout).
2. Use the project's linter and formatter checks.
3. Do not ever add TypeScript code to the codebase.
4. All JavaScript should be implemented with widely supported JS code in most
   browsers. Prefer solutions that are elegant and run in 98% of browsers.
5. Do not ever add complex libraries or dependencies.
6. Do not ever use a build tool such as Webpack.
7. Do not ever apply CSS frameworks: use CSS that renders in the browser.
8. `index.htm` uses `text/html` script templates for HTML to format into the
   page. Consider the contents of these templates when modifying JS code.

To run linters and formatters, do the following.

```sh
npm i
npm run lint
npm run tsc
```

## Testing

- After changes, run all checks:

```sh
npm run lint
npm run tsc
```
