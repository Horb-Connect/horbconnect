import { supabase } from './supabaseClient.js';

class EventMap {
    constructor() {
        this.map = null;
        this.markers = new Map();
        this.isSelectingLocation = false;
        this.tempMarker = null;
        this.initMap();
        this.loadEvents();
        this.setupLocationSelection();
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

    setupLocationSelection() {
        const selectLocationBtn = document.getElementById('selectLocation');
        const dialog = document.getElementById('eventDialog');
        
        if (selectLocationBtn) {
            selectLocationBtn.addEventListener('click', () => {
                this.startLocationSelection();
                dialog.classList.add('selecting-location');
            });
        }

        // Handle map clicks for location selection
        this.map.on('click', (e) => {
            if (this.isSelectingLocation) {
                this.setSelectedLocation(e.latlng);
            }
        });
    }

    startLocationSelection() {
        this.isSelectingLocation = true;
        this.map.getContainer().style.cursor = 'crosshair';
        
        // Show helper message
        const helper = document.createElement('div');
        helper.id = 'map-helper';
        helper.textContent = 'Klicke auf der Karte, um den Standort auszuwählen';
        helper.style.position = 'absolute';
        helper.style.top = '10px';
        helper.style.left = '50%';
        helper.style.transform = 'translateX(-50%)';
        helper.style.backgroundColor = 'white';
        helper.style.padding = '10px';
        helper.style.borderRadius = '5px';
        helper.style.zIndex = '1000';
        this.map.getContainer().appendChild(helper);
    }

    setSelectedLocation(latlng) {
        // Update the form inputs
        const latInput = document.getElementById('latitude');
        const lngInput = document.getElementById('longitude');
        
        if (latInput && lngInput) {
            latInput.value = latlng.lat;
            lngInput.value = latlng.lng;
        }

        // Update or create the temporary marker
        if (this.tempMarker) {
            this.tempMarker.setLatLng(latlng);
        } else {
            this.tempMarker = L.marker(latlng).addTo(this.map);
        }

        // Reset selection mode
        this.isSelectingLocation = false;
        this.map.getContainer().style.cursor = '';
        
        // Remove helper message
        const helper = document.getElementById('map-helper');
        if (helper) {
            helper.remove();
        }

        // Remove selecting-location class
        document.getElementById('eventDialog').classList.remove('selecting-location');
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
