var layOutDay = (function () {
'use strict';

function View (_document) {
  this.dom = _document;
}

View.prototype.getEventElement = function (event) {
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

  return $event
};

View.prototype.render = function (model) {
  const $eventsFragment = this.dom.createDocumentFragment();
  model.events
    .map(event => this.getEventElement(event))
    .forEach($event => $eventsFragment.appendChild($event));

  // Commit to DOM
  const $container = this.dom.querySelector('.container');
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

  function getGroupNumber (event) {
    return model.groups.findIndex(g => g.some(e => e.isEqualTo(event)))
  }

  // Gets an array of Events that are overlapped direct or indirectly to `event`, including itself.
  function getCollisionChain (event) {
    const chain = [event];
    const otherGroups = model.groups.filter(group => group.every(e => !event.isEqualTo(e)));

    while (otherGroups.length > 0) {
      const group = otherGroups.shift();
      // Find in the group an event that overlaps with something of the chain. If there is match, it will be
      // added to the chain.
      const overlappedEvent = group.find(e => chain.some(ev => e.isOverlappedWith(ev)));
      if (overlappedEvent) {
        chain.push(overlappedEvent);
      }
    }

    return chain
  }

  // The amount of columns that will have the grid is the LCM of all possible collisions
  const possibleCollisions = model.events.map(e => getCollisionChain(e).length);
  const columnsCount = MathHelpers.lcmMultiple(possibleCollisions);

  // Decorate each event with its position and size in the grid
  this.events = model.events.map(event => {
    const group = getGroupNumber(event); // zero-based
    const collisionChainLength = getCollisionChain(event).length;

    const cellSize = columnsCount / collisionChainLength;
    const gridColumnStart = group * cellSize + 1;
    const gridColumnEnd = gridColumnStart + cellSize;
    const gridRowStart = timeToRow(event.start);
    const gridRowEnd = timeToRow(event.end);

    return {
      ...event,
      cellSize,
      gridColumnStart,
      gridColumnEnd,
      gridRowStart,
      gridRowEnd
    }
  });
}

// Compare function for Array#sort. Allows to sort by an object property
const by = (property) => {
  return function (a, b) {
    if (a[property] < b[property]) {
      return -1
    }
    if (a[property] > b[property]) {
      return 1
    }

    return 0
  }
};

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
  this.events = _events
    .map(e => new Event(e))
    .sort(by('start'));

  this.groups = this.events.reduce(putInGroups, []);
}

// Helper functions

const putInGroups = (groups, event) => {
  groups.some(hasSomeEventOverlappedWith(event)) || groups.push([event]);
  return groups
};

const hasSomeEventOverlappedWith = event => group => {
  if (!group.some(e => e.isOverlappedWith(event))) {
    group.push(event);
    return true
  }
};

function layOutDay (events) {
  const model = new Model(events);
  const vm = new ViewModel(model);
  const view = new View(document);
  view.render(vm);
}

return layOutDay;

}());
