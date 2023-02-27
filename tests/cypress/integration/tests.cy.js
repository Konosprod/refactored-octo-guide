const { cyGet, perform } = require('../plugins/utilities')

describe('Just a test suit for bugs', function () {
    beforeEach(function () {
        cy.visit('/')
    })

    it('can make a simple assertion', function () {
        expect(true).to.equal(true)
    })

    it('visit page with test user logged in', function () {
        cyGet('top_bar_username').contains('Hello meteorite!')
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
