import { Actions } from '../../Actions'
import './ListMenuItem.html'
import '../listEditModal/ListEditModal'

Template.listMenuItem.onCreated(function () {
    // Template.currentData holds data passed as Input in the template where this component is called
    this.input = Template.currentData()

    // component properties
    this.list$ = new ReactiveVar(this.input.list)
})

Template.listMenuItem.helpers({
    isSameAsSelected(list) {
        const selectedList = Session.get('selectedList')
        if (selectedList == undefined) return false
        return list.name == selectedList.name
    },
    total: () => Template.instance().list$.get().itemCount || 0,
})

Template.listMenuItem.events({
    'click .x-selectList'(e, instance) {
        Actions.trigger('selectList', this.list)
    },
    'click .x-editList'(e, instance) {
        e.stopPropagation()
        Actions.trigger('openModal', ['listEditModal', { list: this.list }])
    },
})
