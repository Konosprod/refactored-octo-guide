/**
 * gets an element that has a data-cy attribute
 * useful shorthand for quicker element selecting
 * @param {string} cyElmtName - name of cy element
 * @returns returns the same thing that cy.get normally does
 */
const cyGet = function (cyElmtName) {
    return cy.get(`[data-cy="${cyElmtName}"]`)
}

const perform = function (action) {
    switch (action) {
        case 'select first list':
            cy.get('.listMenuItem').first().click()
            break
        case 'select first thing':
            cy.get('.x-thingDetail').first().click()
    }
}

exports.cyGet = cyGet
exports.perform = perform
