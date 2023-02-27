import AWS from 'aws-sdk'

AWS.config.update({
    accessKeyId: Meteor.settings.AWSAccessKeyId,
    secretAccessKey: Meteor.settings.AWSSecretAccessKey,
    region: Meteor.settings.public.s3.region,
})

export function makeid(length) {
    var result = ''
    var characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    var charactersLength = characters.length
    for (var i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        )
    }
    return result
}

export async function uploadB64ToS3(b64, key = '') {
    var buf = Buffer.from(b64.replace(/^data:image\/\w+;base64,/, ''), 'base64')

    // if image already exists, replace existing image using same key
    key = key == '' ? makeid(250) : key
    if (
        Meteor.settings.public.s3.dirname != '' &&
        Meteor.settings.public.s3.dirname != undefined
    )
        key = Meteor.settings.public.s3.dirname + key + '.jpg'
    var data = {
        Key: key,
        Body: buf,
        ContentEncoding: 'base64',
        ContentType: 'image/jpeg',
        Bucket: Meteor.settings.public.s3.bucketName,
    }
    const s3 = new AWS.S3()
    let result = await s3.upload(data).promise()

    // result is the s3 object name with folder name and extension
    // but thingsCollection expects raw s3 identifier. s3 url is computed on front end based on env variables
    // strip folder name
    result = result.key.split('/')
    if (result.length > 1) result = result[result.length - 1]
    else result = result[0]
    // strip extension
    result = result.split('.')
    if (result.length > 1) result = result[0]
    else result = result[0]

    // return raw s3 object key
    return result
}

export async function removeFromS3(key = '') {
    if (key == '') return

    // if image already exists, replace existing image using same key
    var data = {
        Key: Meteor.settings.public.s3.dirname + key + '.jpg',
        Bucket: Meteor.settings.public.s3.bucketName,
    }
    const s3 = new AWS.S3()
    const result = await s3.deleteObject(data).promise()
    return result
}
