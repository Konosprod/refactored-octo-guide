import { ListsCollection } from './ListsCollection'

/**
 * checks if user is logged in
 * throws otherwise
 */
export function checkUserIsLoggedin() {
    if (!Meteor.userId) throw new Meteor.Error('Not authorized. (not connected)')
}

/**
 * checks if user with id `userId` is owner of list with id `listId`
 * throws if not
 * @param {*} userId
 * @param {*} listId 
 */
export function checkListIsAllowedOrThrow(userId, listId) {
    const list = ListsCollection.findOne(listId)
    if (userId != list.userId)
        throw new Meteor.Error('Not authorized. (not own list)')
}