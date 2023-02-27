import { check } from 'meteor/check'
import { ThingsCollection } from './ThingsCollection'
import { ListsCollection } from './ListsCollection'
import { checkUserIsLoggedin, checkListIsAllowedOrThrow } from '../api/utils'
import { uploadB64ToS3, removeFromS3 } from './s3Client'

async function updateListTags(listId, tags) {
    ListsCollection.update(listId, {
        $set: {
            tags: await ThingsCollection.rawCollection().distinct('tags', {
                list_id: listId,
            }),
        },
    })
}

function updateListItemCount(listId) {
    const listItemCount = ThingsCollection.find({ list_id: listId }).count()
    const list = ListsCollection.find(listId)
    console.log('updateListitemCount')
    ListsCollection.update(listId, {
        $set: {
            itemCount: listItemCount,
        },
    })
}

Meteor.methods({
    /**
     * @param {*} thing:
     * @param {*} listId: string
     */
    async 'things.insert'(thing, listId) {
        check(thing.name, String)
        check(listId, String)

        checkUserIsLoggedin()
        checkListIsAllowedOrThrow(this.userId, listId)
        const list = ListsCollection.findOne(listId)

        for (let imageField of list.fields.filter((f) => f.type == 'image')) {
            const b64 = thing.fields[imageField.name]
            const S3ref = await uploadB64ToS3(b64)
            thing.fields[imageField.name] = S3ref
        }

        var result = ThingsCollection.insert(
            {
                ...thing,
                list_id: listId,
                createdAt: new Date(),
                userId: this.userId,
            },
            () => {
                updateListTags(listId, thing.tags)
            }
        )

        updateListItemCount(listId)

        return result
    },
    async 'things.update'(id, newThing) {
        check(id, String)
        check(newThing.name, String)

        checkUserIsLoggedin()
        checkListIsAllowedOrThrow(this.userId, newThing.list_id)

        // check every field that is an image, and upload base64 string as file to S3
        const list = ListsCollection.findOne(newThing.list_id)
        const oldThing = ThingsCollection.findOne(newThing._id)

        for (let imageField of list.fields.filter((f) => f.type == 'image')) {
            // did we change image ? if yes, remove old image and upload new one
            if (
                newThing.fields[imageField.name] !=
                oldThing.fields[imageField.name]
            ) {
                const b64 = newThing.fields[imageField.name]
                await removeFromS3(oldThing.fields[imageField.name])
                const S3ref = await uploadB64ToS3(b64)
                newThing.fields[imageField.name] = S3ref
            }
        }

        // do this only once all s3 uploads are done
        ThingsCollection.update(
            id,
            {
                $set: {
                    ...newThing,
                    list_id: newThing.list_id,
                },
            },
            () => {
                updateListTags(newThing.list_id, newThing.tags)
            }
        )
    },
    async 'things.remove'(id) {
        check(id, String)

        checkUserIsLoggedin()

        // make sure user modifies his own list only
        const thing = ThingsCollection.findOne(id)
        const list = ListsCollection.findOne(thing.list_id)
        checkListIsAllowedOrThrow(this.userId, thing.list_id)

        // remove associated thumbnails if any
        for (let imageField of list.fields.filter((f) => f.type == 'image')) {
            await removeFromS3(thing.fields[imageField.name])
        }

        ThingsCollection.remove(id)
        updateListItemCount(thing.list_id)
    },
    'things.aggregateTags'(listId, filter) {
        checkUserIsLoggedin()
        checkListIsAllowedOrThrow(this.userId, listId)

        const res = ThingsCollection.rawCollection()
            .aggregate([
                {
                    $facet: {
                        aggregateTags: [
                            { $match: filter },
                            { $unwind: '$tags' },
                            { $sortByCount: '$tags' },
                        ],
                    },
                },
            ])
            .toArray()

        return res
    },
    'things.updateTag'(listId, oldTag, newTag) {
        check(oldTag, String)
        check(newTag, String)

        checkUserIsLoggedin()
        checkListIsAllowedOrThrow(this.userId, listId)
        ThingsCollection.find({
            userId: this.userId,
            list_id: listId,
            tags: oldTag,
        }).forEach((thing) => {
            let newTags = []

            newTags = thing.tags.filter((t) => t != oldTag) // remove old tag
            newTags.push(newTag) // add new tag

            newTags.sort()

            thing.tags = newTags
            ThingsCollection.update(thing._id, thing)
        })
    },
    'things.removeTag'(listId, tag) {
        check(tag, String)

        checkUserIsLoggedin()
        checkListIsAllowedOrThrow(this.userId, listId)

        ThingsCollection.update(
            {
                userId: this.userId,
                list_id: listId,
            },
            {
                $pull: { tags: tag },
            },
            { multi: true }
        )
    },
})
