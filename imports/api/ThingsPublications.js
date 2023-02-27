import { Meteor } from 'meteor/meteor'
import { ThingsCollection } from './ThingsCollection'

Meteor.publish('things', function publishLists(listId) {
    return ThingsCollection.find({ userId: this.userId, list_id: listId })
})
