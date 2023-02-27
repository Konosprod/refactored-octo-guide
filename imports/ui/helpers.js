import { Template } from 'meteor/templating'
import { getS3Url } from './utils'

const getUser = () => Meteor.user()

Template.registerHelper('settings', () => {
    return Meteor.settings
})

Template.registerHelper('selectedListCursor', () => {
    const list = Session.get('selectedList')
    if (list) return ListsCollection.find({ _id: list._id }).fetch()
    else return undefined
})
Template.registerHelper('selectedList', () => {
    return Session.get('selectedList')
})
Template.registerHelper('selectedThing', () => {
    return Session.get('selectedThing')
})

Template.registerHelper('isMenuClosed', () => {
    return !Session.get('isMenuOpen')
})
Template.registerHelper('isMenuOpen', () => {
    return Session.get('isMenuOpen')
})
Template.registerHelper('isModalOpen', () => {
    return Session.get('isModalOpen')
})
Template.registerHelper('currentModal', () => {
    return Session.get('currentModal')
})
Template.registerHelper('modalContext', () => {
    return Session.get('modalContext')
})

Template.registerHelper(
    'hasSelectedList',
    () => Session.get('selectedList') !== undefined
)

Template.registerHelper('eq', (thing1, thing2) => {
    return thing1 == thing2
})
Template.registerHelper('neq', (thing1, thing2) => {
    return thing1 != thing2
})
Template.registerHelper('greaterThan', (thing1, thing2) => {
    return thing1 > thing2
})
Template.registerHelper('S3Url', (id) => {
    return getS3Url(id)
})

Template.registerHelper('session', (key) => Session.get(key))
Template.registerHelper('user', () => getUser())
Template.registerHelper('isUserLogged', () => !!getUser())
