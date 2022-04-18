/**
 * @file Sets up and displays a confusion matrix chart
 * @author Matt Foulis
 * @see Confusion matrix code is an amended version of the following:
 * https://github.com/arpitnarechania/d3-matrix/blob/master/dist/matrix.js
 * Accessed under the MIT licence https://github.com/arpitnarechania/d3-matrix
 */

// Layout variables
var cmMargin = { top: 60, right: 60, bottom: 120, left: 120 }
var cmWidth = 600 - cmMargin.left - cmMargin.right
var cmHeight = 600 - cmMargin.top - cmMargin.bottom

// Main SVG element
var cmSVG

// Provides x and y axis scaling
var cmXScale, cmYScale

/**
 * Create and display the confusion matrix
 */
function cmDisplay () {
  // Values for confusion matrix
  // As real data is being used these do not change and can therefore be set here
  var confusionMatrix = [
    [36, 2, 20],
    [3, 12, 7],
    [18, 4, 55]
  ]

  // Setup for SVG elements
  d3.select('div#confusion')
    .append('div')
    .classed('svg-container-confusion', true)
    .append('svg')
    .attr('preserveAspectRatio', 'xMinYMin meet')
    .attr('viewBox', '0 0 600 600')
    .classed('svg-content-confusion', true)
    .classed('confusion', true)
    .append('rect')
    .classed('rect', true)
    .attr('width', cmWidth + cmMargin.left + cmMargin.right)
    .attr('height', cmHeight + cmMargin.top + cmMargin.bottom)

  // Create and assign main SVG element
  cmSVG = d3.select('.confusion').append('svg')
    .append('g')
    .attr('transform', 'translate(' + cmMargin.left + ',' + cmMargin.top + ')')

  // X scaling
  cmXScale = d3.scaleBand()
    .domain(d3.range(confusionMatrix[0].length))
    .range([0, cmWidth])

  // Y Scaling
  cmYScale = d3.scaleBand()
    .domain(d3.range(confusionMatrix.length))
    .range([0, cmHeight])

  // Create rows
  var row = cmSVG.selectAll('.row')
    .data(confusionMatrix)
    .enter()
    .append('g')
    .attr('class', 'row')
    .attr('index', function (d, i) { return i })
    .attr('transform', function (d, i) { return 'translate(0,' + cmYScale(i) + ')' })

  // Create cells
  var cell = row.selectAll('.cell')
    .data(function (d) { return d })
    .enter().append('g')
    .attr('class', 'cell')
    .attr('transform', function (d, i) { return 'translate(' + cmXScale(i) + ', 0)' })

  // Add rectangle for cells
  cell.append('rect')
    .attr('width', cmXScale.bandwidth())
    .attr('height', cmYScale.bandwidth())
    .style('stroke', 'black')
    .style('stroke-width', '1px')
    .attr('class', 'cmCell')
    .attr('id', function (d, i) { return i + this.parentNode.parentNode.getAttribute('index') })

  // Add numbers to cells
  cell.append('text')
    .attr('dy', '.32em')
    .attr('x', cmXScale.bandwidth() / 2)
    .attr('y', cmYScale.bandwidth() / 2)
    .style('font-size', '4rem')
    .style('fill', 'white')
    .attr('text-anchor', 'middle')
    .attr('class', 'cmCellText')
    .text(function (d, i) { return d })

  cmAddLabels()
  cmAddColour()
}

/**
 * Adds color to the matrix cells
 */
function cmAddColour () {
  var cells = d3.selectAll('.cmCell')
  var texts = d3.selectAll('.cmCellText')

  for (var i = 0; i < 9; i++) {
    cells._groups[0][i].style.fill = colors(texts._groups[0][i].innerHTML)
  }
}

/**
 * Add labels to X and Y axis of confusion matrix
 */
function cmAddLabels () {
  // X/Y Axis labels
  var vpfLabels = ['Value', 'Policy', 'Fact']

  var labels = cmSVG.append('g')
    .attr('class', 'labels')

  var columnLabels = labels.selectAll('.column-label')
    .data(vpfLabels)
    .enter().append('g')
    .attr('class', 'column-label')
    .attr('transform', function (d, i) { return 'translate(' + cmXScale(i) + ',' + cmHeight + ')' })

  columnLabels.append('text')
    .attr('x', 0)
    .attr('dx', '-0.82em')
    .attr('y', cmYScale.bandwidth() / 2)
    .attr('dy', '.41em')
    .attr('text-anchor', 'end')
    .attr('transform', 'rotate(-90)')
    .text(function (d, i) { return d })
    .attr('class', 'confusionMatrixLabel')

  var rowLabels = labels.selectAll('.row-label')
    .data(vpfLabels)
    .enter().append('g')
    .attr('class', 'row-label')
    .attr('transform', function (d, i) { return 'translate(' + 0 + ',' + cmYScale(i) + ')' })

  rowLabels.append('text')
    .attr('x', -8)
    .attr('y', cmYScale.bandwidth() / 2)
    .attr('dy', '.32em')
    .attr('text-anchor', 'end')
    .text(function (d, i) { return d })
    .attr('class', 'confusionMatrixLabel')
}
