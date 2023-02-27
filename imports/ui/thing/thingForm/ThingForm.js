import { ReactiveVar } from 'meteor/reactive-var'
import './ThingForm.html'
import '../../forms/tagsInput/TagsInput'
import { ThingsCollection } from '../../../api/ThingsCollection'
import { ListsCollection } from '../../../api/ListsCollection.js'
import '../../forms/imageField/ImageField.js'
import { S3Client } from '../../utils'

const errors = new ReactiveVar([])
let SELECTED_LIST = Session.get('selectedList')

const init = () => {
    SELECTED_LIST = Session.get('selectedList')
    const context = Template.currentData()
    if (context.thing) ISINSERT = false
    else ISINSERT = true
}

/**
 * model-related methods and attrs
 */
Template.thingForm.onCreated(function () {
    // legacy code
    init()

    this.input = Template.currentData()
    this.isInsert = this.input.thing ? false : true
    this.isSaving$ = new ReactiveVar(false)

    /**
     * saves a thing to DB
     * also handles the logic behind the upload of images if any
     */
    this.saveThing = async (data) => {
        this.isSaving$.set(true)
        let thing = {
            ...this.input.thing,
            ...data,
        }
        return new Promise((res, rej) => {
            if (this.isInsert) {
                Meteor.call(
                    'things.insert',
                    thing,
                    SELECTED_LIST._id,
                    (err, id) => {
                        if (err) rej(err)
                        else res(id)
                    }
                )
            } else {
                Meteor.call(
                    'things.update',
                    this.input.thing._id,
                    thing,
                    (err, id) => {
                        this.isSaving$.set(false)
                        if (err) rej(err)
                        else res(this.input.thing._id)
                    }
                )
            }
        })
    }
})

/**
 * view-related methods and attrs
 */
Template.thingForm.onRendered(function () {
    this.validateModal = this.input.validateModal
    /**
     * returns an html form instance from a Jquery click event on a submit button
     * @param {*} e
     * @returns
     */
    this.getFormFromEvent = (e) => e.target.form

    /**
     * validates a html form instance against some arbitrary logic
     * here, only field name is required
     * throw error otherwise
     * @param {*} form
     */
    this.validateForm = (form) => {
        if (
            form.name == undefined ||
            form.name.value == '' ||
            form.name.value === undefined
        ) {
            alert('field name is required in form!')
            return undefined
        }
        return form
    }

    /**
     * takes an html form and return it in its POJO form
     * it uses selectedList fields to find form fields.
     * That means it will ignore extra fields, and throw an error on missing fields (fields can be empty!)
     * @param {*} form
     * @returns
     */
    this.formToData = (form) => {
        const fields = SELECTED_LIST.fields
        const data = {}
        data['name'] = form.name.value

        // prepare tags : convert array of nodes, to array of string
        data['tags'] = []
        // if only one tag
        if (form.tags) {
            if (form.tags.length === undefined)
                data['tags'].push(form.tags.value)
            // if several tags
            else {
                for (var i = 0; i < form.tags.length; i++) {
                    data['tags'].push(form.tags[i].value)
                }
            }
        }

        if (this.isInsert) data['fields'] = {}
        else data['fields'] = { ...this.input.thing.fields }

        // for each field, add it to data
        console.log('saving')
        fields.map((f) => {
            try {
                data.fields[f.name] = form[f.name].value
            } catch (e) {}
        })

        return data
    }
})

/**
 * hooks for the view to access for data display
 */
Template.thingForm.helpers({
    getThing: (field) => {
        if (Template.currentData().thing) {
            if (Template.currentData().thing.fields) {
                if (Template.currentData().thing.fields[field])
                    return Template.currentData().thing.fields[field]
                else undefined
            } else return undefined
        } else return undefined
    },
    fields: () =>
        ListsCollection.findOne(Session.get('selectedList')._id).fields,
    errors: () => errors.get(),
    isInsert: () => Template.instance().isInsert,
    isSaving: () => Template.instance().isSaving$.get(),
})

Template.thingForm.events({
    'click .x-close'(e, instance) {
        e.preventDefault()
        e.stopPropagation()

        this.closeModal()
    },
    'click .x-saveThing'(e, instance) {
        e.preventDefault()
        e.stopPropagation()
        console.log('save!')
        const form = instance.getFormFromEvent(e)
        const validatedForm = instance.validateForm(form)
        if (validatedForm === undefined) return
        const data = instance.formToData(validatedForm)
        instance
            .saveThing(data)
            .then((id) => {
                console.log('after save!', ThingsCollection.findOne(id))
                form.reset()
                instance.validateModal()
                const thing = ThingsCollection.findOne(id)
                Session.set('inspectorContext', { thing })
                if (instance.isInsert)
                    window.dispatchEvent(
                        new CustomEvent('thingInserted', { detail: thing })
                    )
                else
                    window.dispatchEvent(
                        new CustomEvent('thingUpdated', { detail: thing })
                    )
                window.dispatchEvent(new CustomEvent('thingsChanged'))
                return data
            })
            .then((data) => {
                console.log('saving thumbnail')
            })
    },
})
