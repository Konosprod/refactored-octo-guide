import './ThingDetail.html'
import '../thingTags/ThingTags.js'
import '../../lazyImage/LazyImage.js'
import { getS3Url } from '../../utils'
import { Actions } from '../../Actions'

Template.thingDetail.onCreated(function () {
    this.autorun(() => {
        this.input = Template.currentData()
        this.thing = this.input.thing
        this.selectedList = Session.get('selectedList')
        this.fields = this.selectedList.fields

        this.getThumbnail = () => {
            const imageField = this.fields.filter((f) => f.type == 'image')[0]
            return this.thing.fields[imageField.name]
        }
    })
})

Template.thingDetail.helpers({
    fields: () => Template.instance().fields,
    thing: () => Template.currentData().thing,
    getThing: (field) => {
        if (Template.currentData().thing) {
            if (Template.currentData().thing.fields) {
                if (Template.currentData().thing.fields[field])
                    return Template.currentData().thing.fields[field]
                else undefined
            } else return undefined
        } else return undefined
    },
    hasThumbnail: () => {
        console.log(
            Template.instance().getThumbnail() != undefined &&
            Template.instance().getThumbnail() != ''
        )
        return (
            Template.instance().getThumbnail() != undefined &&
            Template.instance().getThumbnail() != ''
        )
    },
    thumbnail: () => {
        return Template.instance().getThumbnail()
    },
    thumbnailSrc: () => {
        return getS3Url(Template.instance().getThumbnail())
    },
})

Template.thingDetail.events({
    'click .x-editThing'() {
        Actions.trigger('openModal', ['thingForm', { thing: this.thing }])
    },
})
