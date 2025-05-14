// Supabase-Client einbinden
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Deine Supabase-Zugangsdaten
const supabaseUrl = 'https://tduykpwtfgfwodnogdrc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkdXlrcHd0Zmdmd29kbm9nZHJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0MTY2NDUsImV4cCI6MjA2MDk5MjY0NX0.f0D3rjO4martnja5ErT-6d-5lkM4Sl5RiOP-fZW7LeM'
const supabase = createClient(supabaseUrl, supabaseKey)

// Login-Elemente
const loginBtn = document.getElementById('login')
const emailInput = document.getElementById('email')

// Login-Button: Magic Link senden
loginBtn?.addEventListener('click', async () => {
  const email = emailInput.value
  const { error } = await supabase.auth.signInWithOtp({ email })
  if (error) {
    alert('❌ Fehler beim Login: ' + error.message)
  } else {
    alert('✅ Magic Link wurde geschickt! Check deine Mail.')
  }
})

// Event-Elemente
const addEventButton = document.getElementById('addEvent')
const eventInput = document.getElementById('eventInput')
const eventList = document.getElementById('eventList')

// Events speichern
addEventButton?.addEventListener('click', async () => {
  const eventText = eventInput.value.trim()
  if (!eventText) return

  await supabase.from('events').insert([{ text: eventText }])
  eventInput.value = ''
  loadEvents()
})

// Events laden & anzeigen
async function loadEvents() {
  const { data } = await supabase.from('events').select('*')
  eventList.innerHTML = ''
  data.forEach(event => {
    const li = document.createElement('li')
    li.textContent = event.text
    eventList.appendChild(li)
  })
}

// Session prüfen: Zugriff blockieren oder zulassen
supabase.auth.getSession().then(({ data: { session } }) => {
  if (!session) {
    // Nicht eingeloggt → nur Login zeigen
    document.getElementById('eventInput').style.display = 'none'
    document.getElementById('addEvent').style.display = 'none'
    document.getElementById('eventList').style.display = 'none'
  } else {
    // Eingeloggt → Login-Bereich ausblenden, Events anzeigen
    document.getElementById('auth').style.display = 'none'
    loadEvents()
  }
})
