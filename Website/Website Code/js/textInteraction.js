/**
 * @file Adds drag and click interaction to text elements
 * @author Matt Foulis
 */

// X coordinate of user drag
var textDragX

// Strings to cycle through on click
var textClickValues = ['x', '+', '-']
var textClickValuesCounter = 0 // Keep track of current string

// Stores interaction items
var textInteraction

// D3 drag item for user interaction
// Calls interactiveTextOnDrag when drag initiated
var textDrag = d3.drag()
  .on('drag', interactiveTextOnDrag)

/**
 * Setup interaction with text to allow user to change values.
 * Drag is used to alter numbers and click is used to cycle through string values
 */
function textInteractionSetup () {
  textInteraction = d3.selectAll('.iaNumValue')
    .on('mouseover', interactiveTextOnClick)
    .on('mouseout', function () {
      d3.select('body').style('cursor', 'default')
    })

  var texts = d3.selectAll('.iaTextClickValue')
    .on('click', function () {
      // Update counter and display next string
      textClickValuesCounter++
      // Modulus allows new strings to be added without any changes required here.
      d3.select(this).text(textClickValues[textClickValuesCounter % textClickValues.length])
      updateTextIneractionResult()
    })
    .on('mouseover', function () {
      d3.select('body').style('cursor', 'pointer')
    })
    .on('mouseout', function () {
      d3.select('body').style('cursor', 'default')
    })
}

/**
 * Updates cursor and initiates drag interaction response
 */
function interactiveTextOnClick () {
  d3.select('body').style('cursor', 'col-resize')

  textDragX = d3.event.x

  textInteraction.call(textDrag)
}

/**
 * Checks current user ineraction X coordinate and updates value based on drag direction
 */
function interactiveTextOnDrag (d) {
  // Store current value of interaction element
  var current = parseInt(d3.select(this)._groups[0][0].innerText)

  // User is moving to the left, decrease value
  if (textDragX > d3.event.x) {
    if (current <= 0) {
      current = 0
    } else {
      current -= 1
    }
  } else if (textDragX === d3.event.x) {
    // User is not moving, don't change
  } else {
    // User is dragging to the right, increase value
    current += 1
  }

  // Update interaction element value
  d3.select(this).text(current)
  textDragX = d3.event.x

  updateTextIneractionResult()
}

/**
 * Performs calculations based on interaction numbers and updates result element
 */
function updateTextIneractionResult () {
  // Store result element
  var methodNums = d3.selectAll('.iaNumValue')

  // Store interactive number values
  var n1 = parseInt(methodNums._groups[0][0].innerText)
  var n2 = parseInt(methodNums._groups[0][1].innerText)

  // Check currently selected interactive string and perform appropriate calculation
  var result = 0
  switch (textClickValuesCounter % textClickValues.length) {
    case 0:
      result = n1 * n2
      break

    case 1:
      result = n1 + n2
      break

    case 2:
      result = n1 - n2
      break

    default:
      console.log('Error, invalid text interaction')
  }

  // Update result
  d3.select('.iaNumResultValue').text(result)
}
