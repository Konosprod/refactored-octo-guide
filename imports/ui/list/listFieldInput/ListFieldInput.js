import "./ListFieldInput.html"
import { ReactiveVar } from 'meteor/reactive-var'
import { allowedFieldTypes } from '../../utils'

var mode = new ReactiveVar('show')

Template.listFieldInput.onCreated(function () {
    this.input = Template.currentData()

    this.field = this.input.field
    this.previousField = { ...this.field }
    this.field['previousName'] = this.previousField.name
    this.field['previousType'] = this.previousField.type
    this.onDeleteField = this.input.onDeleteField
    this.mode$ = new ReactiveVar('show')

    this.selectedFieldType$ = new ReactiveVar(allowedFieldTypes.filter(f => f.value == this.field.type)[0])
    this.currentFieldName$ = new ReactiveVar(this.field.name)

    this.startEdit = (e) => {
        e.preventDefault()
        e.stopPropagation()
        this.mode$.set('edit')
    }

    this.stopEdit = (e) => {
        e.preventDefault()
        e.stopPropagation()
        this.mode$.set('show')
    }

    this.onTypeSelectChange = (field) => {
        this.selectedFieldType$.set(field)
        this.field.type = field.value
    }

    this.onFieldNameChange = (e) => {
        this.currentFieldName$.set(e.target.value)
        this.field.name = e.target.value
    }

    this.deleteField = (e) => {
        this.onDeleteField(this.field)
    }
})

Template.listFieldInput.helpers({
    mode: () => Template.instance().mode$.get(),
    fieldTypes: () => allowedFieldTypes,
    selectedFieldType: () => Template.instance().selectedFieldType$.get(),
    currentFieldName: () => Template.instance().currentFieldName$.get(),
    onTypeSelectChange: () => Template.instance().onTypeSelectChange
})
Template.listFieldInput.events({
    'click .x-edit-field': (e, instance) => instance.startEdit(e),
    'click .x-close-edit-field': (e, instance) => instance.stopEdit(e),
    'keyup .x-field-name': (e, instance) => instance.onFieldNameChange(e),
    'click .x-delete-field': (e, instance) => instance.deleteField(e),
})