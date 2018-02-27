function View (_document) {
  this.dom = _document
}

View.prototype.render = function (model) {
  const $eventsFragment = this.dom.createDocumentFragment()
  model.events.forEach(event => {
    // Create div
    const $event = this.dom.createElement('div')
    $event.classList.add('event')

    // Set event position with inline styles
    $event.style.gridRowStart = event.gridRowStart
    $event.style.gridRowEnd = event.gridRowEnd
    $event.style.gridColumnStart = event.gridColumnStart
    $event.style.gridColumnEnd = event.gridColumnEnd

    // Create and append inner element
    const $eventInner = this.dom.createElement('span')
    $eventInner.innerHTML = `<div class="title">Sample Item</div><div class="subtitle">Sample description</div>`
    $event.appendChild($eventInner)

    // Add div to fragment
    $eventsFragment.appendChild($event)
  })

  // Commit to DOM
  const $container = this.dom.querySelector('.container')
  $container.style.gridTemplateColumns = `repeat(${model.columnsCount}, auto)`
  // Clear container before insert new elements
  $container.innerHTML = ''
  $container.appendChild($eventsFragment)
}

export default View
