/**
 * @file Bar chart for showing machine learning features
 * @author Matt Foulis
 */

// Used for calculating height of bars in chart
var maxLength = 0

// Main svg element
var ftsBarSVG

// Scale for x and y axis
var ftsBarScaleX
var ftsBarScaleY

// X and Y axis
var ftsBarXAxis
var ftsBarYAxis

// Colors for bars
var colorOnHighlight = '#DCFCFE'
var barColor = '#8694aa'

// Popup to show user information on hover
var popup

// Layout variables
var ftsBarMargin = { top: 20, right: 20, bottom: 190, left: 30 }
var ftsBarWidth = 600 - ftsBarMargin.left - ftsBarMargin.right
var ftsBarHeight = 300 - ftsBarMargin.top - ftsBarMargin.bottom

// Strings for accessing data object and displaying on axis label
var ftsBarParameters = ['sen_length', 'pos_nouns', 'pos_pnouns', 'pos_verbs', 'pos_adjectives', 'pos_modal_verbs', 'pos_numerical']
var ftsBarDisplayNames = ['Sentence length', 'Total nouns', 'Total proper nouns', 'Total verbs', 'Total adjectives', 'Total modal verbs', 'Total numerical symbols']
var ftsBarParamCounter = 0
var ftsBarParamString = ftsBarParameters[0]

/**
 * Calculates the maximum sentence length
 * @returns {number} length - The highest sentence length within the data
 */
function getMaxLength () {
  maxLength = d3.max(propositionData, function (d) {
    return +d.sen_length
  })
}

/**
 * Creates and displays a bar chart showing machine learning features
 */
function displayFeaturesBarChart () {
  getMaxLength()

  // Popup to show user information on hover
  popup = d3.select('body').append('div')
    .attr('class', 'tooltip_length')
    .style('opacity', 0)

  // Setup main svg
  d3.select('div#scatterPlotBar')
    .append('div')
    .classed('svg-container-bar', true)
    .append('svg')
    .attr('preserveAspectRatio', 'xMinYMin meet')
    .attr('viewBox', '0 0 600 400')
    .classed('svg-content-responsive', true)
    .classed('scatterPlotBar', true)
    .append('rect')
    .classed('rect', true)
    .attr('width', 600)
    .attr('height', 150)

  // Scale for X axis
  ftsBarScaleX = d3.scaleLinear()
    .domain([0, maxLength + 1])
    .range([0, ftsBarWidth])

  // Scale for Y axis
  ftsBarScaleY = d3.scaleLinear()
    .domain([0, d3.max(propositionData, function (d) { return countTotal(d.sen_length, 'sen_length') })])
    .range([ftsBarHeight, 0])

  // Add X and Y axis
  ftsBarXAxis = d3.axisBottom(ftsBarScaleX)
  ftsBarYAxis = d3.axisLeft(ftsBarScaleY)

  // Add main SVG container element
  ftsBarSVG = d3.select('.scatterPlotBar').append('svg')
    .attr('width', ftsBarWidth + ftsBarMargin.left + ftsBarMargin.right)
    .attr('height', ftsBarHeight + ftsBarMargin.top + ftsBarMargin.bottom)
    .append('g')
    .attr('transform', 'translate(' + ftsBarMargin.left + ',' + ftsBarMargin.top + ')')
  ftsBarSVG.append('g')

  // Add bars to chart
  ftsBarSVG.selectAll('.bar')
    .data(propositionData)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', function (d) { return ftsBarScaleX(d.sen_length) })
    .attr('width', (ftsBarWidth / d3.max(propositionData, function (d) { return d.sen_length })))
    .attr('y', function (d) { return ftsBarScaleY(countTotal(d.sen_length, 'sen_length')) })
    .attr('height', function (d) { return ftsBarHeight - ftsBarScaleY(countTotal(d.sen_length, 'sen_length')) })
    .on('mouseover', function (d) {
      d3.select(this).style('fill', colorOnHighlight)
      barOnMouse(d)
    })
    .on('mouseout', function (d) {
      d3.select(this).style('fill', barColor)
      barOnMouseOut()
    })
    .attr('id', function (d, i) { return 'length' + i })

  // Add X and Y Axis
  ftsBarSVG.append('g')
    .attr('transform', 'translate(0,' + ftsBarHeight + ')')
    .attr('class', 'x axis')
    .call(ftsBarXAxis)
    .style('font-size', '1rem')

  ftsBarSVG.append('g')
    .attr('class', 'y axis')
    .call(ftsBarYAxis)

  setupXAxisLabel()
}

/**
 * Adds interactivity to barchart X Axis label
 */
function setupXAxisLabel () {
  d3.selectAll('.barchart_interaction')
    .on('mouseover', function () {
      d3.select('body').style('cursor', 'pointer')
    })
    .on('mouseout', function () {
      d3.select('body').style('cursor', 'default')
    })
    .on('click', function () {
      ftsBarParamCounter++
      d3.select(this).text(ftsBarDisplayNames[ftsBarParamCounter % ftsBarParameters.length])
      updateFeaturesBar()
    })
}

/**
 * Displays a popup box to the user showing them more information about the selected bar
 * @param {bar} d - The selected bar
 */
function barOnMouse (d) {
  popup.transition('fillcolor')
    .duration(50)
    .style('opacity', 1)

  popup.html(ftsBarDisplayNames[ftsBarParamCounter % ftsBarParameters.length] + ': ' + d[ftsBarParamString] + ' Total: ' + countTotal(d[ftsBarParamString], ftsBarParamString))
    .style('left', (d3.event.pageX + 10) + 'px')
    .style('top', (d3.event.pageY - 15) + 'px')
}

/**
 * Hides the popup box when the use moves away from bar
 */
function barOnMouseOut () {
  popup.transition('fillcolor')
    .duration(50)
    .style('opacity', 0)
}

/**
 * Calculates the total number of instances of a parameter of a specific value within the data
 * @param {number} num - The number to check the data against
 * @param {string} param - The data paramater to be checked
 * @example
 * countTotal(10, sentence_length)
 * If there are 4 instances of a sentence with length 10 within the data, the function returns 4
 */
function countTotal (num, param) {
  return propositionData.filter(obj => obj[param] === num).length
}

/**
 * Updates the bar chart when the user selects a new x axis label
 */
function updateFeaturesBar () {
  ftsBarParamString = ftsBarParameters[ftsBarParamCounter % ftsBarParameters.length]

  maxLength = d3.max(propositionData, function (d) {
    return +d[ftsBarParamString]
  })

  ftsBarScaleX.domain([0, maxLength + 1])
  ftsBarScaleY.domain([0, d3.max(propositionData, function (d) { return countTotal(d[ftsBarParamString], ftsBarParamString) })])

  var bars = ftsBarSVG.selectAll('.bar')
    .data(propositionData)

  // Move bars to new positions
  bars
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('fill', 'red')
    .attr('width', (ftsBarWidth / d3.max(propositionData, function (d) { return d[ftsBarParamString] })))
    .attr('height', 0)
    .attr('y', ftsBarHeight)
    .merge(bars)
    .transition()
    .duration(1000)
    .attr('height', function (d) { return ftsBarHeight - ftsBarScaleY(countTotal(d[ftsBarParamString], ftsBarParamString)) })
    .attr('y', function (d) { return ftsBarScaleY(countTotal(d[ftsBarParamString], ftsBarParamString)) })
    .attr('width', (ftsBarWidth / (d3.max(propositionData, function (d) { return d[ftsBarParamString] }) + 1)))
    .attr('x', function (d) { return ftsBarScaleX(d[ftsBarParamString]) })

  // Remove extra bars
  bars
    .exit()
    .transition()
    .duration(1000)
    .attr('height', 0)
    .attr('y', ftsBarHeight)
    .remove()

  var ftsBarXAxis = d3.axisBottom(ftsBarScaleX)
  var ftsBarYAxis = d3.axisLeft(ftsBarScaleY).ticks(3)

  // Update x and y axis
  ftsBarSVG.select('.x.axis')
    .transition()
    .duration(1000)
    .call(ftsBarXAxis)

  ftsBarSVG.select('.y.axis')
    .transition()
    .duration(1000)
    .call(ftsBarYAxis)
}
