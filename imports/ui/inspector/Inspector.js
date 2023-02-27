import './Inspector.html'
import '../thing/thingDetail/ThingDetail.js'
import { Actions } from '../Actions'

/**
 * adds relevant classes to relevant elements to animate modal closing
 * calls callback function after animation has played
 */
function animateCloseModalOk(callback) {
    const slidein = document.querySelector('.widthin-480')
    slidein.classList.remove('widthin-480')
    slidein.classList.add('widthout-480')

    let slideinEnd = false

    function isFinished() {
        if (slideinEnd) callback()
    }

    slidein.addEventListener(
        'animationend',
        function () {
            slideinEnd = true
            isFinished()
        },
        false
    )
}

/**
 * adds relevant classes to relevant elements to animate modal closing
 * calls callback function after animation has played
 */
function animateCloseModalCancel(callback) {
    const slidein = document.querySelector('.widthin-480')
    slidein.classList.remove('widthin-480')
    slidein.classList.add('widthout-480')
    let slideinEnd = false

    function isFinished() {
        if (slideinEnd) callback()
    }

    slidein.addEventListener(
        'animationend',
        function () {
            slideinEnd = true
            isFinished()
        },
        false
    )
}

const validateModal = function(){
    animateCloseModalOk(() => {
        Actions.trigger('closeInspector')
    })
}
const closeModal = function(){
    animateCloseModalCancel(() => {
        Actions.trigger('closeInspector')
    })
}

Template.inspector.helpers({
    context: () => {
        const instance = Template.instance();
        return {
            ...Session.get('inspectorContext'),
            validateModal(){validateModal()},
            closeModal(){closeModal()}
        }
    }
})

Template.inspector.events({
    'click .x-close-inspector'() {
        closeModal()
    }
})