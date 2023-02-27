const { cyGet, perform } = require('../plugins/utilities')

describe('Just a test suit', function () {
    beforeEach(function () {
        cy.visit('/')
    })

    it('can add a thing in list', function () {
        perform('select first list')

        cy.get('.x-addThing').click()
        cy.get(':nth-child(2) > .field-body > .field > .input').type(
            'something added by cypress'
        )
        cy.get('.saveButton').click()
        cy.get('.x-filterBy').type('something added by cypress')

        cy.get('.x-thingDetail').first().contains('something added by cypress')
    })
})
