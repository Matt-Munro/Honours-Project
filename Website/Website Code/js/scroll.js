/**
 * @file Controls behaviour of the website when scrolling
 * @author Matt Foulis
 */

/**
 * Changes the colour of the navigation bar link when clicked or scrolled to
 * @param {string} id - The id of the link element to alter
 */
function scrollOn (id) {
  var links = document.getElementById('pageLinks').childNodes

  // Reset all links to default
  for (var i = 0; i < links.length; i++) {
    if (links[i].nodeName.toLowerCase() === 'a') {
      links[i].style.color = '#9EB3C2'
      links[i].style.textDecoration = 'none'
    }
  }

  // Set current link to white
  document.getElementById(id).style.color = 'white'
  document.getElementById(id).style.textDecoration = 'underline'
}

function setupSmoothScroll () {
  $(document).ready(function () {
    $('a').click(function () {
      if ($($(this).attr('href')).offset() !== undefined) {
        $('html, body').animate({ scrollTop: $($(this).attr('href')).offset().top }, 750)
        window.location.hash = $(this).attr('href')
      }
    })
  })
}
