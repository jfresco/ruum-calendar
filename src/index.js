import View from './View'
import ViewModel from './ViewModel'
import Model from './Model'

function layOutDay (events) {
  const model = new Model(events)
  const vm = new ViewModel(model)
  const view = new View(document)
  view.render(vm)
}

export default layOutDay
