const prepareDriveXHR = function (method, url, accessToken) {
    const xhr = new XMLHttpRequest()
    xhr.open(method, url)
    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken)
    xhr.responseType = 'json'
    return xhr
}

const driveXHR = {
    async put(url, payload) {
        return new Promise((res, rej) => {
            req = prepareDriveXHR('put', url)
            req.onload = () => {
                res(req.response)
            }
            req.send(payload)
        })
    },
    async post(url, payload) {
        return new Promise((res, rej) => {
            req = prepareDriveXHR('post', url)
            req.onload = () => {
                res(req.response)
            }
            req.send(payload)
        })
    },
    async get(accessToken, url) {
        return new Promise((res, rej) => {
            req = prepareDriveXHR('get', url, accessToken)
            req.onload = () => {
                res(req.response)
            }
            req.send()
        })
    },
}

export const GDrive = {
    async deleteThumbnail(id) {
        return new Promise((res, rej) => {
            var request = gapi.client.drive.files.delete({
                fileId: id,
            })
            request.execute(function (resp) {
                res(resp)
            })
        })
    },
    async uploadThumbnail(name, blob) {
        console.log('uploadThumbnail')
        return new Promise((res, rej) => {
            // convert blob of resized image to File of right type
            file = new File([blob], name + '.jpg')
            // prepare metadata for form upload to Gdrive
            var metadata = {
                name: name + '.jpg',
                mimeType: 'image/jpg',
                parents: [Session.get('driveFolderId')], // Folder ID at Google Drive
            }
            // build formData
            var formData = new FormData()
            // append metadata
            formData.append(
                'metadata',
                new Blob([JSON.stringify(metadata)], {
                    type: 'application/json',
                })
            )
            // append file
            formData.append('file', file)
            driveXHR
                .put(`${env.s3url}/${metadata.name}`, formData)
                .then((resp) => {
                    res(resp.id)
                }, rej)
        })
    },
}
