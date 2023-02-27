import { Template } from 'meteor/templating'
import { ListsCollection } from '../api/ListsCollection'
import { Session } from 'meteor/session'
import './App.html'
import './login/Login.js'
import './list/ListContainer.js'
import './list/listMenuItem/ListMenuItem.js'
import './list/listEditModal/ListEditModal.js'
import './thing/thingForm/ThingForm.js'
import './modalContainer/ModalContainer.js'
import './inspector/Inspector.js'
import './list/listTags/ListTags.js'
import { Actions } from './Actions'

const getUser = () => Meteor.user()

console.log('listening login event')

function parseJwt(token) {
    var base64Url = token.split('.')[1]
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    var jsonPayload = decodeURIComponent(
        window
            .atob(base64)
            .split('')
            .map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            })
            .join('')
    )

    return JSON.parse(jsonPayload)
}

function googleSignIn(event) {
    console.log('got signin event from google identity service')
    var jwt = event.detail.credential
    var userData = parseJwt(jwt)
    var loginRequest = {
        // gId: profile.getId(), // should not send this to backend. Just here for reference
        gUsername: userData.name,
        gProfilePictureUrl: userData.picture,
        gEmail: userData.email,
        authResponse: {
            id_token: userData.jti,
            expires_at: userData.exp,
            gUserName: userData.name,
        },
    }
    console.log('authenticating with meteor backend...')
    Meteor.loginWithGoogle(loginRequest, (err) => {
        if (err)
            console.error('could not authenticate user to meteor backend', err)
    })
}

document.addEventListener('googleUserSignedIn', googleSignIn)

Template.applicationContainer.onCreated(function () {
    this.lists = () => ListsCollection.find({}).fetch()
    Meteor.subscribe('lists')
})
Template.applicationContainer.onRendered(() => {
    Session.set('isEditingList', false)
})

Template.applicationContainer.helpers({
    lists() {
        return Template.instance().lists()
    },
    user: () => Meteor.user(),
})

Template.applicationContainer.events({
    'click .x-logout'() {
        Actions.trigger('logout')
    },

    // refactor this should not live in App.js, but in the modal responsible for creating a list
    'click .overlay'() {
        Actions.trigger('stopEditList')
    },
    'click .modal-container'(e) {
        e.stopPropagation()
    },

    // refactor maybe those should not be living here either...
    'click .x-addNewList'() {
        Actions.trigger('addList')
    },

    'click .x-brand'() {
        Actions.trigger('deselectList')
    },
})
