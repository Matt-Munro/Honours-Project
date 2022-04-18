/**
 * @file Creates interactive confusion matrix which allows user to see affect of changing the different values
 * @author Matt Foulis
 * @see Confusion matrix code is an amended version of the following:
 * https://github.com/arpitnarechania/d3-matrix/blob/master/dist/matrix.js
 * Accessed under the MIT licence https://github.com/arpitnarechania/d3-matrix
 */

// Initial matrix values
var expcmValues = [
  [1, 1],
  [1, 1]
]

var colors = d3.scaleLinear()
  .domain([1, 55])
  .range(['#53799b', '#000000'])

// X coordinate for drag
var expcmDragX

// Drag element. Calls expcmOnDrag function
var expcmDrag = d3.drag()
  .on('drag', expcmOnDrag)

// Stores text from matrix elements
var expcmBoxTexts

// Layout variables
var expcmMargin = { top: 5, right: 60, bottom: 90, left: 90 }
var expcmWidth = 400 - expcmMargin.left - expcmMargin.right
var expcmHeight = 400 - expcmMargin.top - expcmMargin.bottom

/**
 * Creates and displays the confusion matrix.
 */
function expcmDisplay () {
  // X and Y axis labels
  var expcmLabelValues = ['True', 'False']

  d3.select('div#exp_confusion')
    .append('div')
    .classed('svg-container-exp_confusion', true)
    .append('svg')
    .attr('preserveAspectRatio', 'xMinYMin meet')
    .attr('viewBox', '0 0 400 400')
    .classed('svg-content-exp_confusion', true)
    .classed('exp_confusion', true)
    .append('rect')
    .classed('rect', true)
    .style('stroke-width', '0px')
    .attr('width', expcmWidth + expcmMargin.left + expcmMargin.right)
    .attr('height', expcmHeight + expcmMargin.top + expcmMargin.bottom)

  // Main SVG element
  var expcmSVG = d3.select('.exp_confusion').append('svg')
    .append('g')
    .attr('transform',
      'translate(' + expcmMargin.left + ',' + expcmMargin.top + ')')

  // X scale for positioning values on x axis
  var expcmXScale = d3.scaleBand()
    .domain(d3.range(expcmValues[0].length))
    .range([0, expcmWidth])

  // Y scale for positioning values on y axis
  var expcmYScale = d3.scaleBand()
    .domain(d3.range(expcmValues.length))
    .range([0, expcmHeight])

  // Setup matrix rows
  var expcmRow = expcmSVG.selectAll('.expcmRow')
    .data(expcmValues)
    .enter()
    .append('g')
    .attr('class', 'expcmRow')
    .attr('index', function (d, i) { return i })
    .attr('transform', function (d, i) { return 'translate(0,' + expcmYScale(i) + ')' })

  // Setup matrix cells
  var expcmCell = expcmRow.selectAll('.expcmCell')
    .data(function (d) { return d })
    .enter().append('g')
    .attr('class', 'expcmCell')
    .attr('transform', function (d, i) { return 'translate(' + expcmXScale(i) + ', 0)' })

  // Append rectangles to matrix cells
  expcmCell.append('rect')
    .attr('width', expcmXScale.bandwidth())
    .attr('height', expcmYScale.bandwidth())
    .style('stroke', 'black')
    .style('stroke-width', '1px')
    .attr('class', 'expcmCell_rect')
    .attr('id', function (d, i) { return i + this.parentNode.parentNode.getAttribute('index') })
    .style('fill', function (d, i) { return getCellColour(d3.select(this)) })
    .on('mouseover', function (d, i) {
      highlightDefinition(this.getAttribute('id'))
    })

  // Add text to cells
  expcmCell.append('text')
    .attr('dy', '.32em')
    .attr('x', expcmXScale.bandwidth() / 2)
    .attr('y', expcmYScale.bandwidth() / 2)
    .attr('text-anchor', 'middle')
    .attr('class', 'exp_box_text')
    .attr('id', function (d, i) { return i + this.parentNode.parentNode.getAttribute('index') })
    .text(function (d, i) { return d })
    .on('mouseover', expcmMatrixDrag) // Prepare for drag interaction
    .on('mouseout', function () {
      d3.select('body').style('cursor', 'default')
    })

  // Add drag text
  expcmCell.append('text')
    .attr('x', expcmXScale.bandwidth() / 2)
    .attr('y', expcmYScale.bandwidth() / 2 - 30)
    .attr('text-anchor', 'middle')
    .text('drag')
    .attr('class', 'expConfusionDragText')

  // Store matrix text
  expcmBoxTexts = d3.selectAll('.exp_box_text')

  // Store axis labels
  var expcmLabels = expcmSVG.append('g')
    .attr('class', 'expcmLabels')

  // Add group for x axis
  var expcmColumnLabels = expcmLabels.selectAll('.exp_column-label')
    .data(expcmLabelValues)
    .enter().append('g')
    .attr('class', 'exp_column-label')
    .attr('transform', function (d, i) { return 'translate(' + expcmXScale(i) + ',' + expcmHeight + ')' })

  // Add text for x axis labels
  expcmColumnLabels.append('text')
    .attr('x', expcmYScale.bandwidth() / 2 + 25)
    .attr('dx', '-0.10em')
    .attr('y', expcmYScale.bandwidth() / 5)
    .attr('text-anchor', 'end')
    .attr('class', 'expConfusionMatrixText')
    .text(function (d, i) { return d })

  // Add group for y axis
  var expcmRowLabels = expcmLabels.selectAll('.expcmRow-label')
    .data(expcmLabelValues)
    .enter().append('g')
    .attr('class', 'expcmRow-label')
    .attr('transform', function (d, i) { return 'translate(' + 0 + ',' + expcmYScale(i) + ')' })

  // Add text for y axis labels
  expcmRowLabels.append('text')
    .attr('x', -8)
    .attr('y', expcmYScale.bandwidth() / 2 + 10)
    .attr('dy', '.32em')
    .attr('text-anchor', 'end')
    .attr('class', 'expConfusionMatrixText')
    .text(function (d, i) { return d })
}

/**
 * Provides the colour for each cell of the matrix
 * @returns {string} Colour - The colour for the cell
 */
function getCellColour (index) {
  index = index._groups[0][0].innerHTML

  return colors(index)
}

/**
 * Called when user mousesover a matrix text.
 * Change cursor style and call drag element
 */
function expcmMatrixDrag () {
  d3.select('body').style('cursor', 'col-resize') // Change cursor style

  expcmBoxTexts.call(expcmDrag)
}

/**
 * Checks X position of user interaction during drag and increases/decreases selected matrix value based on direction
 */
function expcmOnDrag () {
  var cells = d3.selectAll('.expcmCell_rect')
  var texts = d3.selectAll('.exp_box_text')

  cells._groups[0][0].style.fill = colors(texts._groups[0][0].innerHTML)
  cells._groups[0][1].style.fill = colors(texts._groups[0][1].innerHTML)
  cells._groups[0][2].style.fill = colors(texts._groups[0][2].innerHTML)
  cells._groups[0][3].style.fill = colors(texts._groups[0][3].innerHTML)

  //   getCellColour(d3.select(this))
  var current = parseInt(d3.select(this)._groups[0][0].innerHTML)

  if (expcmDragX > d3.event.x) { // User is dragging to the right, decrease value
    if (current <= 0) {
      current = 0
    } else {
      current -= 1
    }
  } else if (expcmDragX === d3.event.x) { // No movement, don't change value

  } else { // User is dragging to the left, decrease value
    current += 1
  }

  d3.select(this).text(current) // Update value

  expcmDragX = d3.event.x

  updateMatrixArray()
  updateAccuracyValues()
}

/**
 * Updates matrix object with values from interactive matrix on webpage
 */
function updateMatrixArray () {
  expcmValues[0][0] = parseInt(expcmBoxTexts._groups[0][0].innerHTML)
  expcmValues[0][1] = parseInt(expcmBoxTexts._groups[0][1].innerHTML)
  expcmValues[1][0] = parseInt(expcmBoxTexts._groups[0][2].innerHTML)
  expcmValues[1][1] = parseInt(expcmBoxTexts._groups[0][3].innerHTML)
}

/**
 * Changes style of definition cell based on user mouseover
 * @example If user hovers over box 1, the True Positive definition will be highlighted
 */
function highlightDefinition (num) {
  d3.select('#truePositiveDefinition').attr('class', 'notCurrentDefinition')
  d3.select('#falsePositiveDefinition').attr('class', 'notCurrentDefinition')
  d3.select('#falseNegativeDefinition').attr('class', 'notCurrentDefinition')
  d3.select('#trueNegativeDefinition').attr('class', 'notCurrentDefinition')

  switch (num) {
    case '00':
      d3.select('#truePositiveDefinition').attr('class', 'currentDefinition')
      break

    case '01':
      d3.select('#falseNegativeDefinition').attr('class', 'currentDefinition')
      break

    case '10':
      d3.select('#falsePositiveDefinition').attr('class', 'currentDefinition')
      break

    case '11':
      d3.select('#trueNegativeDefinition').attr('class', 'currentDefinition')
      break

    default:
      console.log('Error, matrix highlight could not be selected')
  }
}

/**
 * Updates accuracy values on webpage.
 * Calculates: precision, sensitivity, specificity, accuracy, and f1score
 */
function updateAccuracyValues () {
  var expcmPrecision
  var expcmSensitivity
  var expcmSpecificity
  var expcmAccuracy
  var expcmF1
  var expcmTruePositive = expcmValues[0][0]
  var expcmFalsePositive = expcmValues[0][1]
  var expcmFalseNegative = expcmValues[1][0]
  var expcmTrueNegative = expcmValues[1][1]

  // Precision
  expcmPrecision = expcmTruePositive / (expcmTruePositive + expcmFalsePositive)
  d3.select('#exp_matrix_precision').text(expcmPrecision.toFixed(4))

  // Sensitivity
  expcmSensitivity = expcmTruePositive / (expcmTruePositive + expcmFalseNegative)
  d3.select('#exp_matrix_sensitivity').text(expcmSensitivity.toFixed(4))

  // Specificity
  expcmSpecificity = expcmTrueNegative / (expcmFalsePositive + expcmTrueNegative)
  d3.select('#exp_matrix_specificity').text(expcmSpecificity.toFixed(4))

  // Accuracy
  expcmAccuracy = (expcmTruePositive + expcmTrueNegative) / (expcmTruePositive + expcmTrueNegative + expcmFalsePositive + expcmFalseNegative)
  d3.select('#exp_matrix_accuracy').text(expcmAccuracy.toFixed(4))

  // F1 Score
  expcmF1 = (2 * expcmTruePositive) / ((2 * expcmTruePositive) + expcmFalsePositive + expcmFalseNegative)
  d3.select('#exp_matrix_f1').text(expcmF1.toFixed(4))
}
