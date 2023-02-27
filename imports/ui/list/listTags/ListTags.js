import './ListTags.html'
import '../listTag/ListTag.js'
import { ListsCollection } from '../../../api/ListsCollection'

Template.listTags.onCreated(function () {
    this.autorun(() => {
        this.input = Template.currentData()

        this.list = Session.get('selectedList')
        this.onChange = this.input.onChange
        this.tags = this.input.tags

        this.isManagingTags$ = new ReactiveVar(false)

        this.toggleManageTags = () => {
            const isManaging = this.isManagingTags$.get()
            this.isManagingTags$.set(!isManaging)
        }
    })
})

Template.listTags.helpers({
    isManagingTags: () => Template.instance().isManagingTags$.get(),
    tags() {
        return Template.instance().tags
    },
    onChange() {
        return Template.instance().onChange
    },
})

Template.listTags.events({
    'click .x-toggle-manage-tags'() {
        Template.instance().toggleManageTags()
    }
})
