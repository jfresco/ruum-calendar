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
  $container.style.gridTemplateColumns = `repeat(${model.columnsCount}, auto)`;
  // Clear container before insert new elements
  $container.innerHTML = '';
  $container.appendChild($eventsFragment);
};

function lcd (a, b) {
  if (b === 0) {
    return a
  }

  const mod = a % b;
  return mod === 0 ? b : lcd(b, mod)
}

function lcm (a, b) {
  return a * b / lcd(a, b)
}

function lcmMultiple (numbers) {
  if (numbers.length === 1) {
    return numbers.pop()
  }

  const [a, b] = numbers;
  return lcmMultiple([lcm(a, b), ...numbers.slice(2)])
}

var MathHelpers = {
  lcd,
  lcm,
  lcmMultiple
}

function ViewModel (model) {
  const STEP = 15; // minutes

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
  this.columnsCount = MathHelpers.lcmMultiple(model.events.map(e => e.overlapCount));

  // Decorate each event with its position and size in the grid
  this.events = model.events.map(event => {
    const cellSize = this.columnsCount / getGroup(event).length;
    const gridColumnStart = getGroupPosition(event) * cellSize + 1;
    const gridColumnEnd = gridColumnStart + cellSize;
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
  this.events.forEach(event => {
    let pushed = false;
    groups.forEach(group => {
      if (group.some(e => event.isOverlappedWith(e))) {
        group.push(event);
        pushed = true;
      }
    });

    if (!pushed) {
      groups.push([event]);
    }

    pushed = false;
  });

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
