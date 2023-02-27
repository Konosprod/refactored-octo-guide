import './ModalContainer.html'
import { Template } from 'meteor/templating'
import { Session } from 'meteor/session'
import '../list/listEditModal/ListEditModal'
import '../thing/thingForm/ThingForm.js'
import { Actions } from '../Actions'

/**
 * adds relevant classes to relevant elements to animate modal closing
 * calls callback function after animation has played
 */
function animateCloseModalOk(callback) {
    const fadein = document.querySelector('.fadein')
    fadein.classList.remove('fadein')
    fadein.classList.add('fadeout')
    const slidein = document.querySelector('.slideinUp')
    slidein.classList.remove('slideinUp')
    slidein.classList.add('slideoutUp')

    let fadeinEnd = false
    let slideinEnd = false

    function isFinished() {
        if (fadeinEnd && slideinEnd) callback()
    }

    slidein.addEventListener(
        'animationend',
        function () {
            slideinEnd = true
            isFinished()
        },
        false
    )
    fadein.addEventListener(
        'animationend',
        function () {
            fadeinEnd = true
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
    const fadein = document.querySelector('.fadein')
    fadein.classList.remove('fadein')
    fadein.classList.add('fadeout')
    const slidein = document.querySelector('.slideinUp')
    slidein.classList.remove('slideinUp')
    slidein.classList.add('slideoutDown')

    let fadeinEnd = false
    let slideinEnd = false

    function isFinished() {
        if (fadeinEnd && slideinEnd) callback()
    }

    slidein.addEventListener(
        'animationend',
        function () {
            slideinEnd = true
            isFinished()
        },
        false
    )
    fadein.addEventListener(
        'animationend',
        function () {
            fadeinEnd = true
            isFinished()
        },
        false
    )
}

const validateModal = function(){
    animateCloseModalOk(() => {
        Actions.trigger('closeModal')
    })
}
const closeModal = function(){
    animateCloseModalCancel(() => {
        Actions.trigger('closeModal')
    })
}

Template.modalContainer.helpers({
    context: () => {
        const instance = Template.instance();
        return {
            ...Session.get('modalContext'),
            validateModal(){validateModal()},
            closeModal(){closeModal()}
        }
    }
})

Template.modalContainer.events({
    'keydown .modal-form'(e) {
        console.log('form keydown')
        if (e.originalEvent.key == 'Enter') {
            e.preventDefault()
            e.stopPropagation()
        }
    },
    'click .x-close-overlay'(e) {
        e.preventDefault()
        e.stopPropagation()

        animateCloseModalCancel(() => {
            Actions.trigger('closeModal')
        })
    }
})