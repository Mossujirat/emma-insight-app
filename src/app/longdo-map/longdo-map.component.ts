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
  private map: any;

  constructor() { }

  ngOnInit(): void {
    // You can perform any initialization here that doesn't require DOM access
  }

  ngAfterViewInit(): void {
    // This hook is called after the component's view has been initialized.
    // It's a good place to initialize the map as the 'map' div will be available in the DOM.
    this.initMap();
  }

  initMap(): void {
    if (typeof longdo === 'undefined' || !longdo.Map) {
      console.warn('Longdo Map API is not loaded yet. Retrying...');
      // You might want to add a retry mechanism or a loading spinner here
      setTimeout(() => this.initMap(), 500); // Retry after 500ms
      return;
    }

    this.map = new longdo.Map({
      placeholder: document.getElementById('map'),
      zoom: 10,
      center: { lon: 100.536052, lat: 13.729909 } // Example: Bangkok coordinates
    });

    // Optional: Add a marker
    this.map.Event.bind('ready', () => {
      this.map.marker({ lon: 100.536052, lat: 13.729909 });
    });
  }

  ngOnDestroy(): void {
    // Clean up the map instance when the component is destroyed to prevent memory leaks
    if (this.map) {
      this.map.destroy();
    }
  }
}