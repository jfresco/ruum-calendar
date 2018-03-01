import { by } from './helpers'
import Event from './Event'

function Model (_events) {
  this.events = _events
    .map(e => new Event(e))
    .sort(by('start'))

  this.groups = this.events.reduce(putInGroups, [])
}

export default Model

// Helper functions

const putInGroups = (groups, event) => {
  groups.some(hasSomeEventOverlappedWith(event)) || groups.push([event])
  return groups
}

const hasSomeEventOverlappedWith = event => group => {
  if (!group.some(e => e.isOverlappedWith(event))) {
    group.push(event)
    return true
  }
}
