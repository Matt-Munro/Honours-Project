/**
 * @file Loads required data and calls setup functions for page
 * @author Matt Foulis
 */

// Main data object
var propositionData = []

// Colour information for proposition text highlight
var colorData = []

var csvErrorFound = false

/**
 * Called on website load.
 */
function xaiInit () {
  loadData()
}

/**
 * Called if the CSV data file cannot be loaded.
 */
function loadError () {
  console.log('Error whilst attempting to load CSV data file')
  csvErrorFound = true
}

/**
 * Loads necessary data from CSV file. Calls setup function when complete
 */
function loadData () {
  var filePath = 'data/proposition_data.csv'

  // Attempts to load the CSV file containing the required data
  // If the file cannot be loaded the page will be redirected to the error page
  d3.csv(filePath).catch(err => loadError()).then(function (data) {
    if (!csvErrorFound) {
      data.forEach(function (d) {
        propositionData.push({
          id: d.id,
          proposition: d.proposition,
          sen_length: parseInt(d.sen_length),
          avg_word: d.avg_word_length,
          pos_nouns: parseInt(d.pos_nouns),
          actual: d.actual,
          predicted: d.predicted,
          prediction_value: d.prediction_value,
          prediction_fact: d.prediction_fact,
          prediction_policy: d.prediction_policy,
          speciteller: d.speciteller,
          pos_verbs: d.pos_verbs,
          pos_pnouns: d.pos_pnouns,
          pos_adjectives: d.pos_adjectives,
          pos_modal_verbs: d.pos_modal_verbs,
          pos_numerical: d.pos_numerical
        })

        colorData.push([parseFloat(d.color_w1), parseFloat(d.color_w2), parseFloat(d.color_w3), parseFloat(d.color_w4),
          parseFloat(d.color_w5), parseFloat(d.color_w6), parseFloat(d.color_w7),
          parseFloat(d.color_w8), parseFloat(d.color_w9), parseFloat(d.color_w10), parseFloat(d.color_w11), parseFloat(d.color_w12), parseFloat(d.color_w13),
          parseFloat(d.color_w14), parseFloat(d.color_w15), parseFloat(d.color_w16), parseFloat(d.color_w17), parseFloat(d.color_w18), parseFloat(d.color_w19),
          parseFloat(d.color_w20), parseFloat(d.color_w21), parseFloat(d.color_w22), parseFloat(d.color_w23), parseFloat(d.color_w24),
          parseFloat(d.color_w25), parseFloat(d.color_w26), parseFloat(d.color_w27),
          parseFloat(d.color_w28), parseFloat(d.color_w29), parseFloat(d.color_w30), parseFloat(d.color_w31), parseFloat(d.color_w32),
          parseFloat(d.color_w33), parseFloat(d.color_w34), parseFloat(d.color_w35), parseFloat(d.color_w36),
          parseFloat(d.color_w37), parseFloat(d.color_w38), parseFloat(d.color_w39), parseFloat(d.color_w40), parseFloat(d.color_w41)])
      })

      callSetupFunction()
    } else {
      window.location.href = 'error.html'
    }
  })
}

/**
 * Calls setup functions for page elements
 */
function callSetupFunction () {
  cmDisplay()
  expcmDisplay()
  propositionHighlightSetup()
  VPFBarChartSetup()
  displayFeaturesBarChart()
  displayFeaturesScatter()
  loadShapData()
  setupTfidf()
  setDefinitions()
  textInteractionSetup()
  setupSmoothScroll()
}
