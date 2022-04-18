/**
 * @file Scatter plot for comparing machine learning features
 * @author Matt Foulis
 */

// Layout variables
var fsMargin = { top: 20, right: 20, bottom: 30, left: 60 }
var fsWidth = 500 - fsMargin.left - fsMargin.right
var fsHeight = 250 - fsMargin.top - fsMargin.bottom

// Scale for x and y axis
var fsScaleX
var fsScaleY

// Main SVG element
var fsSVG

// Strings for accessing proposition data
var fsAxisLabels = [['sen_length', 'pos_nouns', 'pos_pnouns', 'pos_verbs', 'pos_adjectives', 'pos_modal_verbs', 'pos_numerical'],
  ['sen_length', 'pos_nouns', 'pos_pnouns', 'pos_verbs', 'pos_adjectives', 'pos_modal_verbs', 'pos_numerical']]

// Strings for axis labels
var fsDisplayLabels = [['Sentence length', 'Total nouns', 'Total proper nouns', 'Total verbs', 'Total adjectives', 'Total modal verbs', 'Total numerical symbols'],
  ['Sentence length', 'Total nouns', 'Total proper nouns', 'Total verbs', 'Total adjectives', 'Total modal verbs', 'Total numerical symbols']]

// Current axis label
var fsParamStringX = fsAxisLabels[0][0]
var fsParamStringY = fsAxisLabels[1][2]

// Keep track of current string
var fsCounterX = 0
var fsCounterY = 2

// Popup to display the values of a point on hover
var fsPopup

/**
 * Returns the fill colour for a node based on its classification label
 * @param {node} node - The current point being placed on the plot
 * @return {string} color - The fill colour to be used
 */
function getPointColour (node) {
  if (node.actual === 'Value') {
    return '#fb85ff'
  } else if (node.actual === 'Fact') {
    return '#486999'
  } else {
    return '#DCFCFE'
  }
}

/**
 * Displays the popup tooltip and updates it to contain the selected node's values
 * @param {node} d - The selected node
 */
function pointOnMouse (d) {
  fsPopup.transition('nodeinfo')
    .duration(50)
    .style('opacity', 1)

  fsPopup.html(fsDisplayLabels[0][fsCounterX % fsAxisLabels[0].length] + ': ' + d[fsParamStringX] + ' ' + fsDisplayLabels[1][fsCounterY % fsAxisLabels[1].length] + ': ' + d[fsParamStringY] + ' ' + d.proposition)
    .style('left', (d3.event.pageX + 10) + 'px')
    .style('top', (d3.event.pageY - 15) + 'px')
}

/**
 * Creates and displays a scatter plot showing machine learning feature values
 */
function displayFeaturesScatter () {
// Popup to display the values of a point on hover
  fsPopup = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0)

  // Setup the SVG
  d3.select('div#scatterPlot')
    .append('div')
    .classed('fsSVG-container', true)
    .append('svg')
    .attr('preserveAspectRatio', 'xMinYMin meet')
    .attr('viewBox', '0 0 550 290')
    .classed('fsSVG-content-responsive', true)
    .classed('scatterPlot', true)
    .append('rect')
    .classed('rect', true)
    .attr('width', fsWidth + fsMargin.left + fsMargin.right)
    .attr('height', fsHeight + fsMargin.top + fsMargin.bottom)

  fsSVG = d3.select('.scatterPlot').append('svg')
    .append('g')
    .attr('transform',
      'translate(' + fsMargin.left + ',' + fsMargin.top + ')')

  // Scale for x axis
  // Between 0 and max
  fsScaleX = d3.scaleLinear()
    .domain([0, d3.max(propositionData, function (d) { return d.sen_length })])
    .range([0, fsWidth])

  fsScaleY = d3.scaleLinear()
    .domain(d3.extent(propositionData, function (d) { return d.pos_verbs }))
    .domain([0, d3.max(propositionData, function (d) { return d.pos_verbs })])
    .range([fsHeight, 0])

  // Add x and y axis
  fsSVG.append('g')
    .attr('transform', 'translate(0,' + fsHeight + ')')
    .attr('class', 'x_axis')
    .call(d3.axisBottom(fsScaleX))

  fsSVG.append('g')
    .attr('class', 'y_axis')
    .call(d3.axisLeft(fsScaleY))

  var scatterBrush = d3.brush()
    .extent([[0, 0], [fsWidth, fsHeight]])
    .on('brush', updateChart)

  fsSVG.append('g')
    .call(scatterBrush)

  // Add points to scatter plot
  fsSVG
    .selectAll('dot')
    .data(propositionData)
    .enter()
    .append('circle')
    .attr('class', 'dot')
    .attr('cx', function (d) { return fsScaleX(d[fsParamStringX]) })
    .attr('cy', function (d) { return fsScaleY(d[fsParamStringY]) })
    .attr('r', 3)
    .style('stroke', 'black')
    .style('fill', function (d) { return getPointColour(d) })
    .attr('id', function (d, i) { return 'node' + i })
    .on('mouseover', function (d) { pointOnMouse(d) })
    .on('mouseout', function (d) {
      fsPopup.transition('nodeinfo') // Hides the popup on mouseout
        .duration(50)
        .style('opacity', 0)
    })

  // Add text to x and y axis
  // Labels are cycled through via click/touch
  fsSVG.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 0 - fsMargin.left)
    .attr('x', 0 - (fsHeight / 2))
    .attr('dy', '1em')
    .style('text-anchor', 'middle')
    .text('Total nouns')
    .attr('class', 'scatterplot_interaction_y')
    .on('mouseover', function () { d3.select('body').style('cursor', 'pointer') })
    .on('mouseout', function () { d3.select('body').style('cursor', 'default') })
    .on('click', updateYAxis)

  fsSVG.append('text')
    .attr('y', fsHeight + fsMargin.bottom + 10)
    .attr('x', fsWidth / 2)
    .attr('dy', '1em')
    .style('text-anchor', 'middle')
    .text('Sentence Length')
    .attr('class', 'scatterplot_interaction_x')
    .on('mouseover', function () { d3.select('body').style('cursor', 'pointer') })
    .on('mouseout', function () { d3.select('body').style('cursor', 'default') })
    .on('click', updateXAxis)

  addLegend()
}

/**
 * Adds a legend to the scatter plot
 */
function addLegend () {
  // Value
  fsSVG.append('circle').attr('cx', 20).attr('cy', -12).attr('r', 6).style('fill', '#fb85ff').style('stroke-width', '1px').style('stroke', 'black').attr('class', 'vpf_legend')
  fsSVG.append('text').attr('x', 30).attr('y', -12).text('Value').style('font-size', '15px').style('fill', 'black').attr('alignment-baseline', 'middle').attr('class', 'vpf_legend')

  // Fact
  fsSVG.append('circle').attr('cx', 120).attr('cy', -12).attr('r', 6).style('fill', '#486999').style('stroke-width', '1px').style('stroke', 'black').attr('class', 'vpf_legend')
  fsSVG.append('text').attr('x', 130).attr('y', -12).text('Fact').style('font-size', '15px').style('fill', 'black').attr('alignment-baseline', 'middle').attr('class', 'vpf_legend')

  // Policy
  fsSVG.append('circle').attr('cx', 220).attr('cy', -12).attr('r', 6).style('fill', '#DCFCFE').style('stroke-width', '1px').style('stroke', 'black').attr('class', 'vpf_legend')
  fsSVG.append('text').attr('x', 230).attr('y', -12).text('Policy').style('font-size', '15px').style('fill', 'black').attr('alignment-baseline', 'middle').attr('class', 'vpf_legend')
}

/**
 * Updates the Y Axis label
 */
function updateYAxis () {
  fsCounterY++
  updateScatter()
  d3.select(this).text(fsDisplayLabels[0][fsCounterY % fsAxisLabels[1].length])
}

/**
 * Updates the X Axis label
 */
function updateXAxis () {
  fsCounterX++
  updateScatter()
  d3.select(this).text(fsDisplayLabels[1][fsCounterX % fsAxisLabels[1].length])
}

/**
 * Updates the scatter plot after user changes the x or y axis
 */
function updateScatter () {
  // Update x and y strings
  fsParamStringX = fsAxisLabels[0][fsCounterX % fsAxisLabels[0].length]
  fsParamStringY = fsAxisLabels[1][fsCounterY % fsAxisLabels[1].length]

  // Update x and y domains
  fsScaleX.domain([0, d3.max(propositionData, function (d) { return d[fsParamStringX] })])
  fsScaleY.domain([0, d3.max(propositionData, function (d) { return d[fsParamStringY] })])

  // Store scatter points
  var points = fsSVG.selectAll('circle')
    .data(propositionData)

  // Move points to new positions
  points
    .transition()
    .duration(1000)
    .attr('cx', function (d) { return fsScaleX(d[fsParamStringX]) })
    .attr('cy', function (d) { return fsScaleY(d[fsParamStringY]) })
    .attr('r', 3)

  // Add new points
  points.enter().append('circle')
    .attr('cx', function (d) { return fsScaleX(d[fsParamStringX]) })
    .attr('cy', function (d) { return fsScaleY(d[fsParamStringY]) })
    .attr('r', 3)
    .attr('class', 'dot')
    .transition()

  // Remove extra points
  points.exit().transition()
    .style('fill', 'red')
    .transition()
    .duration(700)
    .style('opacity', 1e-6)
    .remove()

  // Update x and y axis
  var xaxis = d3.axisBottom(fsScaleX)
  var yaxis = d3.axisLeft(fsScaleY)

  fsSVG.select('.x_axis')
    .transition()
    .duration(1000)
    .call(xaxis)

  fsSVG.select('.y_axis')
    .transition()
    .duration(1000)
    .call(yaxis)

  d3.selectAll('.vpf_legend').remove()
  addLegend()
}

/**
 * Checks if a point on the scatter point is within the brush region
 * @param {array} brushCoords - Coordinates of the brush
 * @param {number} cx - X coordinate for a point
 * @param {number} cy - Y coordinate for a point
 * @returns {boolean} isBrushed - True if the point is within the brushed region, false if not
 */
function isBrushed (brushCoords, cx, cy) {
  var x0 = brushCoords[0][0]
  var x1 = brushCoords[1][0]
  var y0 = brushCoords[0][1]
  var y1 = brushCoords[1][1]
  return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1
}

/**
 * Iterates through scatter points and calls highlight function if required
 */
function updateChart () {
  // Unhighlight all when new selection is made
  d3.selectAll('.selected')
    .each(function (d) {
      unhighlightLength(d.id)
    })

  var extent = d3.event.selection

  var dots = d3.selectAll('.dot')

  // For each dot, check if it falls within the brush region
  dots.classed('selected', function (d) {
    return isBrushed(extent, fsScaleX(d[fsParamStringX]), fsScaleY(d[fsParamStringY]))
  })

  // If within region, pass id to highlight function
  d3.selectAll('.selected')
    .each(function (d) {
      highlightLength(d.id)
    })
}

/**
 * Highlights bar chart at index
 * @see {@link scatter3.js/functionname}
 */
function highlightLength (num) {
  var current = d3.selectAll('#length' + num)

  current.style('fill', '#DCFCFE')
}

/**
 * Un-highlights bar chart at index
 * @see {@link scatter3.js/functionname}
 */
function unhighlightLength (num) {
  var current = d3.selectAll('#length' + num)

  current.style('fill', '#8694aa')
}
