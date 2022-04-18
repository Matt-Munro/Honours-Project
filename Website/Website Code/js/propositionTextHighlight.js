/**
 * @file Creates and initialises proposition text interactive element. Allows user to select word in a proposition and see it's LIME value
 * @author Matt Foulis
 */

var propositionActualCounter = 0
var propositionPredictedCounter = 0
var propositionTypesStrings = ['Value', 'Policy', 'Fact']

/**
 * Sets up svg element and calls header and sentence display functions when complete
 */
function propositionHighlightSetup () {
  d3.select('div#proposition_text_highlight')
    .append('div')
    .classed('svg-container-text', true)
    .append('svg')
    .attr('preserveAspectRatio', 'xMinYMin meet')
    .attr('viewBox', '0 0 600 200')
    .classed('svg-content-responsive', true)
    .classed('proposition_text_highlight', true)

  propositionHighlightHeaderSetup()
  displaySelectedSentence(0)
  printPropositions()
}

/**
 * Adds interactive functionality to headers
 */
function propositionHighlightHeaderSetup () {
  // Adds ability to click through proposition classification values for 'actual' header
  d3.select('.heading_true_classification')
    .on('mouseover', function () { d3.select('body').style('cursor', 'pointer') })
    .on('mouseout', function () { d3.select('body').style('cursor', 'default') })
    .on('click', function () {
      // On click, updates header string and calls print function to update displayed sentences
      propositionActualCounter++
      d3.select(this).text(propositionTypesStrings[propositionActualCounter % propositionTypesStrings.length])
      printPropositions()
    })

  // Adds ability to click through proposition classification values for 'predicted' header
  d3.select('.heading_predicted_classification')
    .on('mouseover', function () { d3.select('body').style('cursor', 'pointer') })
    .on('mouseout', function () { d3.select('body').style('cursor', 'default') })
    .on('click', function () {
      // On click, updates header string and calls print function to update displayed sentences
      propositionPredictedCounter++
      d3.select(this).text(propositionTypesStrings[propositionPredictedCounter % propositionTypesStrings.length])
      printPropositions()
    })
}

/**
 * Provides y coordinate for proposition text. Prevents sentence overrunning off screen
 * @param {int} index - The index of the word in the sentence
 * @returns {int} y coordinate - The y coordinate of the word
 */
function getPropositionY (index) {
  // If 12th or 24th word have been reached, start new line
  if (index === 9) {
    return 50
  } else if (index === 18) {
    return 80
  } else if (index === 27) {
    return 110
  } else if (index === 36) {
    return 140
  }
}

/**
 * Returns x coordinate for proposition text. Prevents sentence overrunning off screen
 * @param {int} index - The index of the word in the sentence
 * @returns {int} x coordinate - The x coordinate of the word
 */
function getPropositionX (index) {
  // If 12th or 24th word have been reached, start new line
  if (index === 9) {
    return 15
  } else if (index === 18) {
    return 15
  } else if (index === 27) {
    return 15
  } else if (index === 36) {
    return 15
  }
}

/**
 * Returns fill colour for word based on LIME value
 * @param {int} index - The index of the word in the sentence
 * @param {int} selectedSentenceNum - The index of the sentence selected by the user
 * @returns {string} colour - The fill colour for the word
 */
function getPropositionColour (index, selectedSentenceNum) {
  if (parseFloat(colorData[selectedSentenceNum][index]) > 0.01) {
    return 'green'
  } else if (colorData[selectedSentenceNum][index] < -0.01) {
    return 'red'
  } else {
	return 'black'
  }
}

/**
 *
 * @param {string} word - The word currently highlighted by the user
 * @param {int} index - The index of the word in the sentence
 * @param {int} selectedSentenceNum - The index of the sentence selected by the user
 */
function propositionTextOnMouse (word, index, selectedSentenceNum) {
  d3.select('.current_word').remove()
  d3.select('.current_word_div')
    .append('h3')
    .attr('class', 'current_word')
    .text('WORD:  ' + word)
    .append('h3')
    .attr('class', 'current_word')
    .text('LIME VALUE:  ' + colorData[selectedSentenceNum][index])
}

/**
 * Displays the selected proposition
 * @param {int} selectedSentenceNum - The index of the sentence selected by the user
 */
function displaySelectedSentence (selectedSentenceNum) {
  // Update data by taking currently selected sentence number and store value from proposition data
  currentPropositionData = []
  currentPropositionData.push(propositionData[selectedSentenceNum])

  // Removes texts so sentence disappears when new one is selected
  d3.selectAll('.texts').remove()

  // Setup group for proposition texts
  var graph1 = d3.select('.proposition_text_highlight')
    .append('g')
    .attr('class', 'texts')

  // Setup text elements
  var texts = graph1.selectAll('text')
    .data(currentPropositionData)
    .enter()
    .append('text')
    .attr('id', 'propositionText')
    .attr('y', 20)
    .attr('x', 15)

  // Split sentences by word so they can be selected by the user individually
  var propositionWord = currentPropositionData[0].proposition.split(' ')

  // Setup text elements as tspans. One for each word
  texts.selectAll('tspan')
    .data(propositionWord)
    .enter()
    .append('tspan')
    .classed('tspan_text', true)
    .attr('y', function (d, i) { return getPropositionY(i) })
    .attr('x', function (d, i) { return getPropositionX(i) })
    .style('fill', function (d, i) { return getPropositionColour(i, selectedSentenceNum) })
    .text(function (d, i) { return d + ' ' }) // Append word and space
    .on('mouseover', function (d, i) { return propositionTextOnMouse(d, i, selectedSentenceNum) })
}

/**
 * Displays the propositions which match the selected 'true' classification and 'predicated' classification
 */
function printPropositions () {
  // Remove sentences when new selection is made
  d3.selectAll('.true_positive').remove()

  // For each sentence, check if true and predicted classification match, in which case display the sentence
  for (var i = 0; i < propositionData.length; i++) {
    if (propositionData[i].actual === propositionTypesStrings[propositionActualCounter % propositionTypesStrings.length] &&
    propositionData[i].predicted === propositionTypesStrings[propositionPredictedCounter % propositionTypesStrings.length]) {
      d3.select('.true_positive_div')
        .append('p')
        .attr('class', 'true_positive')
        .text(propositionData[i].proposition)
        .attr('id', propositionData[i].id)
        .on('mouseover', function () { d3.select('body').style('cursor', 'pointer') })
        .on('mouseout', function () { d3.select('body').style('cursor', 'default') })
        .on('click', function (d) {
          d3.selectAll('.true_positive').style('border', 'none')
          d3.selectAll('.true_positive').style('background-color', '#b0c1cb') // reset color

          d3.select(this).style('border-top', '1px solid black')
          d3.select(this).style('border-bottom', '1px solid black')
          d3.select(this).style('background-color', 'white') // highlight selection

          var current = this.getAttribute('id')
          updateVPFChart(current)
          displaySelectedSentence(current)
        })
    }
  }
}
