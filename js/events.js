import { supabase } from './supabaseClient.js'

/**
 * Initializes the events functionality of the application.
 * This function sets up event listeners and loads initial data.
 * It is called when the application starts.
 */
export function initEvents() {
    // Get references to DOM elements we'll need
    const addEventButton = document.getElementById('addEvent')
    const eventDialog = document.getElementById('eventDialog')
    const closeDialogButton = document.getElementById('closeDialog')
    const eventForm = document.getElementById('eventForm')

    // Add click event listener to the "Add Event" button
    addEventButton?.addEventListener('click', () => {
        // Load fresh categories when dialog opens
        loadCategories()
        // Show the dialog
        eventDialog.showModal()
    })

    // Close dialog when clicking the close button
    closeDialogButton?.addEventListener('click', () => {
        eventDialog.close()
    })

    // Handle form submission
    eventForm?.addEventListener('submit', async (e) => {
        e.preventDefault()
        
        const formData = new FormData(eventForm)
        const eventData = {
            title: formData.get('title'),
            description: formData.get('description'),
            latitude: parseFloat(formData.get('latitude')),
            longitude: parseFloat(formData.get('longitude')),
            start_time: new Date(formData.get('start_time')).toISOString(),
            end_time: new Date(formData.get('end_time')).toISOString(),
            category_id: formData.get('category'),
            user_id: (await supabase.auth.getUser()).data.user?.id // Add user_id to track creator
        }

        try {
            const { error } = await supabase.from('events').insert([eventData])
            if (error) throw error
            
            eventForm.reset()
            eventDialog.close()
            loadEvents()
        } catch (error) {
            console.error('Error creating event:', error.message)
            alert('Error creating event. Please try again.')
        }
    })
}

/**
 * Loads and displays all current and future events from the database.
 * This function:
 * 1. Fetches events from Supabase where end_time is in the future
 * 2. Clears the current event list
 * 3. Creates and adds new list items for each event
 */
export async function loadEvents() {
    // Get current time in ISO format
    const now = new Date().toISOString()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    // Fetch events from the 'events' table in Supabase where end_time is in the future
    const { data, error } = await supabase
        .from('events')
        .select(`
            *,
            categories:category_id (
                id,
                name
            )
        `)
        .gte('end_time', now)  // Only get events that haven't ended yet
        .order('start_time')   // Order by start time

    if (error) {
        console.error('Error loading events:', error.message)
        return
    }

    // Get reference to the event list container
    const eventList = document.getElementById('eventList')
    // Clear any existing events from the list
    eventList.innerHTML = ''
    
    if (data.length === 0) {
        const li = document.createElement('li')
        li.textContent = 'Keine aktuellen Events verfügbar'
        eventList.appendChild(li)
        return
    }
    
    // For each event in the data:
    data.forEach(event => {
        // Create a new list item element
        const li = document.createElement('li')
        
        // Create event content container
        const eventContent = document.createElement('div')
        eventContent.className = 'event-content'
        
        // Create event header div for title and likes
        const eventHeader = document.createElement('div')
        eventHeader.className = 'event-header'

        // Create title element
        const titleElement = document.createElement('div')
        titleElement.className = 'event-title'
        titleElement.textContent = event.title

        // Create likes container
        const likesContainer = document.createElement('div')
        likesContainer.className = 'event-likes'
         // Create like button
        const likeButton = document.createElement('button')
        likeButton.className = 'like-button'
        likeButton.innerHTML = '👍'
        
        // Create like count
        const likeCount = document.createElement('span')
        likeCount.className = 'like-count'
        likeCount.textContent = '0'
        
        likesContainer.appendChild(likeButton)
        likesContainer.appendChild(likeCount)
        
        // Load and update likes
        const updateLikes = async () => {
            try {
                const { count } = await supabase
                    .from('event_likes')
                    .select('*', { count: 'exact', head: true })
                    .eq('event_id', event.id)
                
                likeCount.textContent = count?.toString() || '0'
                
                if (user) {
                    const { data: userLike } = await supabase
                        .from('event_likes')
                        .select()
                        .eq('event_id', event.id)
                        .eq('user_id', user.id)
                        .maybeSingle()
                    
                    if (userLike) {
                        likeButton.classList.add('liked')
                    } else {
                        likeButton.classList.remove('liked')
                    }
                }
            } catch (error) {
                console.error('Error loading likes:', error)
            }
        }
        
        // Initial load of likes
        updateLikes()
        
        // Handle like button clicks
        likeButton.addEventListener('click', async () => {
            if (!user) {
                alert('Bitte melde dich an, um Events zu liken!')
                return
            }
            
            try {
                const { data: existingLike } = await supabase
                    .from('event_likes')
                    .select()
                    .eq('event_id', event.id)
                    .eq('user_id', user.id)
                    .maybeSingle()
                
                if (existingLike) {
                    const { error } = await supabase
                        .from('event_likes')
                        .delete()
                        .eq('event_id', event.id)
                        .eq('user_id', user.id)
                    
                    if (error) throw error
                } else {
                    const { error } = await supabase
                        .from('event_likes')
                        .insert([{ event_id: event.id, user_id: user.id }])
                    
                    if (error) throw error
                }
                
                // Update likes after change
                await updateLikes()
            } catch (error) {
                console.error('Error toggling like:', error)
                alert('Fehler beim Liken des Events')
            }
        })
        
        eventHeader.appendChild(titleElement)
        eventHeader.appendChild(likesContainer)

        // Add description
        const descriptionElement = document.createElement('div')
        descriptionElement.className = 'event-description'
        descriptionElement.textContent = event.description
        
        // Format the dates and times
        const startDate = new Date(event.start_time)
        const endDate = new Date(event.end_time)

        // Create datetime container
        const datetimeElement = document.createElement('div')
        datetimeElement.className = 'event-datetime'

        // Add date
        const dateElement = document.createElement('span')
        dateElement.className = 'event-date'
        dateElement.textContent = `📅 ${startDate.toLocaleDateString('de-DE')}`

        // Add time
        const timeElement = document.createElement('span')
        timeElement.className = 'event-time'
        timeElement.textContent = `🕒 ${startDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`

        // Add category with icon
        if (event.categories) {
            const categoryElement = document.createElement('span')
            categoryElement.className = 'event-category'
            let categoryIcon = '📌' // Default icon
            
            // Set specific icons based on category name
            if (event.categories.name.toLowerCase().includes('party')) {
                categoryIcon = '🍺'
            } else if (event.categories.name.toLowerCase().includes('sport')) {
                categoryIcon = '🏃'
            }
            
            categoryElement.textContent = `${categoryIcon} ${event.categories.name}`
            datetimeElement.appendChild(categoryElement)
        }

        // Append all elements
        datetimeElement.appendChild(dateElement)
        datetimeElement.appendChild(timeElement)
        eventContent.appendChild(eventHeader)
        eventContent.appendChild(descriptionElement)
        eventContent.appendChild(datetimeElement)
        
        // Add event content to list item
        li.appendChild(eventContent)
        
        // Add delete button if user is the creator
        if (user && event.user_id === user.id) {
            const deleteButton = document.createElement('button')
            deleteButton.className = 'delete-button'
            deleteButton.textContent = '🗑️'
            deleteButton.title = 'Event löschen'
            
            deleteButton.addEventListener('click', async () => {
                if (confirm('Möchtest du dieses Event wirklich löschen?')) {
                    try {
                        const { error } = await supabase
                            .from('events')
                            .delete()
                            .eq('id', event.id)
                        
                        if (error) throw error
                        
                        // Remove the list item from the DOM
                        li.remove()
                        
                        // If no events left, show the "no events" message
                        if (eventList.children.length === 0) {
                            const noEventsLi = document.createElement('li')
                            noEventsLi.textContent = 'Keine aktuellen Events verfügbar'
                            eventList.appendChild(noEventsLi)
                        }
                    } catch (error) {
                        console.error('Error deleting event:', error.message)
                        alert('Fehler beim Löschen des Events')
                    }
                }
            })
            
            li.appendChild(deleteButton)
        }
        
        // Add the list item to the event list
        eventList.appendChild(li)
    })
}

/**
 * Loads and displays all categories from the database.
 * This function:
 * 1. Fetches all categories from Supabase
 * 2. Clears the current category select options
 * 3. Adds a default "Select a category" option
 * 4. Creates and adds new options for each category
 * 
 * The categories are ordered alphabetically by name.
 * If there's an error, it will be logged to the console.
 */
export async function loadCategories() {
    try {
        // Fetch all categories from the 'categories' table in Supabase
        // Order them by name for better user experience
        const { data: categories, error } = await supabase
            .from('categories')
            .select('*')
            .order('name')

        // If there was an error, throw it to be caught by the catch block
        if (error) throw error

        // Get reference to the category select element
        const categorySelect = document.getElementById('categorySelect')
        // If the select element doesn't exist, exit the function
        if (!categorySelect) return

        // Clear existing options and add a default option
        categorySelect.innerHTML = '<option value="">Wähle eine Kategorie</option>'

        // For each category in the data:
        categories.forEach(category => {
            // Create a new option element
            const option = document.createElement('option')
            // Set its value to the category ID
            option.value = category.id
            // Set its display text to the category name
            option.textContent = category.name
            // Add the option to the select element
            categorySelect.appendChild(option)
        })
    } catch (error) {
        // If any error occurs, log it to the console
        console.error('Error loading categories:', error.message)
    }
}


