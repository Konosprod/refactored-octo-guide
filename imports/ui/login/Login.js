import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import './Login.html'

Template.login.onRendered(() => {
    if(Meteor.settings.public.IS_TESTING){
        const USER = Meteor.settings.public.TEST_USER
        Meteor.loginWithPassword(USER.username, USER.password)
    }
})

Template.login.events({
    'submit .login-form'(e) {
        // this is dead code for default meteor login form
        e.preventDefault()

        const target = e.target

        const username = target.username.value
        const password = target.password.value

        Meteor.loginWithPassword(username, password)
        handleClientLoad()
    },
})
