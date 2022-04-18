/**
 * @file Scatter plot to display SHAP values
 * @author Matt Foulis
 * @see The layout and design of the SHAP scatter plot is a reimplementation of the example provided at: https://github.com/slundberg/shap accessed under the MIT licence
 */

// Layout variables
var shapMargin = { top: 20, right: 20, bottom: 30, left: 100 }
var shapWidth = 550 - shapMargin.left - shapMargin.right
var shapHeight = 400 - shapMargin.top - shapMargin.bottom

// Labels for y axis
var shapLabels = ['Sentence length', 'Total nounse', 'Present tense y/n', 'Positive sentiment', 'Negative sentiment', 'Total verbs',
  'Total proper nouns', 'Total particles', 'Past tense y/n', 'Total modal verbs']

// To store shap values data
var shapData = []

// To store training data
var XTestData = []

// To store points on plot
var nodes

// Records if a CSV file load error has been found
var shapCSVLoadError = false

/**
 * Called if the SHAP CSV data file cannot be loaded.
 */
function shapLoadError () {
  console.log('Error whilst attempting to load SHAP CSV data file')
  shapCSVLoadError = true
}

/**
 * Loads SHAP data from CSV file
 */
function loadShapData () {
  var filePath = 'data/shap_data_10.csv'

  d3.csv(filePath).catch(err => shapLoadError()).then(function (data) {
    if (!shapCSVLoadError) {
      // Loops through data and adds to shapData object
      for (var i = 0; i < 10; i++) {
        for (var j = 0; j < 157; j++) {
          shapData.push({ value: parseFloat(data[i][j]), row: i, classification: propositionData[j].actual })
        }
      }

      loadXTestData()
    } else {
      window.location.href = 'error.html'
    }
  })
}

/**
 * Loads X Test data from Machine Learning
 */
function loadXTestData () {
  var filePath = 'data/X_test_data.csv'

  d3.csv(filePath).catch(err => shapLoadError()).then(function (data) {
    if (!shapCSVLoadError) {
      XTestData = data

      displayShap()
    } else {
      window.location.href = 'error.html'
    }
  })
}

/**
 * Creates and displays scatter plot to show SHAP values
 */
function displayShap () {
  // Setup SVG container
  d3.select('div#shap')
    .append('div')
    .classed('svg-container-shap', true)
    .append('svg')
    .attr('preserveAspectRatio', 'xMinYMin meet')
    .attr('viewBox', '0 0 600 400')
    .classed('svg-content-shap', true)
    .classed('shap', true)
    .append('rect')
    .classed('border', true)
    .attr('width', 600)
    .attr('height', 600)

  // Main SVG
  var shapSVG = d3.select('.shap').append('svg')
    .attr('class', 'svg_shap')
    .append('g')
    .attr('transform', 'translate(' + shapMargin.left + ',' + shapMargin.top + ')')

  // Scale for X axis
  var shapScaleX = d3.scaleLinear()
    .domain([-1.75, 1.25])
    .range([0, shapWidth])

  // Scale for Y axis
  var shapScaleY = d3.scaleBand()
    .domain(shapLabels.map(function (d) { return d }))
    .range([0, shapHeight])

  // Add x and y axis
  shapSVG.append('g')
    .attr('transform', 'translate(0,' + shapHeight + ')')
    .attr('class', 'shap_axis_x')
    .call(d3.axisBottom(shapScaleX))

  shapSVG.append('g')
    .attr('class', 'shap_axis_y')
    .call(d3.axisLeft(shapScaleY).tickSize(-shapWidth))
    .select('.domain').remove()

  // Create colour legend
  var legendScale = d3.scaleLinear()
    .domain([1, shapHeight])
    .range(['red', 'blue'])
    .interpolate(d3.interpolateHcl)

  shapSVG.selectAll('.legend')
    .data(d3.range(0, shapHeight - 30))
    .enter()
    .append('rect')
    .attr('class', 'legend')
    .attr('x', shapWidth + 30)
    .attr('y', function (d, i) { return i + 20 })
    .attr('width', 10)
    .attr('height', 2)
    .style('fill', function (d, i) { return legendScale(d) })

  // Add text labels to legend
  shapSVG.append('text')
    .attr('x', shapWidth + 25)
    .attr('y', 0)
    .attr('dy', '1em')
    .text('High')
    .attr('font-size', '1rem')
    .style('fill', 'black')

  shapSVG.append('text')
    .attr('x', shapWidth + 25)
    .attr('y', shapHeight)
    .attr('dy', '1em')
    .text('Low')
    .attr('font-size', '1rem')
    .style('fill', 'black')

  shapSVG.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', (-shapHeight / 2) - 30)
    .attr('y', shapWidth + 50)
    .attr('dy', '1em')
    .text('Feature Value')
    .attr('font-size', '1rem')
    .style('fill', 'black')

  // Add centre line to plot
  shapSVG.append('line')
    .attr('x1', shapScaleX(0))
    .attr('y1', 0)
    .attr('x2', shapScaleX(0))
    .attr('y2', shapHeight)
    .attr('stroke-width', 0.5)
    .attr('stroke', 'black')

  // Store required data for scatter points
  nodes = shapData.map(function (node, index) {
    return {
      index: index,
      x: shapScaleX(node.value),
      y: shapScaleY(shapLabels[node.row]) + 19,
      value: shapScaleX(node.value),
      row: node.row,
      size: 1,
      classification: node.classification
    }
  })

  // Move overlapping elements up or down y axis
  // Plot only shows x value so changing y position does not affect data representation
  // Modified version of code found at:
  // http://bl.ocks.org/ericandrewlewis/dc79d22c74b8046a5512
  // and
  // http://bl.ocks.org/bimannie/cf443db3222b747d3155f8797abc0593
  // Both accessed under the MIT licence
  var simulation = d3.forceSimulation(nodes)
    .force('y', d3.forceY(function (d) { return d.y }).strength(10))
    .force('collide', d3.forceCollide().radius(function (d) { return 1.2 }).strength(1))
    .stop()

  for (var i = 0; i < 150; ++i) simulation.tick() // Process movement of points

  // Plot points on graph
  shapSVG.selectAll('circle')
    .data(nodes)
    .enter().append('circle')
    .style('fill', function (d, i) { return getShapColor(i % 157) })
    .attr('cx', function (d) { return d.x })
    .attr('cy', function (d, i) { return d.y })
    .attr('r', 1.2)
    .style('opacity', 0.8)
}

/**
 * Returns the colour for a point based on the relative value it had within the training data
 * @param {number} index - The index of the element
 * @returns The fill colour for a point
 */
function getShapColor (index) {
  var colorScale = d3.scaleLinear()
    .domain([1, 180])
    .range(['blue', 'red'])
    .interpolate(d3.interpolateHcl)

  switch (index) {
    case 0:
      // Length;
      return colorScale(XTestData[index].length_f)
      break

    default:
      return colorScale(XTestData[index].length_f)
  }
}
