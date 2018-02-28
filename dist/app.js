var layOutDay = (function () {
'use strict';

function View (_document) {
  this.dom = _document;
}

View.prototype.render = function (model) {
  const $eventsFragment = this.dom.createDocumentFragment();
  model.events.forEach(event => {
    // Create div
    const $event = this.dom.createElement('div');
    $event.classList.add('event');

    // Set event position with inline styles
    $event.style.gridRowStart = event.gridRowStart;
    $event.style.gridRowEnd = event.gridRowEnd;
    $event.style.gridColumnStart = event.gridColumnStart;
    $event.style.gridColumnEnd = event.gridColumnEnd;

    // Create and append inner element
    const $eventInner = this.dom.createElement('span');
    $eventInner.innerHTML = `<div class="title">Sample Item</div><div class="subtitle">Sample description</div>`;
    $event.appendChild($eventInner);

    // Add div to fragment
    $eventsFragment.appendChild($event);
  });

  // Commit to DOM
  const $container = this.dom.querySelector('.container');
  // Clear container before insert new elements
  $container.innerHTML = '';
  $container.appendChild($eventsFragment);
};

function ViewModel (model) {
  const STEP = 15; // minutes

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
  });
}

function Event (_event, _overlapCount) {
  this.start = _event.start;
  this.end = _event.end;
  this.overlapCount = _overlapCount;
}

Event.prototype.isOverlappedWith = function ({ start, end }) {
  return (this.start <= start && this.end > start) ||
    (this.start >= start && this.start < end) ||
    (this.start >= start && this.end <= end) ||
    (this.start <= start && this.end >= end) ||
    (this.start === start && this.end === end)
};

Event.prototype.isEqualTo = function ({ start, end }) {
  return this.start === start && this.end === end
};

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
    let count = 0;
    groups
      .filter(g => g.some(e => e.isEqualTo(event)))
      .forEach(g => {
        if (g.length > count) {
          count = g.length;
        }
      });
    return count
  }

  this.events = _events.map(e => new Event(e)).sort(by('start'));

  const groups = [];
  for (var i = 0; i < this.events.length; i++) {
    const event = this.events[i];
    let done = false;
    for (var j = 0; j < groups.length && !done; j++) {
      const group = groups[j];
      if (!group.some(e => e.isOverlappedWith(event))) {
        group.push(event);
        done = true;
      }
    }
    if (!done) {
      groups.push([event]);
    }
  }

  this.groups = groups;

  // Inject `overlapCount` property to each event
  for (let i = 0; i < this.events.length; i++) {
    this.events[i].overlapCount = getOverlapCount(this.events[i]);
  }
}

function layOutDay (events) {
  const model = new Model(events);
  const vm = new ViewModel(model);
  const view = new View(document);
  view.render(vm);
}

return layOutDay;

}());
