import { Session } from 'meteor/session'
import { ListsCollection } from '../api/ListsCollection'

const actions = {
    addList: () => {
        const name = prompt('new list name')
        if (name) Meteor.call('lists.insert', name)
    },
    selectList: (list) => {
        Session.set('selectedList', ListsCollection.findOne({ _id: list._id }))
    },
    deselectList: () => {
        Session.set('selectedList', undefined)
        Session.set('selectedThing', {})
    },
    stopEditList: () => {
        Session.set('isEditingList', false)
    },
    startAddThing: () => {
        Session.set('selectedThing', {})
        Session.set('isAddingThing', true)
    },
    openModal: (modal, context) => {
        Session.set('isModalOpen', true)
        Session.set('currentModal', modal)
        Session.set('modalContext', context)
    },
    closeModal: () => {
        Session.set('isModalOpen', false)
        Session.set('currentModal', undefined)
        Session.set('modalContext', undefined)
    },
    openInspector: (templateName, context) => {
        Session.set('isInspectorOpen', true)
        Session.set('currentInspector', templateName)
        Session.set('inspectorContext', context)
    },
    closeInspector: () => {
        Session.set('isInspectorOpen', false)
        Session.set('currentInspector', undefined)
        Session.set('inspectorContext', undefined)
    },
    logout: () => {
        Meteor.logout()
    },
}

/**
 * triggers an action
 * @param {*} actionName
 * @param {*} args
 */
function trigger(actionName, args) {
    if (Array.isArray(args) == false) args = [args]
    try {
        if (actionName in actions) {
            console.log(`Triggering user action ${actionName} with args:`)
            console.log(args)
            actions[actionName](...args)
        } else {
            console.log(`Unknown action ${actionName} in app`)
        }
    } catch (error) {
        console.error(error)
    }
}

export const Actions = {
    trigger: trigger,
}
