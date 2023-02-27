import { Session } from 'meteor/session'
import { Actions } from '../Actions'
import { Store } from '../Store'
import './Thing.html'
import '../lazyImage/LazyImage.js'
import './thingTags/ThingTags.js'
import { S3Client } from '../utils'

Template.thing.onCreated(function () {
    this.autorun(() => {
        this.input = Template.currentData()
        this.thing = this.input.thing
        this.selectedList = Session.get('selectedList')
        this.fields = this.selectedList.fields
        this.showSelected = this.input.showSelected
        this.selected$ = new ReactiveVar(this.thing.selected)
    })

    /**
     * handler : on detail click, show thing in inspector
     */
    this.onDetailClick = () => {
        if (this.showSelected) {
            this.selected$.set(!this.selected$.get())
            let selectedThings = Store.get('selectedThings')
            const thing = selectedThings.filter((t) => this.thing._id == t._id)

            if (thing.length == 0) selectedThings.push(this.thing)
            else
                selectedThings = selectedThings.filter(
                    (thing) => thing._id != this.thing._id
                )

            Store.set('selectedThings', selectedThings)
        } else {
            Actions.trigger('openInspector', [
                'thingDetail',
                { thing: this.thing },
            ])
        }
    }
})

Template.thing.helpers({
    hasThumbnail: () => {
        const instance = Template.instance()
        const imageFields = instance.fields.map((f) => f.type == 'image')
        if (imageFields.length == 0) return false
        else {
            const imageField = instance.fields.filter(
                (f) => f.type == 'image'
            )[0]
            if (instance.thing.fields === undefined) return false
            if (instance.thing.fields[imageField.name]) return true
            else return false
        }
    },
    thumbnail: () => {
        const instance = Template.instance()
        const imageField = instance.fields.filter((f) => f.type == 'image')[0]
        if (imageField) return instance.thing.fields[imageField.name]
    },
    fields: () => Template.instance().fields,
    getThing: (field) => {
        if (Template.currentData().thing) {
            if (Template.currentData().thing.fields) {
                if (Template.currentData().thing.fields[field])
                    return Template.currentData().thing.fields[field]
                else return undefined
            } else return undefined
        } else return undefined
    },
    showSelected: () => Template.instance().showSelected,
    selected: () => Template.instance().selected$.get(),
})

Template.thing.events({
    'click .x-thingDetail': (e, instance) => instance.onDetailClick(),
    'click .x-deleteThing'(e, instance) {
        e.preventDefault()
        e.stopPropagation()

        const confirmMsg =
            'Are you sure you want to delete this thing? (no undo)'
        if (confirm(confirmMsg)) {
            const selectedList = Session.get('selectedList')
            const id = this.thing._id
            // remove thing from mongo immediatly
            Meteor.call('things.remove', id, () => {
                window.dispatchEvent(
                    new CustomEvent('thingRemoved', { detail: { _id: id } })
                )
            })
        }
    },
})
