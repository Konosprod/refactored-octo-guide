export const Store = {
    set: (key, value) => {
        this[key] = value
    },
    get: (key) => this[key],
}
