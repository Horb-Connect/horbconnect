import { supabase } from './supabaseClient.js'
import { loadEvents } from './events.js'

export function initAuth() {
    const loginBtn = document.getElementById('login')
    const emailInput = document.getElementById('email')

    loginBtn?.addEventListener('click', async () => {
        const email = emailInput.value
        const { error } = await supabase.auth.signInWithOtp({ email })
        if (error) {
            alert('❌ Fehler beim Login: ' + error.message)
        } else {
            alert('✅ Magic Link wurde geschickt! Check deine Mail.')
        }
    })

    // Session prüfen: Zugriff blockieren oder zulassen
    supabase.auth.getSession().then(({ data: { session } }) => {
        const addEventButton = document.getElementById('addEvent')
        const eventList = document.getElementById('eventList')
        
        if (!session) {
            // Nicht eingeloggt → nur Login zeigen
            if (addEventButton) addEventButton.style.display = 'none'
            if (eventList) eventList.style.display = 'none'
        } else {
            // Eingeloggt → Login-Bereich ausblenden, Events anzeigen
            document.getElementById('auth').style.display = 'none'
            if (addEventButton) addEventButton.style.display = 'block'
            if (eventList) eventList.style.display = 'block'
            // Events laden und initialisieren
            loadEvents()
        }
    })
} 