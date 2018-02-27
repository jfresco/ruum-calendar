function lcd (a, b) {
  if (b === 0) {
    return a
  }

  const mod = a % b
  return mod === 0 ? b : lcd(b, mod)
}

function lcm (a, b) {
  return a * b / lcd(a, b)
}

function lcmMultiple (numbers) {
  if (numbers.length === 1) {
    return numbers.pop()
  }

  const [a, b] = numbers
  return lcmMultiple([lcm(a, b), ...numbers.slice(2)])
}

export default {
  lcd,
  lcm,
  lcmMultiple
}
