import './LoadingSpinner.html'

Template.loadingSpinner.onCreated(function () {
    this.input = Template.currentData()

    this.size = new ReactiveVar(this.input.size)
})

Template.loadingSpinner.helpers({
    'size'() { return Template.instance().size.get() },
})

Template.loadingSpinner.events({

})