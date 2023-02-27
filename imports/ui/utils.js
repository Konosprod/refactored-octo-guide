export const getS3Url = function (id) {
    if (id === '' || id === undefined) return '#'
    else if (typeof id !== 'string') throw new Error('id must be string')
    else
        return `https://s3.${Meteor.settings.public.s3.region}.amazonaws.com/${Meteor.settings.public.s3.bucketName}/${Meteor.settings.public.s3.dirname}${id}.jpg`
}

export const allowedFieldTypes = [
    {
        name: 'Short Text',
        value: 'shortText',
    },
    {
        name: 'Long Text',
        value: 'longText',
    },
    {
        name: 'Image',
        value: 'image',
    },
    {
        name: 'Url',
        value: 'url',
    },
]
