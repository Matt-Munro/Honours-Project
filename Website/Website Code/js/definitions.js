/**
 * @file Adds interactive functionality for displaying definitions
 * @author Matt Foulis
 */

/**
 * Adds definitions to page when word is selected by user.
 * Changes background colour of selected item and updates definition text.
 */
function setDefinitions () {
  // Definitions. Accessed using word as key to obtain definition
  var definitionStrings = {
    precision: '<b>Precision</b><br />This measures the actual number of True cases compared to the instances that our model has predicted as True. In other words, our model says these cases are True, how many times is it correct? For our dog identification example, this means if our model identifies 10 photos as containing dogs, but only 5 actually do, our precision is 5/10, or 0.5.<br /> Precision = True Positive / (True Positive + False Positive)',
    recall: '<b>Recall</b><br />This measure the number of correct identifications compared to the total number of True cases. If our model identifies 15 images as containing dogs, but misses the other 5 images that also contain dogs, our recall is 15/20, or 0.75.<br/>Recall = True Positives / (True Positives + False Negatives)',
    specificity: '<b>Specificity</b><br />This measures the number of False cases which are actually False. If our model identifies 10 images as not containing dogs, but misses another 15 which do not contain dogs, our specificity is 10/25, or 0.4. <br />Specificity = True Negatives / (True Negatives + False Negatives)',
    accuracy: '<b>Accuracy</b><br />This measures the number of instances our model got right. If we have 20 predictions that are correct, out of a total of 40, our accuracy is 20/40, or 0.5. Although useful, accuracy can be misleading if the data used is unbalanced. In cases where there are fewer True cases for example, a model which always picks False, may still be able to achieve a high result. <br />Accuracy = True Positives + True Negatives / True Positives + True Negatives + False Positives + False Negatives ',
    f1score: '<b>F1 Score</b> <br />This uses both precision and recall to provide a more useful measurement than accuracy alone. <br />F1 = 2 * (precision * recall) / (precision + recall) ',
    truepositives: 'The prediction correctly indicates that a condition does hold',
    falsepositives: 'The prediction indicates that a condition does hold, while in fact it does not',
    falsenegatives: 'The prediction indicates that a condition does not hold, while in fact it does',
    truenegatives: 'The prediction correctly indicates that a condition does not hold',
    tf: 'Term Frequency = <br />(number of times the term ‘computer’ appears in a document) / (total number of words in the document)',
    idf: 'Inverse Document Frequency = <br />log(total number of documents / number of documents containing the word ‘computer’)',
    tfidf: 'Term frequency-inverse document frequency = <br />term frequency * inverse document frequency '
  }

  // Adds interaction behaviour to definition class items.
  d3.selectAll('.definition')
    .on('mouseover', function () {
      d3.select('body').style('cursor', 'pointer') // Set cursor appearance
    })
    .on('mouseout', function () {
      d3.select('body').style('cursor', 'default') // Revert cursor appearance
    })
    .on('click', function (d) {
      var selectedWord = d3.select(this)

      // Get text of cell and use to access definitions object
      var corrected = selectedWord._groups[0][0].cells[0].innerText
      corrected = corrected.toLowerCase()
      corrected = corrected.replace(/ /g, '') // Remove spaces (e.g. f1 score)

      // Compose ID of destination for definition string
      // Definitions used in multiple tables so here the correct one is chosen
      var destination = '#' + selectedWord._groups[0][0].id + '_destination'

      // Update definition string using ID to access element
      d3.select(destination).html(definitionStrings[corrected])
    })
}
