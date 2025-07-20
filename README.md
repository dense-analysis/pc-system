# The PC System Reference Tool

An objective management system reference tool. See public documentation on
[The PC
System](https://dense-analysis.notion.site/The-PC-System-1bf416f9a04842d49212c775a4305dbf)
for more details.

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

## Development

The reference tool is implemented as a plain JS files designed to run in most
web browsers. Apply common sense and check your implementation across common
browser versions. You can run linting and type checks for the JS files like so:

```
npm i
npm run lint
npm run tsc
```

The only dependency for the project is
[Chart.js](https://www.chartjs.org/docs/latest/), which is loaded from a
Cloudflare CDN link.
