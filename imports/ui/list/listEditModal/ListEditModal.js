import { Template } from 'meteor/templating'
import { Actions } from '../../Actions'
import './ListEditModal.html'
import '../../modalContainer/ModalContainer'
import '../listFieldInput/ListFieldInput.js'
import { ReactiveVar } from 'meteor/reactive-var'


var list = new ReactiveVar({
    name: '',
    fields: []
})

Template.listEditModal.onCreated(function () {
    this.input = Template.currentData()

    this.previousList = { ...this.input.list }
    this.list = this.input.list
    this.validateModal = this.input.validateModal
    this.closeModal = this.input.closeModal

    this.fields$ = new ReactiveVar(this.list.fields)

    this.onDeleteList = (e) => {
        e.preventDefault()
        e.stopPropagation()
        const confirmationMsg = 'Are you sure you want to delete this list?'
        if (confirm(confirmationMsg)) {
            Session.set('selectedList', undefined)
            Meteor.call('lists.remove', this.list._id)
            this.closeModal()
        }
    }

    this.onSaveList = (e) => {
        e.preventDefault()
        e.stopPropagation()

        const newList = { ...this.list }
        const form = e.target.form
        this.errors = {}

        if (form.name.value != '' && form.name.value !== undefined)
            newList.name = form.name.value
        else this.errors['name'] = 'List name cannot be empty'

        if (Object.keys(this.errors).length > 0) return

        console.log(newList)
        Meteor.call('lists.update', this.list._id, newList)

        this.validateModal()
    }

    this.onAddField = (e) => {
        e.preventDefault()
        e.stopPropagation()

        this.list.fields.push({
            name: '',
            type: 'shortText'
        })
        this.fields$.set(this.list.fields)
    }

    this.onDeleteField = (field) => {
        // remove field in viewModel
        this.list.fields = this.list.fields.filter(f => f.name != field.name)

        // remove field in binding
        this.fields$.set(this.list.fields)
    }
});

Template.listEditModal.helpers({
    list: () => Template.instance().list,
    fields: () => Template.instance().fields$.get(),
    onDeleteField: () => Template.instance().onDeleteField
})

Template.listEditModal.events({
    'click .x-deleteList': (e, instance) => instance.onDeleteList(e),
    'click .x-saveList': (e, instance) => instance.onSaveList(e),
    'click .x-add-field': (e, instance) => instance.onAddField(e)
})