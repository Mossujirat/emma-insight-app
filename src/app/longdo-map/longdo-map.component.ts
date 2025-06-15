import { Component, OnInit, OnDestroy, AfterViewInit, Input, SimpleChanges, OnChanges } from '@angular/core';
import { Driver } from '../models/driver.model';
import { LonLatPoint } from '../models/current-trip.model';

declare const longdo: any;

// Define a type for map coordinates for clarity (should match DashboardComponent's MapCoordinates)
interface LongdoMapCoordinates {
  lon: number;
  lat: number;
}

@Component({
  selector: 'app-longdo-map',
  standalone: false,
  templateUrl: './longdo-map.component.html',
  styleUrls: ['./longdo-map.component.css']
})

export class LongdoMapComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() drivers: Driver[] | null = [];
  @Input() center: LongdoMapCoordinates | null = null; // NEW: Input for map center
  @Input() zoom: number = 12; // NEW: Input for map zoom
  @Input() routePoints: LonLatPoint[] | null = [];

  private map: any;

  constructor() { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    const checkLongdoApi = () => {
      if (typeof longdo !== 'undefined' && longdo.Map) {
        console.log('Longdo Map API v3 loaded. Initializing map...');
        this.initMap();
      } else {
        console.warn('Longdo Map API v3 not yet loaded. Retrying in 200ms...');
        setTimeout(checkLongdoApi, 200);
      }
    };
    checkLongdoApi();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Check if map is initialized before attempting updates
    if (!this.map) return;

    // We rely on the 'ready' event for initial marker load and just check for map existence here.
    if (changes['drivers'] && this.map) {
      console.log('Drivers data changed, updating map markers...');
      this.updateMarkers();
    }

    if (changes['routePoints'] && this.routePoints) {
      console.log('Route points data changed, drawing route...');
      this.drawRoute(); // Call drawRoute when points change
    }

    // Handle changes to center or zoom inputs
    if ( (changes['center'] && this.center) || (changes['zoom'] && this.zoom) ) {
      // Only update if map is ready and a valid center is provided
      if (this.map.Event && this.center) {
        console.log('Map center/zoom changed. Updating map view.');
        console.log(this.zoom)
        this.map.zoom(this.zoom, true);
        this.map.location({ lon: this.center.lon, lat: this.center.lat }, true);
      } else {
        console.warn('Map not ready for center/zoom update, or center data missing.');
      }
    }
  }

  initMap(): void {
    const mapContainer = document.getElementById('app-longdo-map');
    if (!mapContainer) {
      console.error('Longdo Map container div with ID "map" not found!');
      return;
    }

    if (!this.map) {
      this.map = new longdo.Map({
        placeholder: mapContainer,
        zoom: 12,
        center: { lon: 100.523186, lat: 13.736717 }, // Bangkok, Thailand
      });

      // The 'ready' event is still good practice for when the map is fully interactive
      this.map.Event.bind('ready', () => {
        console.log('Longdo Map is fully ready and controls are set!');
        // this.map.Ui.LayerSelector.visible(false);
        // this.map.Renderer.scrollZoom.disable();
        // Add initial markers if drivers data is already available
        if (this.drivers && this.drivers.length > 0) {
          this.updateMarkers();
        }
        if (this.routePoints && this.routePoints.length > 0) {
          this.drawRoute();
        }
      });
    }
  }

  // Draw Route method for Longdo Map API
  private drawRoute(): void {
    if (!this.map || !this.routePoints || this.routePoints.length < 2) {
      console.warn('Cannot draw route: Map not ready or insufficient route points (need at least 2).');
      return;
    }

    this.map.Route.clear(); // Clear any existing routes 

    // Convert LonLatPoint to longdo.LatLng objects as required 
    this.routePoints.map(p => {
      var marker = new longdo.Marker({ lon: p.lon, lat: p.lat }); 
      this.map.Route.add(marker);
    });
    this.map.Route.search();
    console.log('Longdo Map: Attempting to add route with', this.routePoints.length, 'points.');
  }

  private updateMarkers(): void {
    // Only attempt to update markers if the map instance exists
    if (!this.map || !this.drivers) return;

    // We no longer check map.Event.isReady() here.
    // This method is primarily called by ngOnChanges (after map is initialized)
    // or by the 'ready' event.
    try {
        this.map.Overlays.clear(); // Clear existing markers

        this.drivers.forEach(driver => {
            if (driver.currentLongitude && driver.currentLatitude) {
                const marker = new longdo.Marker({
                    lon: driver.currentLongitude,
                    lat: driver.currentLatitude
                }, {
                    // icon: this.getMarkerIcon(driver.status),
                    title: driver.driverName,
                    detail: `Vehicle: ${driver.carLicenseNo}<br/>Status: ${driver.status}`
                });
                this.map.Overlays.add(marker); // Add the new marker
            }
        });
    } catch (e) {
        console.error('Error updating markers on Longdo Map:', e);
        // This catch block might help if the map is not fully ready for Overlays.clear/add
        // even if Event.isReady is not explicitly callable.
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      console.log('LongdoMapComponent destroyed. Map container will be removed from DOM.');
      // No explicit destroy method for map instance in Longdo Map v3 mentioned in docs.
      // Rely on garbage collection and DOM removal.
    }
  }
}