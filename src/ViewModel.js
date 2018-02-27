import MathHelpers from './MathHelpers'

function ViewModel (model) {
  const STEP = 15 // minutes

  function timeToRow (time) {
    return Math.floor(time / STEP) + 1
  }

  function getGroup (event) {
    return model.groups.find(g => g.some(e => event.isEqualTo(e)))
  }

  function getGroupPosition (event) {
    return model.groups
      .map(g => g.findIndex(e => event.isEqualTo(e)))
      .find(p => p !== -1)
  }

  // The amount of columns that will have the grid
  this.columnsCount = MathHelpers.lcmMultiple(model.events.map(e => e.overlapCount))

  // Decorate each event with its position and size in the grid
  this.events = model.events.map(event => {
    const cellSize = this.columnsCount / getGroup(event).length
    const gridColumnStart = getGroupPosition(event) * cellSize + 1
    const gridColumnEnd = gridColumnStart + cellSize
    const gridRowStart = timeToRow(event.start)
    const gridRowEnd = timeToRow(event.end)

    return {
      ...event,
      gridColumnStart,
      gridColumnEnd,
      gridRowStart,
      gridRowEnd
    }
  })
}

export default ViewModel
