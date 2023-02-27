import './DropdownField.html'

const DEFAULT_PLACEHOLDER = 'Please select value'

Template.dropdownField.onCreated(function () {
    this.input = Template.currentData()

    /**
     * binding : label for dropdown
     */
    this.label$ = new ReactiveVar(this.input.label)

    /**
     * binding : wether dropdown is open
     */
    this.isActive$ = new ReactiveVar(false)

    /**
     * binding : currently selected value
     */
    this.currentValue$ = new ReactiveVar(this.input.value)

    /**
     * binding : list of options in dropdown
     */
    this.options$ = new ReactiveVar(this.input.options)

    /**
     * callback function that will be called when a value is selected
     */
    this.onChange = this.input.onChange

    /**
     * handler to toggle open/close of options dropwodn
     * @param {*} state 
     */
    this.toggleDropdown = (state) => {
        if (state === undefined) {
            const current = this.isActive$.get()
            this.isActive$.set(!current)
        }
        else this.isActive$.set(!!state)
    }

    /**
     * setter for select value
     * @param {*} value 
     */
    this.setValue = (value) => {
        this.currentValue$.set(value)
        this.toggleDropdown()
        if (this.onChange) this.onChange(value)
    }

    /**
     * handler : close options dropdown on backdrop click
     */
    this.onBackdropClick = () => {
        this.isActive$.set(false)
    }

    /**
     * handler : what happens when user chooses option
     * @param {*} e 
     * @returns 
     */
    this.onOptionSelect = (e) => {
        const eventValue = e.target.getAttribute('value')
        if (eventValue == DEFAULT_PLACEHOLDER) {
            instance.setValue(undefined)
            return
        }
        const options = this.options$.get()
        const value = options.filter(o => o.value == eventValue)[0]
        this.setValue(value)
    }

    // small constructor to set default option as first iotuib if present
    const options = this.options$.get()
    if (options.length > 0 && this.input.value == undefined) {
        this.currentValue$.set(options[0])
    }
})

Template.dropdownField.helpers({
    isOpen: () => Template.instance().isActive$.get(),
    isActive: () => Template.instance().isActive$.get() ? 'is-active' : '',
    currentValue: () => Template.instance().currentValue$.get(),
    options: () => Template.instance().options$.get(),
    DEFAULT_PLACEHOLDER: () => DEFAULT_PLACEHOLDER,
    label: () => Template.instance().label$.get()
})

Template.dropdownField.events({
    'click .x-toggleDropdown': (e, instance) => {
        e.preventDefault()
        e.stopPropagation()
        instance.toggleDropdown()
    },
    'click .x-selectOption': (e, instance) => instance.onOptionSelect(e),
    'click .x-backdrop': (e, instance) => instance.onBackdropClick(e)
})