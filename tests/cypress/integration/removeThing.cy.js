const { cyGet, perform } = require('../plugins/utilities')

describe('Just a test suit', function () {
    beforeEach(function () {
        cy.visit('/')
    })

    it('can remove a thing from list', function () {
        perform('select first list')

        cy.get(':nth-child(2) > .field-body > .field > .input').type(
            'something added by cypress'
        )
        cy.on('window:confirm', () => true)
        cy.get('.x-deleteThing ').first().click()
        cy.get('x-clear-filters').click()
        cy.get(':nth-child(2) > .field-body > .field > .input').type(
            'something added by cypress'
        )
        cy.get('.x-thingDetail')
            .first()
            .should('not.have.text', 'something added by cypress')
    })
})
