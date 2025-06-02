import { initAuth } from './js/auth.js'
import { initEvents } from './js/events.js'

async function init() {
    console.log('🚀 HorbConnect loaded!')
    initAuth()
    initEvents()
    
    // Dancing Background initialisieren
    const { initBackground } = await import('./js/dancing-background.js')
    initBackground()
}

window.addEventListener('load', () => {
    init()
})

