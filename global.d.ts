import type * as ChartJS from 'chart.js'

// Redclare ChartJS types so they are easy to access.
declare global {
  // The global chart type the browser has.
  var Chart: typeof ChartJS.Chart
  interface Chart extends ChartJS.Chart { }

  // The point type.
  type Point = ChartJS.Point

  // The configuration type.
  type ChartConfiguration = ChartJS.ChartConfiguration

  /** Objectives for the P.C. System. **/
  interface Objective {
    name: string
    fun: number
    achievement: number
    ease: number
    impact: number
  }
}
