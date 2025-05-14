import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ✅ Deine echten Supabase-Zugangsdaten
const supabaseUrl = 'https://tduykpwtfgfwodnogdrc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkdXlrcHd0Zmdmd29kbm9nZHJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0MTY2NDUsImV4cCI6MjA2MDk5MjY0NX0.f0D3rjO4martnja5ErT-6d-5lkM4Sl5RiOP-fZW7LeM'
const supabase = createClient(supabaseUrl, supabaseKey)

// Elemente aus dem HTML holen
const addEventButton = document.getElementById('addEvent')
const eventInput = document.getElementById('eventInput')
const eventList = document.getElementById('eventList')

// Wenn Button geklickt wird, Event speichern
addEventButton.addEventListener('click', async () => {
  const eventText = eventInput.value.trim()
  if (!eventText) return

  // Event an Supabase senden
  await supabase.from('events').insert([{ text: eventText }])
  loadEvents()
  eventInput.value = ''
})

// Events von Supabase laden & anzeigen
async function loadEvents() {
  const { data } = await supabase.from('events').select('*')
  eventList.innerHTML = ''
  data.forEach(event => {
    const li = document.createElement('li')
    li.textContent = event.text
    eventList.appendChild(li)
  })
}

loadEvents()

