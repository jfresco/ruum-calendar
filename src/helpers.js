// Compare function for Array#sort. Allows to sort by an object property
export const by = (property) => {
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
