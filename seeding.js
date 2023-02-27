const lists = []

const listId = 'bhGk3Gdtj9kdjuFaN'

for (var i = 0; i < 12; i++) {
    lists.push({
        _id: listId + i,
        name: 'Recipes' + i,
        tags: ['Meal', 'Dessert', 'Side'],
        userId: '',
        itemCount: 7777,
        fields: [
            {
                name: 'Author',
                type: 'shortText',
            },
            {
                name: 'Comment',
                type: 'longText',
            },
            {
                name: 'Link',
                type: 'url',
            },
            {
                name: 'Thumbnail',
                type: 'image',
            },
        ],
        createdAt: Date.now(),
    })
}

const vowels = [' ', 'a', 'i', 'u', 'e', 'o']
const consonants = [
    '',
    'k',
    'h',
    'w',
    'p',
    'b',
    's',
    'ch',
    'y',
    'r',
    'g',
    'z',
    'n',
    'm',
    'j',
    'd',
]
const ids = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const syllables = []

consonants.forEach((consonant) => {
    vowels.forEach((vowel) => {
        syllables.push(consonant + vowel)
    })
})

function randomName(name = '') {
    if (Math.random() < 0.25 && name.length > 4) return name
    else {
        const index = Math.floor(Math.random() * syllables.length)
        return randomName(name + syllables[index])
    }
}
function randomId(name = '') {
    if (name.length == 99) return name
    else {
        const index = Math.floor(Math.random() * ids.length)
        return randomId(name + ids[index])
    }
}

const things = []
lists.forEach((list) => {
    for (var i = 0; i < 200; i++) {
        things.push({
            _id: `${randomId()}`,
            name: `no${i}-${randomName()}`,
            tags: [],
            list_id: list._id,
            createdAt: Date.now(),
            userId: '',
            fields: {
                Author: '',
                Comment: '',
                Link: '',
            },
        })
    }
})
//
exports.seeding = { lists, things }
