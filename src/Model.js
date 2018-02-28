import Event from './Event'

function Model (_events) {
  // Compare function for Array#sort. Allows to sort by an object property
  function by (property) {
    return function (a, b) {
      if (a[property] < b[property]) {
        return -1
      }
      if (a[property] > b[property]) {
        return 1
      }

      return 0
    }
  }

  // Returns the maximum overlapping of an event in its group or groups
  function getOverlapCount (event) {
    let count = 0
    groups
      .filter(g => g.some(e => e.isEqualTo(event)))
      .forEach(g => {
        if (g.length > count) {
          count = g.length
        }
      })
    return count
  }

  this.events = _events.map(e => new Event(e)).sort(by('start'))

  const groups = [];
  for (var i = 0; i < this.events.length; i++) {
    const event = this.events[i]
    let done = false
    for (var j = 0; j < groups.length && !done; j++) {
      const group = groups[j]
      if (!group.some(e => e.isOverlappedWith(event))) {
        group.push(event)
        done = true
      }
    }
    if (!done) {
      groups.push([event])
    }
  }

  this.groups = groups

  // Inject `overlapCount` property to each event
  for (let i = 0; i < this.events.length; i++) {
    this.events[i].overlapCount = getOverlapCount(this.events[i])
  }
}

export default Model
