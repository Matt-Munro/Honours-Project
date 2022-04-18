/**
 * @file Interactive demonstration of how tf-idf is calculated
 * @author Matt Foulis
 */

// Main SVG element
var tfidfSVG

// Image of words within document image
var documentWords

// Image of total number of documents
var totalDocumentsImage

// X Coordinate of drag interaction
var tfidfDragX

/**
 * Creates and displays the interactive tf-idf element
 */
function setupTfidf () {
  // Gather variables from user input
  var documentSize = parseInt(d3.select('#tfidf_document_size')._groups[0][0].innerText)
  var totalDocs = parseInt(d3.select('#tfidf_total_docs')._groups[0][0].innerText)
  var containingDocs = parseInt(d3.select('#tfidf_containing_docs')._groups[0][0].innerText)

  // d3 drag element for adjusting values
  var tfidfDrag = d3.drag()
    .on('drag', tfidfDragBegin)

  // Setup user interaction elements
  var tfidfInteraction = d3.selectAll('.tfidf_interaction')
    .on('mouseover', function () {
      d3.select('body').style('cursor', 'col-resize')
      tfidfDragX = d3.event.x
      tfidfInteraction.call(tfidfDrag)
    })
    .on('mouseout', function () {
      d3.select('body').style('cursor', 'default')
    })

  // Main SVG
  tfidfSVG = d3.select('div#tfidf_image')
    .append('svg')
    .attr('preserveAspectRatio', 'xMinYMin meet')
    .attr('viewBox', '0 0 350 290')
    .classed('tfidf_image', true)

  // Create document image svg
  tfidfSVG
    .append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', 150)
    .attr('height', 200)
    .style('fill', 'white')
    .style('stroke', 'black')

  // Create word images on document image
  documentWords = tfidfSVG.selectAll('.document_words')
    .data(d3.range(0, 81))
    .enter()
    .append('rect')
    .attr('class', 'document_words')
    .attr('width', 10)
    .attr('height', 3)
    .style('stroke', 'black')
    .style('stroke-width', function (d, i) {
      if (i < documentSize) {
        return '0.5px'
      } else {
        return '0px'
      }
    })
    .style('fill', function (d, i) {
      if (i < documentSize) {
        if (i === 0) { return '#00ff08' } else return 'black'
      } else {
        return 'white'
      }
    })
    .attr('x', function (d, i) {
      return 10 + 15 * (i % 9)
    })
    .attr('y', function (d, i) {
      return 15 + parseInt((i / 9)) * 20
    })

  // Create folder images
  totalDocumentsImage = tfidfSVG.selectAll('.document_folders')
    .data(d3.range(0, 42))
    .enter()
    .append('image')
    .attr('class', 'document_folders')
    .attr('width', 20)
    .attr('height', 20)
    .attr('xlink:href', function (d, i) {
      if (i < containingDocs) { return 'images/doc_contains.png' } else { return 'images/doc.png' }
    })
    .attr('x', function (d, i) {
      return 220 + 20 * (i % 6)
    })
    .attr('y', function (d, i) {
      return 5 + parseInt((i / 6)) * 25
    })
    .style('visibility', function (d, i) {
      if (i < totalDocs) { return '' } else { return 'hidden' }
    })
}

/**
 * Drag function to alter tfidf values on user interaction
 */
function tfidfDragBegin () {
  // Text of the current element being dragged
  var current = parseInt(d3.select(this)._groups[0][0].innerText)

  if (tfidfDragX > d3.event.x) {
    if (current <= 0) {
      current = 0
    } else {
      current -= 1
    }
  } else if (tfidfDragX === d3.event.x) {

  } else {
    current += 1
  }

  d3.select(this).text(current)

  // Stop word frequency being larger than document size

  // Number of words being presented
  var currentMaxWords = parseInt(d3.select('#tfidf_document_size')._groups[0][0].innerText)

  // Number of documents being presented
  var currentMaxDocuments = parseInt(d3.select('#tfidf_total_docs')._groups[0][0].innerText)

  // Number of highlighted words being presented

  // Current element being dragged
  var currentElement = d3.select(this)._groups[0][0]

  if (currentElement.id === 'tfidf_word_freq') { // Stop highlighted words being more than total
    if (parseInt(currentElement.innerText) > currentMaxWords) {
      currentElement.innerText = currentMaxWords
    }
  } else if (currentElement.id === 'tfidf_containing_docs') { // Stop highlighted documents being more than total
    if (parseInt(currentElement.innerText) > currentMaxDocuments) {
      currentElement.innerText = currentMaxDocuments
    }
  } else if (currentElement.id === 'tfidf_document_size') { // Stop highlighted words being more than total when total is reduced
    if (parseInt(currentElement.innerText) < parseInt(d3.select('#tfidf_word_freq')._groups[0][0].innerText)) {
      d3.select('#tfidf_word_freq')._groups[0][0].innerText = currentElement.innerText
    }
  } else if (currentElement.id === 'tfidf_total_docs') { // Stop highlighted documents being more than total when total is reduced
    if (parseInt(currentElement.innerText) < parseInt(d3.select('#tfidf_containing_docs')._groups[0][0].innerText)) {
      d3.select('#tfidf_containing_docs')._groups[0][0].innerText = currentElement.innerText
    }
  }

  tfidfDragX = d3.event.x

  tfidfUpdateResult()
}

/**
 * Recalculates and updates the tf-idf results elements
 */
function tfidfUpdateResult () {
// required:
//
// Term-frequency:
// doc_size = Size of document in question
// wordFreq = Occurunces of specific word in document
// tf = wordFreq / doc_size
//
// Inverse-document frequency
// totalDocs = total number of documents
// containingDocs = number of documents containing word
// idf = log(totalDocs / cotaining_docs)
//
// tfidf = tf * idf

  // Obtain current element values
  var documentSize = parseInt(d3.select('#tfidf_document_size')._groups[0][0].innerText)
  var wordFreq = parseInt(d3.select('#tfidf_word_freq')._groups[0][0].innerText)
  var termFreq = wordFreq / documentSize

  var totalDocs = parseInt(d3.select('#tfidf_total_docs')._groups[0][0].innerText)
  var containingDocs = parseInt(d3.select('#tfidf_containing_docs')._groups[0][0].innerText)
  var inverseDocumentFrequency = Math.log(totalDocs / containingDocs)

  var tfidf = termFreq * inverseDocumentFrequency

  // Update value
  d3.select('#tfidf_result').text(tfidf.toFixed(4))

  // Add ellipses to indicate more words/folders in images
  if (documentSize > 81) {
    d3.selectAll('.ellipses').remove()

    tfidfSVG.append('text')
      .attr('class', 'ellipses')
      .attr('x', 70)
      .attr('y', 190)
      .style('font-size', '2rem')
      .text('...')
  } else {
    d3.selectAll('.ellipses').remove()
  }

  if (totalDocs > 42) {
    d3.selectAll('.doc_ellipses').remove()

    tfidfSVG.append('text')
      .attr('class', 'doc_ellipses')
      .attr('x', 280)
      .attr('y', 190)
      .style('font-size', '2rem')
      .text('...')
  } else {
    d3.selectAll('.doc_ellipses').remove()
  }

  // Update words image
  documentWords
    .transition()
    .duration(10)
    .style('stroke', 'black')
    .style('stroke-width', function (d, i) {
      if (i < documentSize) {
        return '0.5px'
      } else {
        return '0px'
      }
    })
    .style('fill', function (d, i) {
      if (documentSize <= i) { return 'white' }

      if (i < wordFreq) { return '#00ff08' } else { return 'black' }
    })

  // Update folder images
  totalDocumentsImage
    .transition()
    .duration(10)
    .style('visibility', function (d, i) {
      if (i < totalDocs) { return '' } else { return 'hidden' }
    })
    .attr('xlink:href', function (d, i) {
      if (i < containingDocs) { return 'images/doc_contains.png' } else { return 'images/doc.png' }
    })

  d3.select('#tfidf_result_tf').text(termFreq.toFixed(4))
  d3.select('#tfidf_result_idf').text(inverseDocumentFrequency.toFixed(4))
  d3.select('#tfidf_result_tfidf').text(tfidf.toFixed(4))
}
