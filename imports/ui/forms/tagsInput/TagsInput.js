import './TagsInput.html'

const tags = new ReactiveVar([])
const errors = new ReactiveVar('')

Template.tagsInput.onCreated(() => {
    const context = Template.currentData()
    if(context.tags) tags.set(context.tags)
    else tags.set([])
    errors.set('')
})

Template.tagsInput.helpers({
    tags: () => tags.get(),
    errors: () => errors.get(),
})

Template.tagsInput.events({
    'click .x-removeTag'(e) {
        const clickedTag = e.target.getAttribute('data-tag')
        const currentTags = tags.get()
        tags.set(currentTags.filter((tag) => tag != clickedTag))
    },
    'keyup .x-addTag'(e) {
        e.preventDefault()
        e.stopPropagation()
        if (e.originalEvent.key == 'Enter') {
            errors.set(``)
            const newTag = e.target.value
            const currentTags = tags.get()
            if (newTag == '') {
                return
            }
            if (currentTags.includes(newTag)) {
                errors.set(`Tag "${newTag}" was already added to this thing.`)
                return
            }

            currentTags.push(newTag)
            tags.set(currentTags)
            e.target.value = ''
        }
    },
})
