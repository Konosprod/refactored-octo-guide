import { Meteor } from 'meteor/meteor'
import { ListsCollection } from './ListsCollection'

Meteor.publish('lists', function publishLists() {
    return ListsCollection.find({ userId: this.userId })
})
