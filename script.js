import { initAuth } from './js/auth.js'
import { initEvents } from './js/events.js'

async function init() {
    console.log('🚀 HorbConnect loaded!')
    initAuth()
    initEvents()
    
    // Particles.js initialisieren
    await import('./js/particles-config.js')
}

window.addEventListener('load', () => {
    init()
})

