import MathHelpers from './MathHelpers'

function ViewModel (model) {
  const STEP = 15 // minutes

  function timeToRow (time) {
    return Math.floor(time / STEP) + 1
  }

  function getGroup (event) {
    return model.groups.find(g => g.some(e => event.isEqualTo(e)))
  }

  function getGroupNumber (event) {
    return model.groups.findIndex(g => g.some(e => e.isEqualTo(event)))
  }

  function getCollisionChain (event) {
    const chain = [{ group: getGroupNumber(event), event }]
    let otherGroups = model.groups.filter(group => group.every(e => !event.isEqualTo(e)))
    while (otherGroups.length > 0) {
      const group = otherGroups[0]
      otherGroups = otherGroups.slice(1)
      const overlappedEvent = group.find(e => chain.some(({ event }) => e.isOverlappedWith(event)))
      if (overlappedEvent) {
        chain.push({ group: getGroupNumber(overlappedEvent), event: overlappedEvent })
      }
    }
    return chain
  }

  function range (min, max) {
    return Array.from({ length: max + 1 }).map((_, i) => i).slice(min)
  }

  // The amount of columns that will have the grid
  // const columnsCount = MathHelpers.lcmMultiple(range(1, model.groups.length))
  // const columnsCount = model.groups.length
  const possibleCollisions = model.events.map(e => getCollisionChain(e).length)
  console.log('possibleCollisions', possibleCollisions)
  const columnsCount = MathHelpers.lcmMultiple(possibleCollisions)
  console.log('columnsCount', columnsCount)
  // Decorate each event with its position and size in the grid
  this.events = model.events.map(event => {
    const group = getGroupNumber(event)
    const collisions = getCollisionChain(event).length
    console.log('event', event, 'collisions', getCollisionChain(event))
    const cellSize = columnsCount / collisions
    const gridColumnStart = group * cellSize + 1
    const gridColumnEnd = gridColumnStart + cellSize
    const gridRowStart = timeToRow(event.start)
    const gridRowEnd = timeToRow(event.end)

    return {
      ...event,
      cellSize,
      group,
      collisions,
      gridColumnStart,
      gridColumnEnd,
      gridRowStart,
      gridRowEnd
    }
  })
}

export default ViewModel
