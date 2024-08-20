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

/** @type {(index: number) => Objective} */
const newObjective = (index) => ({
  name: `Objective ${index}`,
  fun: 0.5,
  achievement: 0.5,
  ease: 0.5,
  impact: 0.5,
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
          default:
            return ""
        }
      })
  }

  return ""
}

/** @type {Objective[]} */
let objectiveList = []

const loadObjectives = () => {
  // Try to get the objectives from localStorage.
  try {
    objectiveList = JSON.parse(localStorage.getItem("objectives") || "[]")
  } catch {
    /* Do nothing on failure. */
  }

  for (const [index, objective] of objectiveList.entries()) {
    addObjectiveToDOM(index, objective)
  }

  if (objectiveList.length === 0) {
    // Add an objective straight away if we have none.
    createAndRenderNewObjective()
  }
}

const saveObjectives = () => {
  // Try to persist objectives to localStorage.
  try {
    localStorage.setItem("objectives", JSON.stringify(objectiveList))
  } catch {
    /* Do nothing on failure. */
  }
}

/** @type {(index: number, objective: Objective) => void} */
const addObjectiveToDOM = (index, objective) => {
  addButton.insertAdjacentHTML(
    "beforebegin",
    generateObjectiveHTML(index, objective),
  )
}

const createAndRenderNewObjective = () => {
  const index = pcForm.children.length - 1
  const objective = newObjective(index)

  objectiveList.push(objective)
  addObjectiveToDOM(index, objective)
  saveObjectives()
}

/** @type {(foo: {text: string, data: Point[], labels: string[], xTitle: string, yTitle: string}) => ChartConfiguration} */
const createChartConfig = ({text, data, labels, xTitle, yTitle}) => ({
  type: "scatter",
  data: {
    labels,
    datasets: [
      {
        data: data,
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  },
  options: {
    animation: false,
    responsive: false,
    plugins: {
      legend: {display: false},
      title: {display: true, align: 'center', text},
    },
    scales: {
      x: {
        title: {display: true, font: {weight: 'bold'}, text: xTitle},
        beginAtZero: true,
        min: 0,
        max: 1,
        offset: true,
        ticks: {display: true, stepSize: 0.1},
        grid: {drawTicks: false, offset: true},
      },
      y: {
        title: {display: true, font: {weight: 'bold'}, text: yTitle},
        beginAtZero: true,
        min: 0,
        max: 1,
        offset: true,
        ticks: {display: true, stepSize: 0.1},
        grid: {drawTicks: false, offset: true},
      },
    },
  },
})

/** @type {(x: number, y: number) => number} */
const project4d2d = (x, y) => x * y

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

  // Map objectives to labels and coordinates to render.
  for (const objective of objectiveList.values()) {
    labels.push(objective.name)
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
        xTitle: 'Achievement',
        yTitle: 'Fun',
        labels,
      }),
    )
  } else {
    personalChart.data.labels = labels

    if (personalChart.data.datasets) {
      personalChart.data.datasets[0].data = personalData
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
        xTitle: 'Impact',
        yTitle: 'Ease',
        labels,
      }),
    )
  } else {
    collectiveChart.data.labels = labels

    if (collectiveChart.data.datasets) {
      collectiveChart.data.datasets[0].data = collectiveData
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
        xTitle: 'Collective',
        yTitle: 'Personal',
        labels,
      }),
    )
  } else {
    combinedChart.data.labels = labels

    if (combinedChart.data.datasets) {
      combinedChart.data.datasets[0].data = combinedData
    }

    combinedChart.update()
  }
}

const updateObjectiveListFromHTML = () => {
  /** @type {Objective[]} */
  const newObjectiveList = []

  // @ts-ignore
  const formData = new FormData(pcForm)

  for (const [key, value] of formData.entries()) {
    const fieldName = key.match(/[a-z]+/i)?.[0]
    const index = Number(key.match(/\d+/)?.[0])

    if (typeof value === "string" && Number.isFinite(index)) {
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
      }
    }
  }

  objectiveList = newObjectiveList
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
    objectiveList.splice(index, 1)

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
})

renderCharts()
