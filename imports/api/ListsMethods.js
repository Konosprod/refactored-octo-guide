import { check } from 'meteor/check'
import { ListsCollection } from './ListsCollection'
import { checkUserIsLoggedin, checkListIsAllowedOrThrow } from '../api/utils'
import { ThingsCollection } from './ThingsCollection'

Meteor.methods({
    'lists.insert'(name) {
        check(name, String)

        // make sure user is logged in
        if (!this.userId) throw new Meteor.Error('Not authorized.')

        ListsCollection.insert({
            name,
            fields: [{
                "name": "Thumbnail",
                "type": "image"
            }],
            createdAt: new Date(),
            userId: this.userId,
        })
    },

    'lists.remove'(id) {
        check(id, String)

        // make sure user is logged in
        if (!this.userId) throw new Meteor.Error('Not authorized.')

        // make sure user modifies his own list only
        const list = ListsCollection.findOne(id)
        if (this.userId != list.userId) throw new Meteor.Error('Not authorized')

        ListsCollection.remove(id)
    },

    'lists.update'(listId, listData) {
        check(listId, String)
        check(listData.name, String)

        // make sure user is logged in
        if (!this.userId) throw new Meteor.Error('Not authorized.')

        // make sure user modifies his own list only
        const list = ListsCollection.findOne(listId)
        if (this.userId != list.userId) throw new Meteor.Error('Not authorized')

        // now update things key names for this list
        const previousFields = [...list.fields]
        const nextFields = [...listData.fields]
        const previousFieldsNames = [...list.fields].map(f => f.name)
        const nextFieldsNames = [...listData.fields].map(f => f.name)

        // new field are fields that were not in previous fields
        let addedFields = nextFields.filter(nextField => previousFieldsNames.includes(nextField.name) == false && nextField.previousName == '')

        // renamed fields are fields whose previous and current name are different
        let renamedFields = nextFields.filter(nextField => nextField.name != nextField.previousName && nextField.previousName != '')
        const renamedFIeldsPreviousNames = renamedFields.map(f => f.previousName)

        // removed fields are fields that are in previous fields, but not in new fields
        let removedFields = previousFields.filter(previousField => nextFieldsNames.includes(previousField.name) == false && renamedFIeldsPreviousNames.includes(previousField.name) == false)

        let $set = {} // { "new_field": "" },
        let $rename = {} // { <field1>: <newName1>, <field2>: <newName2>, ... }
        let $unset = {} // { fieldName: "" }

        addedFields.forEach(field => {
            $set[`fields.${field.name}`] = ""
        })
        renamedFields.forEach(field => {
            $rename[`fields.${field.previousName}`] = `fields.${field.name}`
        })
        removedFields.forEach(field => {
            $unset[`fields.${field.name}`] = ""
        })

        // update fields in list
        ThingsCollection.update(
            { "list_id": list._id },
            { $set, $rename, $unset }
        )

        // update the list
        ListsCollection.update(listId, {
            $set: {
                name: listData.name,
                fields: listData.fields
            },
        })
    },
    'lists.updateTag'(listId, oldTag, newTag) {
        check(oldTag, String)
        check(newTag, String)

        checkUserIsLoggedin()
        checkListIsAllowedOrThrow(this.userId, listId)

        ListsCollection.find({
            _id: listId,
            tags: oldTag
        }).forEach(list => {
            let newTags = []

            newTags = list.tags.filter(t => t != oldTag) // remove old tag
            newTags.push(newTag) // add new tag

            newTags.sort()

            list.tags = newTags
            ListsCollection.update(list._id, list)
        })
    },
    'lists.removeTag'(listId, tag) {
        check(tag, String)

        checkUserIsLoggedin()
        checkListIsAllowedOrThrow(this.userId, listId)

        ListsCollection.update({
            _id: listId,
        }, {
            $pull: { 'tags': tag }
        }, { multi: true })
    }
})
