import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'
import { ThingsCollection } from '../imports/api/ThingsCollection'
import { ListsCollection } from '../imports/api/ListsCollection'
import '../imports/api/ListsMethods'
import '../imports/api/ListsPublications'
import '../imports/api/ThingsMethods'
import '../imports/api/ThingsPublications'
import { seeding } from '../seeding'

const insertList = (listName) => ListsCollection.insert({ name: listName })

Meteor.startup(() => {
    if (
        Meteor.settings.AWSAccessKeyId == '<YOUR-ACCESS-KEY>' ||
        Meteor.settings.AWSSecretAccessKey == '<YOUR-SECRET>'
    ) {
        console.warn(
            'aws s3 is not configured. s3 operations WILL NOT WORK. please read README to fix this.'
        )
    }

    const IS_TESTING = Meteor.settings.public.IS_TESTING
    if (IS_TESTING) {
        console.log(
            'App is in testing mode : local collection will be dropped and seeded.'
        )

        console.log('seeding test user')
        const USER = Meteor.settings.public.TEST_USER

        let user = Accounts.findUserByUsername(USER.username)
        if (!user) {
            const user_id = Accounts.createUser(USER)
            console.log('created user with id', user_id)
            user = Accounts.findUserByUsername(USER.username)
        }

        console.log('found meteor user', user._id)
        console.log(user)

        console.log('dropping local list and things')
        ThingsCollection.remove({})
        ListsCollection.remove({})

        console.log('seeding local lists and things from json')
        const listData = seeding.lists.map((l) => ({
            ...l,
            userId: user._id,
        }))
        const thingsData = seeding.things.map((t) => ({
            ...t,
            userId: user._id,
        }))

        ListsCollection.rawCollection().insertMany(listData)
        ThingsCollection.rawCollection().insertMany(thingsData)

        console.log('DONE!')
    }

    ServiceConfiguration.configurations.upsert(
        { service: 'google' },
        {
            $set: {
                loginStyle: 'popup',
                clientId: Meteor.settings.public.GAPI_CLIENT_ID,
                secret: Meteor.settings.GAPI_SECRET,
                apiKey: Meteor.settings.GAPI_KEY,
            },
        }
    )
})

Accounts.registerLoginHandler(function (loginRequest) {
    // console.log('authenticating user from request', loginRequest)
    // There are multiple login handlers in meteor.
    // A login request go through all these handlers to find it's login handler
    // so in our login handler, we only consider login requests which has googleIdToken field
    // Our authentication logic

    const id_token = loginRequest.authResponse.id_token
    const expires_at = loginRequest.authResponse.expires_at
    const now = Date.now() / 1000

    if (now > expires_at) {
        console.log(
            `token with expires_at ${expires_at} has expired. Now is ${now}`
        )
        return undefined
    }
    // console.log('token has not expired')

    // We create a user if none exists
    var result = Meteor.users.upsert(
        {
            'services.google.email': loginRequest.gEmail,
        },
        {
            services: {
                google: {
                    email: loginRequest.gEmail,
                },
            },
            profile: {
                name: loginRequest.authResponse.gUserName,
                idToken: loginRequest.authResponse.id_token,
                scope: [],
                expiresAt: loginRequest.authResponse.expires_at,
                email: loginRequest.gEmail,
                verified_email: true,
                name: loginRequest.authResponse.gUserName,
                picture: loginRequest.gProfilePictureUrl,
            },
        }
    )
    var user = Meteor.users.findOne({
        'services.google.email': loginRequest.gEmail,
    })
    // console.log('succesfully logged in !', user._id)

    // Send logged in user's user id 🎉
    return {
        userId: user._id,
    }
})
