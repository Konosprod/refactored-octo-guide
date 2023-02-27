import { ThingsCollection } from '../../api/ThingsCollection'
import './ListContainer.html'
import '../thing/Thing.js'
import { Actions } from '../Actions'
import { Store } from '../Store'
import '../forms/dropdownField/DropdownField.js'
import { ListsCollection } from '../../api/ListsCollection'

/***********/
/*  CONST  */
/***********/

/**
 * available options for dropdown sort select
 */
const SORT_OPTIONS = [
    {
        name: 'Alphabetically',
        value: 'name-asc',
    },
    {
        name: 'Most recent',
        value: 'createdAt-desc',
    },
    {
        name: 'Oldest',
        value: 'createdAt-asc',
    },
]

/**
 * default activated sort
 */
const DEFAULT_SORT = {
    name: 'Alphabetically',
    value: 'name-asc',
}

/**
 * default field on which search is done
 */
const DEFAULT_FIELD_FILTER = {
    name: 'All',
    type: 'shortText',
}

/**
 * static list against which filterable fields are found
 */
const SEARCHABLE_FIELD_TYPES = ['shortText', 'longText']

/*************************/
/*  COMPONENT PROTOTYPE  */
/*************************/
function listContainerComponent(TemplateInstance, input) {
    let self = TemplateInstance
    self.selectedList = input.selectedList

    self.isLoading$ = new ReactiveVar(false)

    /**
     * private current active sorting for things query
     * object like {fieldName: -1 | 1}
     */
    self.sortBy$ = new ReactiveVar({ name: 1 })

    /**
     * tags to be included for things filtering can be combined with exclude tag
     */
    self.includeTags$ = new ReactiveVar([])

    /**
     * tags to exclude for things filtering can be combined with include tag
     */
    self.excludeTags$ = new ReactiveVar([])

    /**
     * private ref to global filter param to be passed to collection filtering
     */
    self.filterBy$ = new ReactiveVar({})

    /**
     * value of search filter. it will be combined with activeFieldFilter
     */
    self.searchFilter$ = new ReactiveVar('')

    /**
     * binding : wether to show the tags side panel
     */
    self.showTags$ = new ReactiveVar(false)

    /**
     * binding : available options for field filtering
     */
    self.searchableFields$ = new ReactiveVar([])

    /**
     * binding : currently selected filter field
     */
    self.activeFieldFilter$ = new ReactiveVar(DEFAULT_FIELD_FILTER)

    self.tags$ = new ReactiveVar([])

    /**
     * private value for current page
     * used to calculate how many items to skip in mongo cursor
     */
    self.pageCount$ = new ReactiveVar(0)

    /**
     * private limit for mongo query
     */
    self.pageSize$ = new ReactiveVar(25)

    /**
     * how many items are displayed
     */
    self.currentItemCount$ = new ReactiveVar(0)

    /**
     * the items to display
     */
    self.currentThings$ = new ReactiveVar([])

    /**
     * wether bulk mode is active. will hide any part of the UI enabling
     * user to change dilter or sort items. meant for selection only
     */
    self.showSelected$ = new ReactiveVar(false)

    self.computeTagsAggregation = () => {
        const list = self.selectedList
        const filter = { list_id: list._id, ...self.filterBy$.get() }
        Meteor.call('things.aggregateTags', list._id, filter, (err, res) => {
            const presentTags = res[0].aggregateTags
            const presentTagsNames = res[0].aggregateTags.map((tag) => tag._id)
            // const missingTags = list.tags
            //     .filter((tag) => presentTagsNames.includes(tag) == false)
            //     .map((tag) => ({
            //         _id: tag,
            //         count: 0,
            //     }))
            self.tags$.set(presentTags)
        })
    }
    self.computeTagsAggregation()

    /**
     * handler : when sort option changes, filter things
     * @param {*} value
     * @returns
     */
    self.onSortChange = (value) => {
        if (value === undefined) {
            self.sortBy$.set({})
            return
        }
        const [field, direction] = value.value.split('-')
        const sort = {}
        sort[field] = direction == 'asc' ? 1 : -1
        // console.log(sort)
        self.sortBy$.set(sort)

        self.refreshItems()
    }

    /**
     * handler : when search filter value changes, refilter, taking field filter option into account
     * it will filter items by name
     * @param {*} value
     * @returns
     */
    self.onFieldFilterChange = (value) => {
        console.log('filter changed')
        // get field we should filter by
        let fieldFilters = [self.activeFieldFilter$.get()]

        if (fieldFilters[0].name == 'All') {
            fieldFilters = self.searchableFields$
                .get()
                .filter((field) => field.name != 'All')
        }

        if (value === '' || value === undefined) {
            self.searchFilter$.set('')
            self.filterBy$.set({})
            self.computeTagsAggregation()
            self.refreshItems()
        } else {
            let filters = {}

            function makeFieldName(field) {
                // display Name uppercase in UI, but field name is all lowercase in collection for name field
                if (field.name == 'Name') return field.name.toLowerCase()
                else return `fields.${field.name}`
            }

            if (fieldFilters.length == 1) {
                filters[makeFieldName(fieldFilters[0])] = new RegExp(value, 'i')
            } else if (fieldFilters.length > 1) {
                filters = {
                    $or: fieldFilters.map((field) => {
                        const fieldFilter = {}
                        let fieldName = makeFieldName(field)
                        fieldFilter[fieldName] = new RegExp(value, 'i')
                        return fieldFilter
                    }),
                }
            }

            self.searchFilter$.set(value)
            self.filterBy$.set(filters)
            self.computeTagsAggregation()

            self.refreshItems()
        }
    }

    /**
     * handler : when a tag is clicked, add/remove filters
     * @param {*} tag
     */
    self.onTagClick = (tag) => {
        // update active tags
        let includeTags = self.includeTags$.get()
        let excludeTags = self.excludeTags$.get()

        // if tag is neither in exclude and include, add it
        if (
            includeTags.includes(tag) == false &&
            excludeTags.includes(tag) == false
        ) {
            includeTags.push(tag)
        }
        // if tag is in includeTags, remove it and put it in exclude tag
        else if (includeTags.includes(tag) == true) {
            excludeTags.push(tag)
            includeTags = includeTags.filter((thisTag) => thisTag != tag)
        }
        // if tag is in exclude tag, remove it from exclude tag
        else if (excludeTags.includes(tag) == true) {
            excludeTags = excludeTags.filter((thisTag) => thisTag != tag)
        }

        // update reactive Vars
        self.includeTags$.set(includeTags)
        self.excludeTags$.set(excludeTags)

        // update filters by
        let filters = self.filterBy$.get()
        let tagFilters = {}
        if (includeTags.length > 0) {
            tagFilters = {
                ...tagFilters,
                $in: includeTags,
            }
        }
        if (excludeTags.length > 0) {
            tagFilters = {
                ...tagFilters,
                $nin: excludeTags,
            }
        }

        if (Object.keys(tagFilters).length > 0) {
            filters = {
                ...filters,
                tags: tagFilters,
            }
        } else delete filters['tags']

        self.filterBy$.set(filters)
        self.computeTagsAggregation()

        self.refreshItems()
    }

    /**
     * handler : when a tag is clicked in bulk mode, add or remote it to/from selected things
     * @param {*} tag
     */
    self.onTagBulkClick = (tag) => {
        let selectedThings = Store.get('selectedThings')
        let allSelectedThingsHaveThisTag = true
        selectedThings.forEach((thing) => {
            if (thing.tags.includes(tag) === false)
                allSelectedThingsHaveThisTag = false
        })

        if (allSelectedThingsHaveThisTag) {
            selectedThings = selectedThings.map((thing) => {
                thing.tags = thing.tags.filter((thingTag) => thingTag != tag)
                return thing
            })
        } else {
            selectedThings = selectedThings.map((thing) => {
                if (thing.tags.includes(tag) === false) thing.tags.push(tag)
                return thing
            })
        }

        // update local memory
        const selectedThingsIds = selectedThings.map((thing) => thing._id)
        const currentThings = self.currentThings$.get().map((thing) => {
            if (selectedThingsIds.includes(thing._id)) {
                const newThing = selectedThings.filter(
                    (selectedThing) => thing._id == selectedThing._id
                )[0]
                return newThing
            } else return thing
        })
        self.currentThings$.set(currentThings)

        // update db
        selectedThings.forEach((thing) =>
            Meteor.call('things.update', thing._id, thing)
        )
    }

    /**
     * handler : when tag button clicked, show tags panel
     */
    self.onShowTagClick = () => {
        self.showTags$.set(true)
    }

    /**
     * handler : when tag panel backdrop is clicked, close tag panel
     */
    self.onTagsBackdropClick = () => {
        self.showTags$.set(false)
    }

    /**
     * handler : when clear filters button is clicked, remove all active filters, this includes search filter and active tags
     */
    self.clearFilters = () => {
        self.includeTags$.set([])
        self.excludeTags$.set([])
        self.searchFilter$.set('')
        self.filterBy$.set({})
        self.computeTagsAggregation()
        self.refreshItems()
    }

    /**
     * handler : when field filter changed, refilter
     * @param {*} value
     */
    self.onSearchableFieldsChange = (value) => {
        self.activeFieldFilter$.set(value)
        self.onFieldFilterChange(self.searchFilter$.get())
    }

    /**
     * fetches things from collection taking active UI filters and sorts into account
     * @returns a meteor collection cursor
     */
    self.fetchThings = () => {
        const list_id = self.selectedList._id

        const settings = {
            sort: { ...self.sortBy$.get() },
            skip: self.pageCount$.get() * self.pageSize$.get(),
            limit: self.pageSize$.get(),
        }

        const cursor = ThingsCollection.find(
            { list_id: list_id, ...self.filterBy$.get() },
            settings
        )

        const results = cursor.fetch().map((item) => ({
            ...item,
            selected: Store.get('selectedThings')
                .map((t) => t._id)
                .includes(item._id),
        }))

        return results
    }

    /**
     * handler : enables or disables bulk mode
     */
    self.toggleBulk = () => {
        // force refresh of filters. A bit bruteforce but only way found to reset selection
        Store.set('selectedThings', [])
        self.showSelected$.set(!self.showSelected$.get())
        if (self.showSelected$.get() == false) {
            self.filterBy$.set(self.filterBy$.get())
        }
    }

    /**
     * what happens when load more button is tapped
     * it loads more items to the list
     */
    self.loadMoreThings = () => {
        const currentPageCount = self.pageCount$.get()
        self.pageCount$.set(currentPageCount + 1)

        const currentThings = [
            ...self.currentThings$.get(),
            ...self.fetchThings(),
        ]
        self.currentThings$.set(currentThings)
        self.currentItemCount$.set(currentThings.length)
    }

    /**
     * refetch items from db
     */
    self.refreshItems = () => {
        self.pageCount$.set(0)
        self.currentThings$.set(self.fetchThings())
        const currentThings = self.currentThings$.get()
        self.currentItemCount$.set(currentThings.length)
    }

    /**
     * when a thing is removed, remove this thing from in-memory list
     */
    self.onThingRemoved = (e) => {
        console.log('onThingRemoved', e)
        const things = self.currentThings$
            .get()
            .filter((thing) => thing._id != e.detail._id)
        self.currentThings$.set(things)
    }

    /**
     * when a thing is updated, update the in-memory version of it
     */
    self.onThingUpdated = (e) => {
        console.log('onThingUpdated', e)
        const updatedThing = e.detail
        const things = self.currentThings$.get().map((thing) => {
            if (thing._id == updatedThing._id) return updatedThing
            else return thing
        })
        self.currentThings$.set(things)
    }

    /**
     * when a thing is inserted, insert it in-memory without refetching db
     */
    self.onThingInserted = (e) => {
        console.log('onThingInserted', e)
        const insertedThing = e.detail
        const things = [...self.currentThings$.get(), insertedThing]
        self.currentThings$.set(things)
    }

    /**
     * when a thing operation occurs, recompute tags aggregation
     */
    self.onThingsChanged = () => {
        self.computeTagsAggregation()
    }

    self.onTagsChanged = () => {
        self.tags$.set([])
        self.computeTagsAggregation()
        self.refreshItems()
    }
}

/*****************/
/*  CONSTRUCTOR  */
/*****************/
Template.listContainer.onCreated(function () {
    listContainerComponent(this, Template.currentData())

    // constructor to init searchable fields. we always want to have name field available
    let searchableFields = [
        {
            name: 'Name',
            type: 'shortText',
        },
    ]

    // add fields available in current list
    searchableFields = [
        ...searchableFields,
        ...this.selectedList.fields.filter((field) =>
            SEARCHABLE_FIELD_TYPES.includes(field.type)
        ),
    ]

    // add the default "ALL" field
    searchableFields.push(DEFAULT_FIELD_FILTER)

    // add a value key for fields (needed for binding with dropdown component later)
    searchableFields = searchableFields.map((f) => ({ ...f, value: f.name }))

    this.searchableFields$.set(searchableFields)

    Store.set('selectedThings', [])
    this.isLoading$.set(true)
    Meteor.subscribe('things', Session.get('selectedList')._id, () => {
        this.isLoading$.set(false)
        this.refreshItems()
    })
})

Template.listContainer.onRendered(function () {
    Template.instance().clearFilters()
    // when a thing is removed, update list locally
    window.addEventListener('thingUpdated', Template.instance().onThingUpdated)
    window.addEventListener(
        'thingInserted',
        Template.instance().onThingInserted
    )
    window.addEventListener('thingRemoved', Template.instance().onThingRemoved)
    window.addEventListener(
        'thingsChanged',
        Template.instance().onThingsChanged
    )
    window.addEventListener('tagsChanged', Template.instance().onTagsChanged)
})

Template.listContainer.onDestroyed(function () {
    // init first batch of items
    window.removeEventListener(
        'thingUpdated',
        Template.instance().onThingUpdated
    )
    window.removeEventListener(
        'thingInserted',
        Template.instance().onThingInserted
    )
    window.removeEventListener(
        'thingRemoved',
        Template.instance().onThingRemoved
    )
    window.removeEventListener(
        'thingsChanged',
        Template.instance().onThingsChanged
    )
    window.removeEventListener('tagsChanged', Template.instance().onTagsChanged)
})

/*************/
/*  BINDING  */
/*************/
Template.listContainer.helpers({
    selectedList: () =>
        ListsCollection.findOne(Session.get('selectedList')._id),
    things: () => Template.instance().currentThings$.get(),
    tags: () => Template.instance().tags$.get(),
    DEFAULT_SORT: () => DEFAULT_SORT,
    sortOptions: () => SORT_OPTIONS,
    onSortChange: () => Template.instance().onSortChange,
    onTagClick: () => Template.instance().onTagClick,
    onTagBulkClick: () => Template.instance().onTagBulkClick,
    includeTags: () => Template.instance().includeTags$.get(),
    excludeTags: () => Template.instance().excludeTags$.get(),
    showTags: () => Template.instance().showTags$.get(),
    searchFilter: () => Template.instance().searchFilter$.get(),
    searchableFields: () => Template.instance().searchableFields$.get(),
    activeFieldFilter: () => Template.instance().activeFieldFilter$.get(),
    onSearchableFieldsChange: () =>
        Template.instance().onSearchableFieldsChange,
    showSelected: () => Template.instance().showSelected$.get(),
    itemCount: () => Template.instance().currentItemCount$.get(),
    totalCount: () => Template.instance().selectedList.itemCount,
    isLoading: () => Template.instance().isLoading$.get(),
})

/*************/
/*  HANDLERS  */
/*************/
Template.listContainer.events({
    'click .x-bulk': () => Template.instance().toggleBulk(),
    'click .x-addThing': () => Actions.trigger('openModal', 'thingForm'),
    'keyup .x-filterBy': (e) =>
        Template.instance().onFieldFilterChange(e.target.value),
    'click .x-showTags': () => Template.instance().onShowTagClick(),
    'click .x-tagsBackdrop': () => Template.instance().onTagsBackdropClick(),
    'click .x-clear-filters': () => Template.instance().clearFilters(),
    'click .x-remove-tag-filter': (e) =>
        Template.instance().onTagClick(e.target.getAttribute('data-value')),
    'click .x-load-more-things': () => Template.instance().loadMoreThings(),
})
