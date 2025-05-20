import { initAuth } from './js/auth.js'
import { initEvents } from './js/events.js'

function init() {
    console.log('🚀 HorbConnect loaded!')
    initAuth()
    initEvents()
}

window.addEventListener('load', () => {
    init()
})

