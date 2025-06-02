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

    // Close dialog when clicking backdrop
    eventDialog?.addEventListener('click', (e) => {
        if (e.target === eventDialog) {
            eventDialog.close()
        }
    })

    // Handle form submission with loading state
    eventForm?.addEventListener('submit', async (e) => {
        e.preventDefault()
        
        const submitButton = eventForm.querySelector('button[type="submit"]')
        submitButton.classList.add('loading')
        submitButton.disabled = true
        
        const formData = new FormData(eventForm)
        const eventData = {
            title: formData.get('title'),
            description: formData.get('description'),
            latitude: parseFloat(formData.get('latitude')),
            longitude: parseFloat(formData.get('longitude')),
            start_time: new Date(formData.get('start_time')).toISOString(),
            end_time: new Date(formData.get('end_time')).toISOString(),
            category_id: formData.get('category'),
            user_id: (await supabase.auth.getUser()).data.user?.id
        }

        try {
            const { error } = await supabase.from('events').insert([eventData])
            if (error) throw error
            
            eventForm.reset()
            closeDialogWithAnimation(eventDialog)
            loadEvents()
        } catch (error) {
            console.error('Error creating event:', error.message)
            alert('Error creating event. Please try again.')
        } finally {
            submitButton.classList.remove('loading')
            submitButton.disabled = false
        }
    })

    // Load initial events
    loadEvents()
}

// Dialog animations are now handled through CSS only

// Helper function to create loading skeletons
function createEventSkeleton() {
    const li = document.createElement('li')
    li.className = 'loading-skeleton'
    li.style.height = '200px'
    return li
}

// Show loading state
function showLoading(container) {
    container.innerHTML = ''
    for (let i = 0; i < 6; i++) {
        container.appendChild(createEventSkeleton())
    }
}

// Intersection Observer for scroll animations
const observeElements = () => {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in')
                    observer.unobserve(entry.target)
                }
            })
        },
        { threshold: 0.1 }
    )

    document.querySelectorAll('li').forEach(element => {
        observer.observe(element)
    })
}

/**
 * Loads and displays all current and future events from the database.
 * This function:
 * 1. Shows loading state
 * 2. Fetches events from Supabase where end_time is in the future
 * 3. Creates and adds new list items for each event with animations
 */
export async function loadEvents() {
    const eventList = document.getElementById('eventList')
    showLoading(eventList)

    // Get current time in ISO format
    const now = new Date().toISOString()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    try {
        // Fetch events from the 'events' table in Supabase
        const { data, error } = await supabase
            .from('events')
            .select(`
                *,
                categories:category_id (
                    id,
                    name
                )
            `)
            .gte('end_time', now)
            .order('start_time')

        if (error) throw error

        // Clear loading state
        eventList.innerHTML = ''
        eventList.className = 'stagger-children'
        
        if (data.length === 0) {
            const li = document.createElement('li')
            li.textContent = 'Keine aktuellen Events verfügbar'
            li.className = 'animate-in'
            eventList.appendChild(li)
            return
        }
        
        // For each event in the data:
        data.forEach((event, index) => {
            // Create a new list item element
            const li = document.createElement('li')
            
            // Create event content container
            const eventContent = document.createElement('div')
            eventContent.className = 'event-content'
            
            // Create event header div for title and likes
            const eventHeader = document.createElement('div')
            eventHeader.className = 'event-header'

            // Create title element with gradient animation
            const titleElement = document.createElement('div')
            titleElement.className = 'event-title'
            titleElement.textContent = event.title

            // Create likes container with hover animation
            const likesContainer = document.createElement('div')
            likesContainer.className = 'event-likes'
            
            // Create animated like button
            const likeButton = document.createElement('button')
            likeButton.className = 'like-button'
            likeButton.innerHTML = '👍'
            
            // Add pulse animation when liking
            likeButton.addEventListener('click', () => {
                if (!likeButton.classList.contains('liked')) {
                    likeButton.classList.add('animate-pulse')
                    setTimeout(() => {
                        likeButton.classList.remove('animate-pulse')
                    }, 1000)
                }
            })
            
            // Create like count with transition
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
            
            // Create category badge with dynamic color
            const categoryBadge = document.createElement('div')
            categoryBadge.className = 'event-category'
            categoryBadge.setAttribute('data-category', event.categories?.name.toLowerCase() || '')
            categoryBadge.textContent = event.categories?.name || 'Uncategorized'

            // Create description with fade-in
            const description = document.createElement('div')
            description.className = 'event-description'
            description.textContent = event.description

            // Create animated datetime section
            const datetime = document.createElement('div')
            datetime.className = 'event-datetime'

            const startDate = new Date(event.start_time)
            const endDate = new Date(event.end_time)

            const dateElement = document.createElement('div')
            dateElement.className = 'event-date'
            dateElement.innerHTML = `📅 ${startDate.toLocaleDateString()}`

            const timeElement = document.createElement('div')
            timeElement.className = 'event-time'
            timeElement.innerHTML = `⏰ ${startDate.toLocaleTimeString()} - ${endDate.toLocaleTimeString()}`

            // Assemble the event card
            eventHeader.appendChild(titleElement)
            eventHeader.appendChild(likesContainer)

            eventContent.appendChild(eventHeader)
            eventContent.appendChild(categoryBadge)
            eventContent.appendChild(description)

            datetime.appendChild(dateElement)
            datetime.appendChild(timeElement)
            eventContent.appendChild(datetime)

            // If user is the creator, add delete button
            if (user && event.user_id === user.id) {
                const deleteButton = document.createElement('button')
                deleteButton.className = 'delete-button'
                deleteButton.innerHTML = '🗑️'
                deleteButton.onclick = async (e) => {
                    e.stopPropagation()
                    if (confirm('Möchtest du dieses Event wirklich löschen?')) {
                        try {
                            const { error } = await supabase
                                .from('events')
                                .delete()
                                .eq('id', event.id)
                            
                            if (error) throw error
                            
                            // Animate removal
                            li.style.animation = 'fadeOut 0.3s ease-out forwards'
                            setTimeout(() => {
                                li.remove()
                                if (eventList.children.length === 0) {
                                    loadEvents() // Reload if no events left
                                }
                            }, 300)
                        } catch (error) {
                            console.error('Error deleting event:', error)
                            alert('Fehler beim Löschen des Events')
                        }
                    }
                }
                eventContent.appendChild(deleteButton)
            }

            li.appendChild(eventContent)
            eventList.appendChild(li)
        })
        
        // Apply staggered animation to children
        const children = Array.from(eventList.children)
        children.forEach((child, index) => {
            child.style.transitionDelay = `${index * 50}ms`
        })
        
        // Observe elements for scroll animations
        observeElements()
    } catch (error) {
        console.error('Error loading events:', error.message)
    }
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


