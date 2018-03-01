import MathHelpers from './MathHelpers'

function ViewModel (model) {
  const STEP = 15 // minutes

  function timeToRow (time) {
    return Math.floor(time / STEP) + 1
  }

  function getGroupNumber (event) {
    return model.groups.findIndex(g => g.some(e => e.isEqualTo(event)))
  }

  // Gets an array of Events that are overlapped direct or indirectly to `event`, including itself.
  function getCollisionChain (event) {
    const chain = [event]
    const otherGroups = model.groups.filter(group => group.every(e => !event.isEqualTo(e)))

    while (otherGroups.length > 0) {
      const group = otherGroups.shift()
      // Find in the group an event that overlaps with something of the chain. If there is match, it will be
      // added to the chain.
      const overlappedEvent = group.find(e => chain.some(ev => e.isOverlappedWith(ev)))
      if (overlappedEvent) {
        chain.push(overlappedEvent)
      }
    }

    return chain
  }

  // The amount of columns that will have the grid is the LCM of all possible collisions
  const possibleCollisions = model.events.map(e => getCollisionChain(e).length)
  const columnsCount = MathHelpers.lcmMultiple(possibleCollisions)

  // Decorate each event with its position and size in the grid
  this.events = model.events.map(event => {
    const group = getGroupNumber(event) // zero-based
    const collisionChainLength = getCollisionChain(event).length

    const cellSize = columnsCount / collisionChainLength
    const gridColumnStart = group * cellSize + 1
    const gridColumnEnd = gridColumnStart + cellSize
    const gridRowStart = timeToRow(event.start)
    const gridRowEnd = timeToRow(event.end)

    return {
      ...event,
      cellSize,
      gridColumnStart,
      gridColumnEnd,
      gridRowStart,
      gridRowEnd
    }
  })
}

export default ViewModel
