function Event (_event, _overlapCount) {
  this.start = _event.start
  this.end = _event.end
  this.overlapCount = _overlapCount
}

Event.prototype.isOverlappedWith = function ({ start, end }) {
  return (this.start <= start && this.end > start) ||
    (this.start >= start && this.start < end) ||
    (this.start >= start && this.end <= end) ||
    (this.start <= start && this.end >= end) ||
    (this.start === start && this.end === end)
}

Event.prototype.isEqualTo = function ({ start, end }) {
  return this.start === start && this.end === end
}

export default Event
