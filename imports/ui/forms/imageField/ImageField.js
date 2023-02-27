import './ImageField.html'
import { getS3Url } from '../../utils'
window.Buffer = window.Buffer || require('buffer').Buffer

const DEFAULT_FILE = {
    name: 'Upload Image',
    url: undefined,
}
const ALLOWED_TYPES = [
    'image/gif',
    'image/jpg',
    'image/jpeg',
    'image/png',
    'image/webp',
]

Template.imageField.onCreated(function () {
    const context = Template.currentData()
    /** a reactiveVar holding to the file uploaded in the form input */
    if (context.S3ObjectName != '' && context.S3ObjectName != undefined) {
        this.file$ = new ReactiveVar({
            ...DEFAULT_FILE,
            url: getS3Url(context.S3ObjectName),
        })
    } else {
        this.file$ = new ReactiveVar(DEFAULT_FILE)
    }

    /**
     * wether an image is being uploaded
     */
    this.isUploading$ = new ReactiveVar(false)

    this.base64data$ = new ReactiveVar(context.S3ObjectName || '')

    /**
     * takes a file from a file input, and set it as new file for this instance
     * it also updates UI reactively
     * @param {*} file
     */
    this.setFile = (file) => {
        this.file$.set({
            name: file.name,
            url: URL.createObjectURL(file),
        })

        var reader = new FileReader()
        reader.onloadend = () => {
            var base64data = reader.result
            this.base64data$.set(base64data)
        }
        reader.readAsDataURL(file)
    }
})

Template.imageField.helpers({
    uploadButtonText: () => Template.instance().file$.get().name,
    isUploading: () => Template.instance().isUploading$.get(),
    file: () => Template.instance().file$.get(),
    base64data: () => Template.instance().base64data$.get(),
})

Template.imageField.events({
    // intercept keyboard events and prevent them from propagating. This is to prevent enter key from submitting the form. Strangely, it triggers a click on the first button in the form otherwise
    'change .x-file-change'(e, instance) {
        const newFile = e.target.files[0]
        if (validateThumbnail(newFile)) {
            instance.isUploading$.set(true)
            Session.set('isUploading', true)
            resizeImage(newFile).then((newFile) => {
                instance.setFile(newFile)
                instance.isUploading$.set(false)
                Session.set('isUploading', false)
            })
        }
    },
})

/**
 * check the file that is passed to input in form
 * it must be an image, not too big
 * @param {*} file
 * @returns
 */
function validateThumbnail(file) {
    console.log('validateThumbnail')
    // its ok to have empty file
    if (!file) return true
    // file type is allowed
    if (ALLOWED_TYPES.includes(file.type) === false) {
        alert(
            'unsuported file type (' +
                file.type +
                '). must be one of the following \n' +
                ALLOWED_TYPES.join(', ') +
                '.'
        )
        return false
    }
    // file is not too big
    if (file.size > 5000000) {
        alert('file is too big. Must be less than 5mo')
        return false
    }
    return true
}

/**
 * takes a File object that is an image, and resizes it
 * returns a Promise that resolves to a Blob containing the resized image.
 * Image is resized witth smallest side as max size, and is cropped to a max_size x max_size square, placed center.
 * @param {*} file: File
 * @returns Promise<Blob>
 */
export const resizeImage = function (file) {
    return new Promise((resolve, reject) => {
        try {
            // read the file
            var reader = new FileReader()
            reader.onload = function (readerEvent) {
                // load the image to a Image instance
                var image = new Image()
                image.onload = function (imageEvent) {
                    // when image is loaded, Resize it using a canvas element
                    var canvas = document.createElement('canvas'),
                        max_size =
                            Meteor.settings.public.thumbnails.max_dimension,
                        width = image.width,
                        height = image.height

                    // resize smallest size to 480px
                    if (width < height) {
                        if (width > max_size) {
                            height = (height * max_size) / width
                            width = max_size
                        }
                    } else {
                        if (height > max_size) {
                            width = (width * max_size) / height
                            height = max_size
                        }
                    }

                    // security, since we are resizing based on smallest edge for looks (no stretch image please!)
                    // add failsafe. if one of the sides is really too big, throw an error
                    if (width > 1920 || height > 1920)
                        throw new Error(
                            'Image is too big (side is greater than 1920 after resizing)'
                        )

                    // draw image to canvas
                    canvas.width = max_size
                    canvas.height = max_size
                    const posXCentered = max_size / 2 - width / 2
                    const posYCentered = max_size / 2 - height / 2
                    canvas
                        .getContext('2d')
                        .drawImage(
                            image,
                            posXCentered,
                            posYCentered,
                            width,
                            height
                        )

                    // export canvas
                    var dataUrl = canvas.toDataURL('image/jpg')
                    var resizedImage = dataURLToBlob(dataUrl)
                    resolve(resizedImage)
                }
                image.src = readerEvent.target.result
            }
            reader.readAsDataURL(file)
        } catch (e) {
            reject(e)
        }
    })
}

/* Utility function to convert a canvas to a BLOB */
const dataURLToBlob = function (dataURL) {
    var BASE64_MARKER = ';base64,'
    if (dataURL.indexOf(BASE64_MARKER) == -1) {
        var parts = dataURL.split(',')
        // var contentType = parts[0].split(':')[1]
        var contentType = 'image/jpg'
        var raw = parts[1]

        return new Blob([raw], { type: contentType })
    }

    var parts = dataURL.split(BASE64_MARKER)
    // var contentType = parts[0].split(':')[1]
    var contentType = 'image/jpg'
    var raw = window.atob(parts[1])
    var rawLength = raw.length

    var uInt8Array = new Uint8Array(rawLength)

    for (var i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i)
    }

    return new Blob([uInt8Array], { type: contentType })
}
