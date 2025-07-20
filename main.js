// Load the form from DOM.
const pcForm = document.getElementById("pc-form")

if (!(pcForm instanceof HTMLFormElement)) {
  throw new Error("form not found!")
}

// Load the add button from DOM.
const addButton = pcForm.querySelector('[name="add"]')

if (!(addButton instanceof HTMLButtonElement)) {
  throw new Error("button not found!")
}

// Load the download CSV button from DOM.
const downloadCSVButton = pcForm.querySelector('[name="download-csv"]')

if (!(downloadCSVButton instanceof HTMLButtonElement)) {
  throw new Error("download button not found!")
}

// Load the upload button from DOM.
const uploadCSVButton = pcForm.querySelector('[name="upload-csv"]')

if (!(uploadCSVButton instanceof HTMLButtonElement)) {
  throw new Error("upload button not found!")
}

// Load the upload CSV input from DOM.
const uploadCSVInput = pcForm.querySelector('[name="upload-csv-input"]')

if (!(uploadCSVInput instanceof HTMLInputElement)) {
  throw new Error("file input not found!")
}

const objectivesPane = document.getElementById("objectives-pane")

if (!(objectivesPane instanceof HTMLDivElement)) {
  throw new Error("objectives-pane not found!")
}

const defaultColors = [
  "#0072B2", // Strong Blue
  "#009E73", // Teal Green
  "#D55E00", // Vermilion
  "#E69F00", // Vibrant Orange
  "#EEDD88", // Pale Yellow
  "#CC79A7", // Purple
  "#56B4E9", // Sky Blue
  "#999999", // Medium Grey
  "#88CCEE", // Soft Cyan
  "#44AA99", // Dark Teal
  "#117733", // Forest Green
  "#DDCC77", // Mustard
  "#661100", // Deep Brown
  "#AA4499", // Plum
  "#882255", // Burgundy
  "#CC6677", // Rose
  "#DDDDDD", // Light Grey
  "#114477", // Steely Blue
  "#999933", // Olive
  "#AA3377", // Orchid
  "#77AADD", // Muted Blue
  "#EE8866", // Coral
  "#44BB99", // Aquamarine
  "#9988DD", // Soft Purple
  "#EECC66", // Sand
  "#FF6F00", // Flame
  "#C51B8A", // Fuchsia
  "#F0E442", // Bright Yellow
  "#1B9E77", // Dark Teal
  "#7570B3", // Blue-Purple
  "#E7298A", // Magenta
  "#66A61E", // Leaf Green
  "#E6AB02", // Warm Yellow
  "#A6761D", // Ochre
  "#666666", // Dark Grey
]

/** @type {(color: unknown) => boolean} */
const isValidColor = (color) =>
  typeof color === "string" && /^#[0-9a-fA-F]{6}$/.test(color)

/** @type {(currentObjectives: Objective[]) => string} */
const findNextAvailableColor = (objectiveList) =>
  defaultColors.find(
    (color) =>
      !objectiveList.some(
        (x) => String(x.color).toUpperCase() === color.toUpperCase(),
      ),
  ) || "#000000"

/** @type {(index: number) => Objective} */
const newObjective = (index) => ({
  name: `Objective ${index + 1}`,
  fun: 0.5,
  achievement: 0.5,
  ease: 0.5,
  impact: 0.5,
  color: "#000000",
})

/** @type {() => Point} */
const newPoint = () => ({x: 0, y: 0})

/** @type {(index: number, objective: Objective) => string} */
const generateObjectiveHTML = (index, objective) => {
  const template = document.getElementById("objective-template")

  if (template instanceof HTMLScriptElement) {
    return template.text //
      .replace(/\{([^}]+)\}/g, (match, p1) => {
        switch (p1) {
          case "i":
            return String(index)
          case "i+1":
            return String(index + 1)
          case "name":
            return objective.name
          case "fun":
            return String(objective.fun)
          case "achievement":
            return String(objective.achievement)
          case "ease":
            return String(objective.ease)
          case "impact":
            return String(objective.impact)
          case "color":
            return objective.color
          default:
            return ""
        }
      })
      .trim()
  }

  return ""
}

/** @type {Objective[]} */
let activeObjectiveList = []

const loadObjectives = () => {
  // Try to get the objectives from localStorage.
  try {
    activeObjectiveList = JSON.parse(localStorage.getItem("objectives") || "[]")
  } catch {
    /* Do nothing on failure. */
  }

  for (const objective of activeObjectiveList) {
    // If colors are missing or invalid find a suitable one.
    if (!isValidColor(objective.color)) {
      objective.color = findNextAvailableColor(activeObjectiveList)
    }
  }

  for (const [index, objective] of activeObjectiveList.entries()) {
    addObjectiveToDOM(index, objective)
  }
}

const saveObjectives = () => {
  // Try to persist objectives to localStorage.
  try {
    localStorage.setItem("objectives", JSON.stringify(activeObjectiveList))
  } catch {
    /* Do nothing on failure. */
  }
}

/** @type {(index: number, objective: Objective) => void} */
const addObjectiveToDOM = (index, objective) => {
  objectivesPane.insertAdjacentHTML(
    "beforeend",
    generateObjectiveHTML(index, objective),
  )
}

const createAndRenderNewObjective = () => {
  const index = activeObjectiveList.length
  const objective = newObjective(index)
  objective.color = findNextAvailableColor(activeObjectiveList)

  activeObjectiveList.push(objective)
  addObjectiveToDOM(index, objective)
  saveObjectives()
}

/** @type {(foo: {text: string, data: Point[], labels: string[], colors: string[], xTitle: string, yTitle: string}) => ChartConfiguration} */
const createChartConfig = ({text, data, labels, colors, xTitle, yTitle}) => ({
  type: "scatter",
  data: {
    labels,
    datasets: [
      {
        data: data,
        borderColor: colors,
        backgroundColor: colors,
      },
    ],
  },
  options: {
    animation: false,
    responsive: false,
    plugins: {
      legend: {display: false},
      title: {display: true, align: "center", text},
    },
    scales: {
      x: {
        title: {display: true, font: {weight: "bold"}, text: xTitle},
        beginAtZero: true,
        min: 0,
        max: 1,
        offset: true,
        ticks: {display: false, stepSize: 0.1},
        grid: {drawTicks: false, offset: true},
      },
      y: {
        title: {display: true, font: {weight: "bold"}, text: yTitle},
        beginAtZero: true,
        min: 0,
        max: 1,
        offset: true,
        ticks: {display: false, stepSize: 0.1},
        grid: {drawTicks: false, offset: true},
      },
    },
  },
})

/** @type {(x: number, y: number) => number} */
const project4d2d = (x, y) => (Math.hypot(x, y) / Math.sqrt(2) + x * y) / 2

// Load objectives now.
loadObjectives()

/** @type {Chart | null} */
let personalChart = null
/** @type {Chart | null} */
let collectiveChart = null
/** @type {Chart | null} */
let combinedChart = null

const renderCharts = () => {
  /** @type {Point[]} */
  const personalData = []
  /** @type {Point[]} */
  const collectiveData = []
  /** @type {Point[]} */
  const combinedData = []
  /** @type {string[]} */
  const labels = []
  /** @type {string[]} */
  const colors = []

  // Map objectives to labels and coordinates to render.
  for (const objective of activeObjectiveList.values()) {
    labels.push(objective.name)
    colors.push(objective.color)
    personalData.push({
      x: objective.achievement,
      y: objective.fun,
    })
    collectiveData.push({
      x: objective.impact,
      y: objective.ease,
    })
    // PC co-ordinates are (C, P) combined, spread is (I, E, A, F)
    combinedData.push({
      x: project4d2d(objective.impact, objective.ease),
      y: project4d2d(objective.achievement, objective.fun),
    })
  }

  // Create or update the Personal chart.
  if (personalChart == null) {
    personalChart = new Chart(
      // @ts-ignore
      document
        .getElementById("personal-chart")
        // @ts-ignore
        .getContext("2d"),
      createChartConfig({
        text: "Personal (A, F)",
        data: personalData,
        xTitle: "Achievement",
        yTitle: "Fun",
        labels,
        colors,
      }),
    )
  } else {
    personalChart.data.labels = labels

    if (personalChart.data.datasets) {
      personalChart.data.datasets[0].data = personalData
      personalChart.data.datasets[0].borderColor = colors
      personalChart.data.datasets[0].backgroundColor = colors
    }

    personalChart.update()
  }

  // Create or update the Collective chart.
  if (collectiveChart == null) {
    collectiveChart = new Chart(
      // @ts-ignore
      document
        .getElementById("collective-chart")
        // @ts-ignore
        .getContext("2d"),
      createChartConfig({
        text: "Collective (I, E)",
        data: collectiveData,
        xTitle: "Impact",
        yTitle: "Ease",
        labels,
        colors,
      }),
    )
  } else {
    collectiveChart.data.labels = labels

    if (collectiveChart.data.datasets) {
      collectiveChart.data.datasets[0].data = collectiveData
      collectiveChart.data.datasets[0].borderColor = colors
      collectiveChart.data.datasets[0].backgroundColor = colors
    }

    collectiveChart.update()
  }

  // Create or update the Personal-Collective chart.
  if (combinedChart == null) {
    combinedChart = new Chart(
      // @ts-ignore
      document
        .getElementById("combined-chart")
        // @ts-ignore
        .getContext("2d"),
      createChartConfig({
        text: "Personal–Collective (C, P)",
        data: combinedData,
        xTitle: "Collective",
        yTitle: "Personal",
        labels,
        colors,
      }),
    )
  } else {
    combinedChart.data.labels = labels

    if (combinedChart.data.datasets) {
      combinedChart.data.datasets[0].data = combinedData
      combinedChart.data.datasets[0].borderColor = colors
      combinedChart.data.datasets[0].backgroundColor = colors
    }

    combinedChart.update()
  }
}

const updateObjectiveListFromHTML = () => {
  // Create a new objective list for replacing the current one.
  /** @type {Objective[]} */
  const newObjectiveList = []

  // @ts-ignore
  const formData = new FormData(pcForm)

  for (const [key, value] of formData.entries()) {
    const fieldName = key.match(/[a-z]+/i)?.[0]
    const index = Number(key.match(/\d+/)?.[0])

    if (typeof value === "string" && Number.isFinite(index)) {
      // Create a new objective. We must not read the activeObjectiveList.
      const objective = newObjectiveList[index] || newObjective(index)

      // PC co-ordinates are (C, P) combined, spread is (I, E, A, F)
      switch (fieldName) {
        case "fun":
        case "achievement":
        case "ease":
        case "impact":
          objective[fieldName] = Number(value)
          newObjectiveList[index] = objective
          break
        case "name":
          objective[fieldName] = value
          newObjectiveList[index] = objective
          break
        case "color":
          objective.color = value
          newObjectiveList[index] = objective
          break
      }
    }
  }

  activeObjectiveList = newObjectiveList
}

const persistAndRenderObjectives = () => {
  // Remove all current DOM.
  for (const elem of pcForm.querySelectorAll('fieldset[name^="objective"')) {
    elem.remove()
  }

  // Save and reload objectives, reloading DOM.
  saveObjectives()
  loadObjectives()
  // Render charts again from the data.
  renderCharts()
}

pcForm.addEventListener("input", (event) => {
  // Update the objectiveList from the DOM.
  updateObjectiveListFromHTML()
  renderCharts()
  saveObjectives()
})

addButton.addEventListener("click", () => {
  createAndRenderNewObjective()
  renderCharts()
})

// Listen for any delete button clicks and handle them.
pcForm.addEventListener("click", (event) => {
  if (
    event.target instanceof HTMLButtonElement &&
    event.target.name.startsWith("delete")
  ) {
    // Pick out the delete button index and remove the element.
    const index = Number(event.target.name.slice("delete".length))
    activeObjectiveList.splice(index, 1)
    persistAndRenderObjectives()
  }
})

renderCharts()

/** @type {() => void} */
const saveCSV = () => {
  // Convert data into CSV.
  const objectiveCSVData = activeObjectiveList
    .map(
      (objective) =>
        `${objective.name.replace(",", "")},${objective.achievement},` +
        `${objective.fun},${objective.impact},${objective.ease},${objective.color}`,
    )
    .join("\n")
  const csv = `name,achievement,fun,impact,ease,color\n${objectiveCSVData}`

  const blob = new Blob([csv], {type: "text/csv;charset=utf-8;"})

  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", "pc-objectives.csv")
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

downloadCSVButton.addEventListener("click", (event) => {
  saveCSV()
})

uploadCSVButton.addEventListener("click", () => {
  uploadCSVInput.click()
})

/** @type {(text: string | undefined) => number} */
const parseObjectiveNumber = (text) => {
  const number = Number(text)

  return Number.isFinite(number) && number >= 0 && number <= 1 ? number : 0
}

/** @type {(text: string) => void} */
const loadCSV = (text) => {
  // name,achievement,fun,impact,ease,color
  const rows = text.split("\n").map((line) => line.split(","))
  const header = rows[0] || []
  // Remove the header row now we've pulled it out.
  rows.splice(0, 1)

  const nameIndex = header.indexOf("name")
  const achievementIndex = header.indexOf("achievement")
  const funIndex = header.indexOf("fun")
  const impactIndex = header.indexOf("impact")
  const easeIndex = header.indexOf("ease")
  const colorIndex = header.indexOf("color")

  /** @type {Objective[]} */
  const newObjectiveList = []

  for (const row of rows) {
    newObjectiveList.push({
      name: row[nameIndex] || "",
      achievement: parseObjectiveNumber(row[achievementIndex]),
      fun: parseObjectiveNumber(row[funIndex]),
      impact: parseObjectiveNumber(row[impactIndex]),
      ease: parseObjectiveNumber(row[easeIndex]),
      color: row[colorIndex] || "",
    })
  }

  activeObjectiveList = newObjectiveList
  persistAndRenderObjectives()
}

uploadCSVInput.addEventListener("change", (event) => {
  const file = uploadCSVInput.files?.[0]

  if (file) {
    const reader = new FileReader()

    reader.onload = (e) => {
      const text = e.target?.result

      if (typeof text === "string") {
        loadCSV(text)
      }
    }

    reader.readAsText(file)
  }

  if (event.target instanceof HTMLInputElement) {
    event.target.value = ""
  }
})
