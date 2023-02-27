import '../imports/ui/helpers.js'
import '../imports/ui/App.js'
import { Accounts } from 'meteor/accounts-base'

Meteor.loginWithGoogle = function (loginRequest, callback) {
    // Send the login request 📤
    Accounts.callLoginMethod({
        methodArguments: [loginRequest],
        userCallback: callback,
    })
}
