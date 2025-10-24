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
  @Input() zoom: number = 9; // NEW: Input for map zoom
  @Input() routePoints: LonLatPoint[] | null = [];
  @Input() autoFit: boolean = true; // NEW: Auto-fit view to points when inputs change

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
    const centerOrZoomChanged = (changes['center'] && this.center) || (changes['zoom'] && this.zoom);
    if (centerOrZoomChanged) {
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

    // If drivers changed and no explicit center/zoom override, auto-fit to drivers
    if (changes['drivers'] && !centerOrZoomChanged && this.autoFit) {
      this.fitToPointsFromDrivers();
    }

    // If autoFit toggles to true, re-fit to current drivers
    if (changes['autoFit'] && this.autoFit) {
      this.fitToPointsFromDrivers();
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
        zoom: 9,
        center: { lon: 100.523186, lat: 13.736717 }, // Bangkok, Thailand
      });

      // The 'ready' event is still good practice for when the map is fully interactive
      this.map.Event.bind('ready', () => {
        console.log('Longdo Map is fully ready and controls are set!');
        // this.map.Ui.LayerSelector.visible(false);
        // this.map.Renderer.scrollZoom.disable();
        // Add initial markers if drivers data is already available
        if (this.routePoints && this.routePoints.length > 0) {
          this.drawRoute();
        }
        else if (this.drivers && this.drivers.length > 0 ) {
          this.updateMarkers();
          if (this.autoFit) {
            this.fitToPointsFromDrivers();
          }
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

    // Add route points: start, vias, end, with distinct icons
    this.routePoints.map((p, i) => {
      const kind = i === 0 ? 'start' : (i === this.routePoints!.length - 1 ? 'end' : 'via');
      const marker = new longdo.Marker({ lon: p.lon, lat: p.lat }, { icon: this.getRoutePinIcon(kind) });
      this.map.Route.add(marker);
    });
    this.map.Route.search();
    console.log('Longdo Map: Attempting to add route with', this.routePoints.length, 'points.');
  }

  private getRoutePinIcon(kind: 'start' | 'via' | 'end'): any {
    const color = kind === 'start' ? '#198754' : kind === 'end' ? '#dc3545' : '#0d6efd';
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
      <svg xmlns='http://www.w3.org/2000/svg' width='28' height='42' viewBox='0 0 28 42'>
        <defs>
          <filter id='shadow' x='-50%' y='-50%' width='200%' height='200%'>
            <feDropShadow dx='0' dy='1.5' stdDeviation='1.5' flood-color='rgba(0,0,0,0.35)'/>
          </filter>
        </defs>
        <g filter='url(#shadow)'>
          <path fill='${color}' d='M14 0c-6.6 0-12 5.4-12 12 0 8.7 10.1 19.5 11.1 20.6.5.6 1.4.6 1.9 0C15.9 31.5 26 20.7 26 12 26 5.4 20.6 0 14 0z'/>
          <circle cx='14' cy='12' r='5' fill='white'/>
        </g>
        <ellipse cx='14' cy='40' rx='6' ry='2' fill='rgba(0,0,0,0.25)' />
      </svg>`;
    const url = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
    try {
      if (typeof longdo !== 'undefined' && longdo.Icon) {
        return new longdo.Icon(url, { size: { width: 28, height: 42 }, offset: { x: 14, y: 42 } });
      }
    } catch {}
    return { url, size: { width: 28, height: 42 }, offset: { x: 14, y: 42 } };
  }

  private updateMarkers(): void {
    // Only attempt to update markers if the map instance exists
    if (!this.map || !this.drivers) return;

    try {
        this.map.Overlays.clear(); // Clear existing markers

        this.drivers.forEach(driver => {
            if (driver.currentLongitude && driver.currentLatitude) {
                const marker = new longdo.Marker({
                    lon: driver.currentLongitude,
                    lat: driver.currentLatitude
                }, {
                    icon: this.getMarkerIcon(driver),
                    title: driver.driverName,
                    detail: `Vehicle: ${driver.carLicenseNo}<br/>Available: ${driver.available}<br/>Status: ${driver.status}`
                });
                this.map.Overlays.add(marker); // Add the new marker
            }
        });
    } catch (e) {
        console.error('Error updating markers on Longdo Map:', e);
    }
  }

  // Return a Longdo icon config using a data-URI SVG colored by availability/status
  private getMarkerIcon(driver: Driver | undefined | null): any {
    const color = this.getStatusColor(driver);
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
      <svg xmlns='http://www.w3.org/2000/svg' width='28' height='42' viewBox='0 0 28 42'>
        <defs>
          <filter id='shadow' x='-50%' y='-50%' width='200%' height='200%'>
            <feDropShadow dx='0' dy='1.5' stdDeviation='1.5' flood-color='rgba(0,0,0,0.35)'/>
          </filter>
        </defs>
        <g filter='url(#shadow)'>
          <path fill='${color}' d='M14 0c-6.6 0-12 5.4-12 12 0 8.7 10.1 19.5 11.1 20.6.5.6 1.4.6 1.9 0C15.9 31.5 26 20.7 26 12 26 5.4 20.6 0 14 0z'/>
          <circle cx='14' cy='12' r='5' fill='white'/>
        </g>
        <ellipse cx='14' cy='40' rx='6' ry='2' fill='rgba(0,0,0,0.25)' />
      </svg>`;
    const url = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
    // Prefer Longdo Icon instance if available; fallback to plain object
    try {
      if (typeof longdo !== 'undefined' && longdo.Icon) {
        return new longdo.Icon(url, { size: { width: 28, height: 42 }, offset: { x: 14, y: 42 } });
      }
    } catch {}
    return { url, size: { width: 28, height: 42 }, offset: { x: 14, y: 42 } };
  }

  // Map availability/status to Bootstrap-like colors to match dashboard
  private getStatusColor(driver: Driver | undefined | null): string {
    const available = (driver?.available || '').toLowerCase();
    const status = (driver?.status || '').toLowerCase();
    if (available === 'offline') {
      return '#6c757d'; // secondary
    }
    // available is Online (or anything not Offline)
    switch (status) {
      case 'critical':
        return '#dc3545'; // danger
      case 'normal':
        return '#198754'; // success
      case 'warning':
        return '#ffc107'; // warning
      default:
        return '#0d6efd'; // primary fallback
    }
  }

  // Compute a center and zoom that fits all given points into the current container
  private fitToPointsFromDrivers(paddingPx: number = 40): void {
    if (!this.map || !this.drivers || this.drivers.length === 0) return;
    const points = this.drivers
      .filter(d => d.currentLongitude != null && d.currentLatitude != null)
      .map(d => ({ lon: d.currentLongitude as number, lat: d.currentLatitude as number }));
    if (points.length === 0) return;
    this.fitToPoints(points, paddingPx);
  }

  private fitToPoints(points: { lon: number; lat: number }[], paddingPx: number = 40): void {
    const container = document.getElementById('app-longdo-map');
    const width = Math.max(1, (container?.clientWidth ?? 0));
    const height = Math.max(1, (container?.clientHeight ?? 0));

    // Single-point: center and zoom in
    if (points.length === 1) {
      const p = points[0];
      this.map.location({ lon: p.lon, lat: p.lat }, true);
      this.map.zoom(15, true);
      return;
    }

    let minLon = Number.POSITIVE_INFINITY;
    let maxLon = Number.NEGATIVE_INFINITY;
    let minLat = Number.POSITIVE_INFINITY;
    let maxLat = Number.NEGATIVE_INFINITY;
    for (const p of points) {
      if (p.lon < minLon) minLon = p.lon;
      if (p.lon > maxLon) maxLon = p.lon;
      if (p.lat < minLat) minLat = p.lat;
      if (p.lat > maxLat) maxLat = p.lat;
    }
    const centerLat = (minLat + maxLat) / 2;
    const centerLon = (minLon + maxLon) / 2;

    // Convert deg span to meters approximations
    const degToMetersLat = 111320; // meters per degree latitude
    const degToMetersLon = 111320 * Math.cos(centerLat * Math.PI / 180); // meters per degree longitude at this latitude
    const spanMetersX = Math.max(1, (maxLon - minLon) * degToMetersLon);
    const spanMetersY = Math.max(1, (maxLat - minLat) * degToMetersLat);

    const innerW = Math.max(1, width - 2 * paddingPx);
    const innerH = Math.max(1, height - 2 * paddingPx);

    const mppNeededX = spanMetersX / innerW;
    const mppNeededY = spanMetersY / innerH;
    const mppNeeded = Math.max(mppNeededX, mppNeededY);

    // Web Mercator meters-per-pixel at given zoom and latitude
    const baseMppAtEquator = 156543.03392; // 256px tiles
    const mppFactor = baseMppAtEquator * Math.cos(centerLat * Math.PI / 180);
    let zoom = Math.floor(Math.log2(mppFactor / mppNeeded));
    if (!Number.isFinite(zoom)) zoom = this.zoom || 9;
    zoom = Math.max(3, Math.min(20, zoom));

    this.map.location({ lon: centerLon, lat: centerLat }, true);
    console.log(zoom);
    this.map.zoom(zoom, true);
  }

  ngOnDestroy(): void {
    if (this.map) {
      console.log('LongdoMapComponent destroyed. Map container will be removed from DOM.');
      // No explicit destroy method for map instance in Longdo Map v3 mentioned in docs.
      // Rely on garbage collection and DOM removal.
    }
  }
}
