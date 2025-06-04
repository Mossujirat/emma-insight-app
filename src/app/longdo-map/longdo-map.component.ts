import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';

// Declare the Longdo Map global object
declare const longdo: any;

@Component({
  selector: 'app-longdo-map',
  standalone: false,
  templateUrl: './longdo-map.component.html',
  styleUrls: ['./longdo-map.component.css']
})
export class LongdoMapComponent implements OnInit, AfterViewInit, OnDestroy {
  private map: any; // Keep this as 'any' for now, as the global 'longdo' object is dynamic.

  constructor() { }

  ngOnInit(): void {
    // You can perform any initialization here that doesn't require DOM access
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  initMap(): void {
    // Basic check if longdo object and Map constructor are available
    if (typeof longdo === 'undefined' || !longdo.Map) {
      console.warn('Longdo Map API is not loaded yet. Retrying...');
      // It's good to have a mechanism to ensure the script loads before trying to use it.
      // A simple setTimeout retry is okay for development, but for production, you might
      // want a more robust solution, like an Observable that emits when the script loads.
      setTimeout(() => this.initMap(), 500);
      return;
    }

    // Check if the map has already been initialized to prevent multiple initializations
    if (!this.map) {
        this.map = new longdo.Map({
            placeholder: document.getElementById('map'),
            zoom: 10,
            center: { lon: 100.536052, lat: 13.729909 } // Example: Bangkok coordinates
        });

        // FIX: Use this.map.Overlays.add() to add the marker
        this.map.Event.bind('ready', () => {
            const marker = new longdo.Marker({ lon: 100.536052, lat: 13.729909 });
            this.map.Overlays.add(marker); // Correct method for adding a marker to the map
        });
    }
  }

  ngOnDestroy(): void {
    // FIX: Remove the call to this.map.destroy().
    // The Longdo Map object itself does not have a 'destroy' method.
    // When this Angular component is destroyed, its template (including the #map div)
    // will be removed from the DOM, which typically handles the cleanup for map instances
    // initialized in this manner.
    // if (this.map) {
    //   this.map.destroy(); // This line caused the TypeError
    // }
    console.log('LongdoMapComponent destroyed. Map container will be removed from DOM.');
  }
}