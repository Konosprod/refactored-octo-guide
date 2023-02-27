import './ListTag.html'
import { ListsCollection } from '../../../api/ListsCollection'
import { ThingsCollection } from '../../../api/ThingsCollection'

Template.listTag.onCreated(function () {
    this.autorun(() => {
        this.input = Template.currentData()
        this.editable = this.input.editable
        this.isSaving$ = new ReactiveVar(false)
        this.tag = new ReactiveVar(this.input.tag)
        this.count = this.input.count
        this.onClick = (tag) => {
            this.input.onClick(tag)
        }

        this.saveTag = (listId, oldTag, newTag) => {
            this.isSaving$.set(true)

            var counter = 0
            // make sure event is fires once both meteor call backs are done
            var executeThisOnSecondTime = () => {
                if (counter == 1)
                    window.dispatchEvent(new CustomEvent('tagsChanged'))
                else counter++
            }

            Meteor.call(
                'lists.updateTag',
                listId,
                oldTag,
                newTag,
                executeThisOnSecondTime
            )
            Meteor.call(
                'things.updateTag',
                listId,
                oldTag,
                newTag,
                executeThisOnSecondTime
            )
            this.isSaving$.set(false)
        }
    })
})

Template.listTag.helpers({
    editable: () => Template.instance().editable,
    isSaving: () => Template.instance().isSaving$.get(),
    tag: () => Template.instance().tag.get(),
    count: () => Template.instance().count,
})

Template.listTag.events({
    'click .x-list-tag-edit'(e, instance) {
        if (instance.editable == false) {
            instance.onClick(instance.tag.get())
        }
    },
    'keyup .x-list-tag-edit-input'(e, instance) {
        e.preventDefault()
        e.stopPropagation()
        if (e.originalEvent.key == 'Enter') {
            const listId = Session.get('selectedList')._id
            const oldTag = instance.tag.get()
            const newTag = e.target.value
            instance.saveTag(listId, oldTag, newTag)
        }
    },
    'click .x-save-tag'(e, instance) {
        const listId = Session.get('selectedList')._id
        const oldTag = instance.tag.get()
        const newTag = e.target.parentElement.querySelector(
            '.x-list-tag-edit-input'
        ).value
        instance.saveTag(listId, oldTag, newTag)
    },
    'click .x-remove-tag'(e, instance) {
        if (
            confirm(
                `Are you sure you want to delete tag ${instance.tag.get()}? It will remove it from every thing in this list. (No undo)`
            )
        ) {
            const listId = Session.get('selectedList')._id
            Meteor.call('lists.removeTag', listId, instance.tag.get())
            Meteor.call('things.removeTag', listId, instance.tag.get())
        }
    },
})
