/**
 * @file Bar chart that displays the LIME values for the value, fact, and policy classification
 * @author Matt Foulis
 */

// Layout variables
var VPFChartMargin = { top: 10, right: 20, bottom: 40, left: 60 }
var VPFChartWidth = 600 - VPFChartMargin.left - VPFChartMargin.right
var VPFChartHeight = 80 - VPFChartMargin.top - VPFChartMargin.bottom

// X and Y scale for chart
var VPFScaleX
var VPFScaleY

// Main SVG element
var VPFChartSVG

/**
 * Creates SVG element for value policy and fact values chart
 */
function VPFBarChartSetup () {
  d3.select('div#VPFBarChart')
    .append('div')
    .classed('svg-container-vpf', true)
    .append('svg')
    .attr('preserveAspectRatio', 'xMinYMin meet')
    .attr('viewBox', '0 0 600 200')
    .classed('svg-content-responsive', true)
    .classed('svgVPFBar', true)
    .append('rect')
    .classed('rect', true)
    .attr('width', VPFChartWidth + VPFChartMargin.left + VPFChartMargin.right)
    .attr('height', VPFChartHeight + VPFChartMargin.top + VPFChartMargin.bottom)

  displayBarChart(0)
}

/**
 * Displays the bar chart for the selected proposition
 * @param {int} sentenceIndex - The index of the selected sentence
 */
function displayBarChart (sentenceIndex) {
  // Store the data of the current proposition
  currentPropositionData = []
  currentPropositionData.push(propositionData[sentenceIndex])

  // Store the value, fact, policy values to be displayed
  var barData = [{ proposition: 'Fact', value: currentPropositionData[0].prediction_fact },
    { proposition: 'Value', value: currentPropositionData[0].prediction_value },
    { proposition: 'Policy', value: currentPropositionData[0].prediction_policy }]

  // Scale for Y axis
  VPFScaleY = d3.scaleBand()
    .range([0, VPFChartHeight])
    .padding(0.2)

  // Scale for the X axis
  VPFScaleX = d3.scaleLinear()
    .range([0, 530])

  // Setup main SVG element
  VPFChartSVG = d3.select('.svgVPFBar').append('svg')
    .attr('class', 'barChartSVG')
    .append('g')
    .attr('transform', 'translate(' + VPFChartMargin.left + ',' + VPFChartMargin.top + ')')

  // Change value from string to float values
  barData.forEach(function (d) {
    d.value = +d.value
  })

  // vpf values are always between 0 and 1 so domain can be set as so
  VPFScaleX.domain([0, 1])

  // Get proposition titles ('Value', 'Policy', and 'Fact') for y axis
  VPFScaleY.domain(barData.map(function (d) { return d.proposition }))

  // Bar chart bars
  VPFChartSVG.selectAll('.vpf_bar')
    .data(barData)
    .enter()
    .append('rect')
    .attr('class', 'vpf_bar')
    .attr('width', function (d) { return VPFScaleX(d.value) })
    .attr('y', function (d) { return VPFScaleY(d.proposition) })
    .attr('height', VPFScaleY.bandwidth())
    .style('fill', function (d, i) { return getVPFBarColor(i) })
    .style('stroke', 'black')
    .style('stroke-width', '0.5px')

  // Text on bars
  VPFChartSVG.selectAll('.vpf_text')
    .data(barData)
    .enter()
    .append('text')
    .attr('class', 'vpf_text')
    .attr('x', function (d) { return VPFScaleX(d.value) + 10 })
    .attr('y', function (d) { return VPFScaleY(d.proposition) + 6 })
    .text(function (d) { return d.value.toFixed(4) })
    .style('fill', 'black')
    .attr('font-size', '0.9rem')

  // Add x axis to chart
  VPFChartSVG.append('g')
    .attr('transform', 'translate(0,' + VPFChartHeight + ')')
    .attr('class', 'x_axis')
    .call(d3.axisBottom(VPFScaleX).ticks(0).tickSize(0))

  // Add y axis to chart
  VPFChartSVG.append('g')
    .style('font-size', '1rem')
    .attr('class', 'y_axis')
    .call(d3.axisLeft(VPFScaleY).tickSize(0))
}

/**
 * Provides a color for the bars within the chart
 * @param {int} Index - The index of the bar
 * @returns {string} Colour - The colour for the chart
 */
function getVPFBarColor (index) {
  switch (index) {
    case 0:
      return '#497899'
      break
    case 1:
      return '#b7a0c0'
      break
    case 2:
      return '#ffd6d6'
      break
    default:
      console.log('Error: invalid bar chart index')
  }
}

/**
 * Updates the VPF bar chart when a new sentence is selected
 * @param {index} sentenceIndex - The index of the selected sentence
 */
function updateVPFChart (sentenceIndex) {
  // Update the bar data
  var barData = [{ proposition: 'Fact', value: propositionData[sentenceIndex].prediction_fact },
    { proposition: 'Value', value: propositionData[sentenceIndex].prediction_value },
    { proposition: 'Policy', value: propositionData[sentenceIndex].prediction_policy }]

  // Select the bars
  var bar = d3.selectAll('.vpf_bar')
    .data(barData)

  // Transition between previous and current value on bar
  bar.transition()
    .duration(1000)
    .attr('x', function () { return 0 })
    .attr('y', function (d) { return VPFScaleY(d.proposition) })
    .attr('width', function (d) { return VPFScaleX(d.value) })
    .attr('height', VPFScaleY.bandwidth())

  // Update text on bars
  var barText = d3.selectAll('.vpf_text')
    .data(barData)

  barText.transition()
    .duration(1000)
    .attr('x', function (d) { return VPFScaleX(d.value) + 10 })
    .attr('y', function (d) { return VPFScaleY(d.proposition) + 6 })
    .text(function (d) { return parseFloat(d.value).toFixed(4) })
    .attr('font-size', '0.9rem')
}
