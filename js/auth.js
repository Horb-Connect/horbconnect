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
        if (!session) {
            // Nicht eingeloggt → nur Login zeigen
            document.getElementById('addEvent').style.display = 'none'
            document.getElementById('eventList').style.display = 'none'
        } else {
            // Eingeloggt → Login-Bereich ausblenden, Events anzeigen
            document.getElementById('auth').style.display = 'none'
            loadEvents()
        }
    })
} 