import { supabase } from './supabaseClient.js';

class EventMap {
    constructor() {
        this.map = null;
        this.markers = new Map();
        this.initMap();
        this.loadEvents();
    }

    initMap() {
        // Initialize map centered on Horb am Neckar
        this.map = L.map('map').setView([48.4447, 8.6869], 13);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);
    }

    async loadEvents() {
        try {
            const { data: events, error } = await supabase
                .from('events')
                .select('*');

            if (error) throw error;

            events.forEach(event => this.addEventMarker(event));
        } catch (error) {
            console.error('Error loading events:', error);
        }
    }

    addEventMarker(event) {
        if (!event.latitude || !event.longitude) return;

        const marker = L.marker([event.latitude, event.longitude])
            .bindPopup(`
                <h3>${event.title}</h3>
                <p>${event.description}</p>
                <p>Start: ${new Date(event.start_time).toLocaleString()}</p>
                <p>Ende: ${new Date(event.end_time).toLocaleString()}</p>
            `);

        marker.addTo(this.map);
        this.markers.set(event.id, marker);
    }

    updateEvent(event) {
        if (this.markers.has(event.id)) {
            this.markers.get(event.id).remove();
        }
        this.addEventMarker(event);
    }

    removeEvent(eventId) {
        if (this.markers.has(eventId)) {
            this.markers.get(eventId).remove();
            this.markers.delete(eventId);
        }
    }
}

// Initialize the map when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const eventMap = new EventMap();

    // Listen for new events
    supabase
        .channel('events')
        .on('INSERT', payload => eventMap.addEventMarker(payload.new))
        .on('UPDATE', payload => eventMap.updateEvent(payload.new))
        .on('DELETE', payload => eventMap.removeEvent(payload.old.id))
        .subscribe();
});
