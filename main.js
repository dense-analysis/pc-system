/** @type {Objective[]} */
let objectiveList = []

const pcForm = document.getElementById("pc-form")

if (!(pcForm instanceof HTMLFormElement)) {
  throw new Error("form not found!")
}

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
const newPoint = () => ({x: 0, y: 0, r: 1})

/** @type {(index: number) => string} */
const generateObjectiveHTML = (index) => {
  const template = document.getElementById("objective-template")

  if (template instanceof HTMLScriptElement) {
    return template.text //
      .replace(/\{i\+1\}/g, String(index + 1))
      .replace(/\{i\}/g, String(index))
  }

  return ""
}

const addObjective = () => {
  const index = pcForm.children.length - 1
  objectiveList.push(newObjective(index))
  addButton.insertAdjacentHTML("beforebegin", generateObjectiveHTML(index))
}

// Add an objective straight away.
addObjective()
addObjective()
addObjective()

/** @type {(foo: {text: string, data: Point[], labels: string[]}) => any} */
const createChartConfig = ({text, data, labels}) => ({
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
      title: {display: true, text},
    },
    scales: {
      x: {min: 0, max: 1},
      y: {min: 0, max: 1},
    },
  },
})

const personalChart = new Chart(
  // @ts-ignore
  document
    .getElementById("personal-chart")
    // @ts-ignore
    .getContext("2d"),
  createChartConfig({
    text: "Personal (A, F)",
    data: [{x: 0.5, y: 0.5, r: 1}],
    labels: ["Example"],
  }),
)

const collectiveChart = new Chart(
  // @ts-ignore
  document
    .getElementById("collective-chart")
    // @ts-ignore
    .getContext("2d"),
  createChartConfig({
    text: "Collective (I, E)",
    data: [{x: 0.5, y: 0.5, r: 1}],
    labels: ["Example"],
  }),
)

const combinedChart = new Chart(
  // @ts-ignore
  document
    .getElementById("combined-chart")
    // @ts-ignore
    .getContext("2d"),
  createChartConfig({
    text: "Personal–Collective (C, P)",
    data: [{x: 0.5, y: 0.5, r: 1}],
    labels: ["Example"],
  }),
)

/** @type {(x: number, y: number) => number} */
const project4d2d = (x, y) => x * y

const updateObjectiveListFromHTML = () => {
  objectiveList = []

  // @ts-ignore
  const formData = new FormData(pcForm)

  for (const [key, value] of formData.entries()) {
    const fieldName = key.match(/[a-z]+/i)?.[0]
    const index = Number(key.match(/\d+/)?.[0])

    if (typeof value === "string" && Number.isFinite(index)) {
      const objective = objectiveList[index] || newObjective(index)

      // PC co-ordinates are (C, P) combined, spread is (I, E, A, F)
      switch (fieldName) {
        case "fun":
        case "achievement":
        case "ease":
        case "impact":
          objective[fieldName] = Number(value)
          objectiveList[index] = objective
          break
        case "name":
          objective[fieldName] = value
          objectiveList[index] = objective
          break
      }
    }
  }
}

pcForm.addEventListener("input", (event) => {
  // Update the objectiveList from the DOM.
  updateObjectiveListFromHTML()

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
      r: 1,
    })
    collectiveData.push({
      x: objective.impact,
      y: objective.ease,
      r: 1,
    })
    // PC co-ordinates are (C, P) combined, spread is (I, E, A, F)
    combinedData.push({
      x: project4d2d(objective.impact, objective.ease),
      y: project4d2d(objective.achievement, objective.fun),
      r: 1,
    })
  }

  personalChart.data.labels = labels
  collectiveChart.data.labels = labels
  combinedChart.data.labels = labels

  if (personalChart.data.datasets) {
    personalChart.data.datasets[0].data = personalData
  }

  if (collectiveChart.data.datasets) {
    collectiveChart.data.datasets[0].data = collectiveData
  }

  if (combinedChart.data.datasets) {
    combinedChart.data.datasets[0].data = combinedData
  }

  personalChart.update()
  collectiveChart.update()
  combinedChart.update()
})

addButton.addEventListener("click", () => {
  addObjective()
})
