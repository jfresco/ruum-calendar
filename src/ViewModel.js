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

  // The amount of columns that will have the grid
  this.columnsCount = Math.max(...model.groups.map(g => g.length));

  // Decorate each event with its position and size in the grid
  this.events = model.events.map(event => {
    const cellSize = this.columnsCount / getGroup(event).length;
    const gridColumnStart = getGroupNumber(event) + 1;
    const gridColumnEnd = getGroupNumber(event) + cellSize - 1;
    const gridRowStart = timeToRow(event.start);
    const gridRowEnd = timeToRow(event.end);

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
