const pcForm = document.getElementById("pc-form")
// TODO: Don't use classes.
const objectiveContainerElem = pcForm.querySelector(".objective-container")

const generateObjectiveHTML = index =>
  document
    .getElementById("objective-template")
    .text
    .replace(/\{i\+1\}/g, String(index + 1))
    .replace(/\{i\}/g, String(index))

const addObjective = () => {
  const newIndex = objectiveContainerElem.children.length
  objectiveContainerElem.innerHTML += generateObjectiveHTML(newIndex)
}

// Add an objective straight away.
addObjective()
addObjective()
addObjective()

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
    }
  },
})

const personalChart = new Chart(
  document.getElementById("personal-chart").getContext("2d"),
  createChartConfig({
    text: "Personal (A, F)",
    data: [{x: 0.5, y: 0.5, r: 1}],
    labels: ["Example"],
  }),
)

const collectiveChart = new Chart(
  document.getElementById("collective-chart").getContext("2d"),
  createChartConfig({
    text: "Collective (I, E)",
    data: [{x: 0.5, y: 0.5, r: 1}],
    labels: ["Example"],
  }),
)

const combinedChart = new Chart(
  document.getElementById("combined-chart").getContext("2d"),
  createChartConfig({
    text: "Personal–Collective (C, P)",
    data: [{x: 0.5, y: 0.5, r: 1}],
    labels: ["Example"],
  }),
)

const project4d2d = (x, y) => x * y

pcForm.addEventListener("input", (event) => {
  const formData = new FormData(event.target.form)
  const personalData = []
  const collectiveData = []
  const combinedData = []
  const labels = []

  for (const [key, value] of formData.entries()) {
    const fieldName = key.match(/[a-z]+/i)[0]
    const fieldIndex = Number(key.match(/\d+/)[0])

    // PC co-ordinates are (C, P) combined, spread is (I, E, A, F)
    switch (fieldName) {
      case "name":
        labels[fieldIndex] = value
        break
      case "fun":
        personalData[fieldIndex] = personalData[fieldIndex] || {}
        personalData[fieldIndex].y = Number(value)
        break
      case "achievement":
        personalData[fieldIndex] = personalData[fieldIndex] || {}
        personalData[fieldIndex].x = Number(value)
        break
      case "ease":
        collectiveData[fieldIndex] = collectiveData[fieldIndex] || {}
        collectiveData[fieldIndex].y = Number(value)
        break
      case "impact":
        collectiveData[fieldIndex] = collectiveData[fieldIndex] || {}
        collectiveData[fieldIndex].x = Number(value)
        break
    }
  }

  for (const [index, datum] of personalData.entries()) {
    datum.r = 1
    combinedData[index] = combinedData[index] || {}
    combinedData[index].y = project4d2d(datum.x, datum.y)
  }

  for (const [index, datum] of collectiveData.entries()) {
    datum.r = 1
    combinedData[index] = combinedData[index] || {}
    combinedData[index].x = project4d2d(datum.x, datum.y)
  }

  for (const datum of combinedData.values()) {
    datum.r = 1
  }

  personalChart.data.labels = labels
  personalChart.data.datasets[0].data = personalData

  collectiveChart.data.labels = labels
  collectiveChart.data.datasets[0].data = collectiveData

  combinedChart.data.labels = labels
  combinedChart.data.datasets[0].data = combinedData

  personalChart.update()
  collectiveChart.update()
  combinedChart.update()

  pcForm.querySelector('[name="add"]').addEventListener("click", () => {
    addObjective()
  })
})

pcForm.querySelector('[name="add"]').addEventListener("click", () => {
  addObjective()
})
