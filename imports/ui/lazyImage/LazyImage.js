import './LazyImage.html'
import '../loadingSpinner/LoadingSpinner.js'

Template.lazyImage.onCreated(function () {
    this.loadedSrc = new ReactiveVar('')
    this.autorun(() => {
        this.input = Template.currentData()

        this.src = new ReactiveVar(this.input.src)
        this.size = new ReactiveVar(this.input.size || '128px')

        this.loading = new ReactiveVar(true)
        this.noImage = new ReactiveVar(false)

        if (this.input.src == '#') {
            this.loading.set(false)
            this.noImage.set(true)
        }

        this.checkIfVisible = () => {
            if (this.src.get() == this.loadedSrc.get())
                clearInterval(this.checkVisibleInterval)
            if (this.noImage.get()) clearInterval(this.checkVisibleInterval)

            if (this.firstNode) {
                this.bounds = this.firstNode.getBoundingClientRect()
                if (
                    this.bounds === undefined ||
                    this.checkVisibleInterval === undefined
                )
                    return
                else {
                    if (
                        this.bounds.top - this.bounds.height / 2 <
                        window.innerHeight
                    ) {
                        this.loadedSrc.set(this.src.get())
                        this.loading.set(false)
                        clearInterval(this.checkVisibleInterval)
                    }
                }
            }
        }

        this.checkVisibleInterval = setInterval(this.checkIfVisible, 500)
    })
})

Template.lazyImage.helpers({
    src() {
        return Template.instance().src.get()
    },
    loadedSrc() {
        return Template.instance().loadedSrc.get()
    },
    size() {
        return Template.instance().size.get()
    },
    loading() {
        return Template.instance().loading.get()
    },
    noImage() {
        return Template.instance().noImage.get()
    },
})

Template.lazyImage.events({})
