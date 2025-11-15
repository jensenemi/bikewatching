// import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
// import mapboxgl from 'https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/+esm';

// // Set your Mapbox access token here
// mapboxgl.accessToken = 'pk.eyJ1IjoiamVuc2VuZW1pIiwiYSI6ImNtaHlncGlkazAxbGoycnFiMnFuNmt0ZDAifQ.jk-QVC4eV_Kdryhet7PtgA';

// // Initialize the map
// const map = new mapboxgl.Map({
//   container: 'map', // ID of the div where the map will render
//   style: 'mapbox://styles/mapbox/streets-v12', // Map style
//   center: [-71.09415, 42.36027], // [longitude, latitude]
//   zoom: 12, // Initial zoom level
//   minZoom: 5, // Minimum allowed zoom
//   maxZoom: 18, // Maximum allowed zoom
// });

// const bikeLaneStyle = {
//     'line-color': '#32D400', 
//     'line-width': 3,
//     'line-opacity': 0.6,
// };

// const svg = d3.select('#map').select('svg');

// let timeFilter = -1;
// const timeSlider = document.getElementById('time-slider');
// const selectedTime = document.getElementById('selected-time');
// const anyTimeLabel = document.getElementById('any-time-text');

// function getCoords(station) {
//     const point = new mapboxgl.LngLat(+station.lon, +station.lat); // Convert lon/lat to Mapbox LngLat
//     const { x, y } = map.project(point); // Project to pixel coordinates
//     return { cx: x, cy: y }; // Return as object for use in SVG attributes
// }

// function minutesSinceMidnight(date) {
//     return date.getHours() * 60 + date.getMinutes();
// }

// function filterTripsbyTime(trips, timeFilter) {
//     return timeFilter === -1
//       ? trips // If no filter is applied (-1), return all trips
//       : trips.filter((trip) => {
//           // Convert trip start and end times to minutes since midnight
//           const startedMinutes = minutesSinceMidnight(trip.started_at);
//           const endedMinutes = minutesSinceMidnight(trip.ended_at);
  
//           // Include trips that started or ended within 60 minutes of the selected time
//           return (
//             Math.abs(startedMinutes - timeFilter) <= 60 ||
//             Math.abs(endedMinutes - timeFilter) <= 60
//           );
//         });
// }

// function computeStationTraffic(stations, trips) {
//     // Compute departures
//     const departures = d3.rollup(
//       trips,
//       (v) => v.length,
//       (d) => d.start_station_id,
//     );
  
//     // Computed arrivals as you did in step 4.2
//     const arrivals = d3.rollup(
//         trips,
//         v => v.length,
//         d => d.end_station_id
//     );

//     // Update each station..
//     return stations.map((station) => {
//       let id = station.short_name;
//       station.arrivals = arrivals.get(id) ?? 0;
//       station.departures = departures.get(id) ?? 0;
//       station.totalTraffic = station.departures + station.arrivals;
//       return station;
//     });
// }

// function updateTimeDisplay() {
//     timeFilter = Number(timeSlider.value); // Get slider value
  
//     if (timeFilter === -1) {
//       selectedTime.textContent = ''; // Clear time display
//       anyTimeLabel.style.display = 'block'; // Show "(any time)"
//     } else {
//       selectedTime.textContent = formatTime(timeFilter); // Display formatted time
//       anyTimeLabel.style.display = 'none'; // Hide "(any time)"
//     }
//     // Trigger filtering logic which will be implemented in the next step
//     updateScatterPlot(timeFilter);
// }

// function formatTime(minutes) {
//     const date = new Date(0, 0, 0, 0, minutes); // Set hours & minutes
//     return date.toLocaleString('en-US', { timeStyle: 'short' }); // Format as HH:MM AM/PM
// }


// map.on('load', async () => {
//     map.addSource('boston_route', {
//         type: 'geojson',
//         data: 'https://bostonopendata-boston.opendata.arcgis.com/datasets/boston::existing-bike-network-2022.geojson',
//     });
//     map.addLayer({
//         id: 'boston-bike-lanes',
//         type: 'line',
//         source: 'boston_route',
//         paint: bikeLaneStyle
//     });
//     map.addSource('cambridge_route', {
//         type: 'geojson',
//         data: 'https://raw.githubusercontent.com/cambridgegis/cambridgegis_data/main/Recreation/Bike_Facilities/RECREATION_BikeFacilities.geojson',
//     });
//     map.addLayer({
//         id: 'cambridge-bike-lanes',
//         type: 'line',
//         source: 'cambridge_route',
//         paint: bikeLaneStyle
//     });
//     let jsonData;
//     try {
//         const jsonurl = 'https://dsc106.com/labs/lab07/data/bluebikes-stations.json';
//         // Await JSON fetch
//         const jsonData = await d3.json(jsonurl);
//         console.log('Loaded JSON Data:', jsonData); // Log to verify structure
//         let stations = jsonData.data.stations;
//         //within the map.on('load')
//         let trips = await d3.csv(
//             'https://dsc106.com/labs/lab07/data/bluebikes-traffic-2024-03.csv',
//             (trip) => {
//                 trip.started_at = new Date(trip.started_at);
//                 trip.ended_at = new Date(trip.ended_at);
//                 return trip;
//             },
//         );
//         stations = computeStationTraffic(jsonData.data.stations, trips);
//         const departures = d3.rollup(
//             trips,
//             (v) => v.length,
//             (d) => d.start_station_id,
//         );
//         const arrivals = d3.rollup(
//             trips,
//             v => v.length,
//             d => d.end_station_id
//         );
//         const radiusScale = d3
//             .scaleSqrt()
//             .domain([0, d3.max(stations, (d) => d.totalTraffic)])
//             .range([0, 25]);
//         // Append circles to the SVG for each station
//         let circles = svg
//             .selectAll('circle')
//             .data(stations, (d) => d.short_name)
//             .enter()
//             .append('circle')
//             .attr('cx', d => getCoords(d).cx)              
//             .attr('cy', d => getCoords(d).cy)    
//             .attr('r', d => radiusScale(d.totalTraffic))            
//             .attr('fill', 'steelblue') // Circle fill color
//             .attr('stroke', 'white') // Circle border color
//             .attr('stroke-width', 1) // Circle border thickness
//             .attr('opacity', 0.8) // Circle opacity
//             .each(function (d) {
//                 d3.select(this)
//                     .append('title')
//                     .text(
//                         `${d.totalTraffic} trips (${d.departures} departures, ${d.arrivals} arrivals)`,
//                     );
//             });
    
//         // Function to update circle positions when the map moves/zooms
//         function updatePositions() {
//             circles
//                 .attr('cx', (d) => getCoords(d).cx) // Set the x-position using projected coordinates
//                 .attr('cy', (d) => getCoords(d).cy); // Set the y-position using projected coordinates
//         }
  
//         // Initial position update when map loads
//         updatePositions();
//         // Reposition markers on map interactions
//         map.on('move', updatePositions); // Update during map movement
//         map.on('zoom', updatePositions); // Update during zooming
//         map.on('resize', updatePositions); // Update on window resize
//         map.on('moveend', updatePositions); // Final adjustment after movement ends

//         function updateScatterPlot(timeFilter) {
//             // Get only the trips that match the selected time filter
//             const filteredTrips = filterTripsbyTime(trips, timeFilter);
          
//             // Recompute station traffic based on the filtered trips
//             const filteredStations = computeStationTraffic(stations.map(s => ({ ...s })), filteredTrips);

//             timeFilter === -1 ? radiusScale.range([0, 25]) : radiusScale.range([3, 50]);
//             // Update the scatterplot by adjusting the radius of circles
//             circles = circles
//               .data(filteredStations, (d) => d.short_name)
//               .join('circle') // Ensure the data is bound correctly
//               .attr('r', (d) => radiusScale(d.totalTraffic)) // Update circle sizes
//               .attr('cx', d => getCoords(d).cx)
//               .attr('cy', d => getCoords(d).cy);
//         }
//         timeSlider.addEventListener('input', updateTimeDisplay);
//         updateTimeDisplay();
//     } catch (error) {
//         console.error('Error loading JSON:', error); // Handle errors
//     }
// });

import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import mapboxgl from 'https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/+esm';

// Mapbox token
mapboxgl.accessToken = 'pk.eyJ1IjoiamVuc2VuZW1pIiwiYSI6ImNtaHlncGlkazAxbGoycnFiMnFuNmt0ZDAifQ.jk-QVC4eV_Kdryhet7PtgA';

// Initialize map
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [-71.09415, 42.36027],
    zoom: 12,
    minZoom: 5,
    maxZoom: 18,
});

// Bike lane style
const bikeLaneStyle = {
    'line-color': '#32D400',
    'line-width': 3,
    'line-opacity': 0.6,
};

// Select SVG inside the map
const svg = d3.select('#map').select('svg');

// Time filter setup
let timeFilter = -1;
const timeSlider = document.getElementById('time-slider');
const selectedTime = document.getElementById('selected-time');
const anyTimeLabel = document.getElementById('any-time-text');

// Helper functions
function getCoords(station) {
    const point = new mapboxgl.LngLat(+station.lon, +station.lat);
    const { x, y } = map.project(point);
    return { cx: x, cy: y };
}

function minutesSinceMidnight(date) {
    return date.getHours() * 60 + date.getMinutes();
}

function filterTripsbyTime(trips, timeFilter) {
    return timeFilter === -1
        ? trips
        : trips.filter(trip => {
            const startedMinutes = minutesSinceMidnight(trip.started_at);
            const endedMinutes = minutesSinceMidnight(trip.ended_at);
            return (
                Math.abs(startedMinutes - timeFilter) <= 60 ||
                Math.abs(endedMinutes - timeFilter) <= 60
            );
        });
}

function computeStationTraffic(stations, trips) {
    const departures = d3.rollup(trips, v => v.length, d => d.start_station_id);
    const arrivals = d3.rollup(trips, v => v.length, d => d.end_station_id);
    return stations.map(station => {
        const id = station.short_name;
        station.departures = departures.get(id) ?? 0;
        station.arrivals = arrivals.get(id) ?? 0;
        station.totalTraffic = station.departures + station.arrivals;
        return station;
    });
}

function formatTime(minutes) {
    const date = new Date(0, 0, 0, 0, minutes);
    return date.toLocaleString('en-US', { timeStyle: 'short' });
}

function updateTimeDisplay() {
    timeFilter = Number(timeSlider.value);
    if (timeFilter === -1) {
        selectedTime.textContent = '';
        anyTimeLabel.style.display = 'block';
    } else {
        selectedTime.textContent = formatTime(timeFilter);
        anyTimeLabel.style.display = 'none';
    }
    updateScatterPlot(timeFilter);
}

// Main map loading and data handling
map.on('load', async () => {

    // Add bike lanes
    map.addSource('boston_route', {
        type: 'geojson',
        data: 'https://bostonopendata-boston.opendata.arcgis.com/datasets/boston::existing-bike-network-2022.geojson',
    });
    map.addLayer({ id: 'boston-bike-lanes', type: 'line', source: 'boston_route', paint: bikeLaneStyle });

    map.addSource('cambridge_route', {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/cambridgegis/cambridgegis_data/main/Recreation/Bike_Facilities/RECREATION_BikeFacilities.geojson',
    });
    map.addLayer({ id: 'cambridge-bike-lanes', type: 'line', source: 'cambridge_route', paint: bikeLaneStyle });

    try {
        // Load station and trip data
        const jsonData = await d3.json('https://dsc106.com/labs/lab07/data/bluebikes-stations.json');
        let stations = jsonData.data.stations;

        const trips = await d3.csv(
            'https://dsc106.com/labs/lab07/data/bluebikes-traffic-2024-03.csv',
            d => ({ ...d, started_at: new Date(d.started_at), ended_at: new Date(d.ended_at) })
        );

        // Compute traffic counts
        stations = computeStationTraffic(stations, trips);

        // Radius scale
        const radiusScale = d3.scaleSqrt().domain([0, d3.max(stations, d => d.totalTraffic)]).range([0, 25]);

        // Append circles
        let circles = svg.selectAll('circle')
            .data(stations, d => d.short_name)
            .enter()
            .append('circle')
            .attr('cx', d => getCoords(d).cx)
            .attr('cy', d => getCoords(d).cy)
            .attr('r', d => radiusScale(d.totalTraffic))
            .attr('fill', 'steelblue')
            .attr('stroke', 'white')
            .attr('stroke-width', 1)
            .attr('opacity', 0.8)
            .append('title')
            .text(d => `${d.totalTraffic} trips (${d.departures} departures, ${d.arrivals} arrivals)`);

        // Update positions on map interactions
        function updatePositions() {
            circles.attr('cx', d => getCoords(d).cx)
                   .attr('cy', d => getCoords(d).cy);
        }
        ['move', 'zoom', 'resize', 'moveend'].forEach(ev => map.on(ev, updatePositions));
        updatePositions();

        // Update scatter plot when time filter changes
        function updateScatterPlot(timeFilter) {
            const filteredTrips = filterTripsbyTime(trips, timeFilter);
            const filteredStations = computeStationTraffic(stations.map(s => ({ ...s })), filteredTrips);
            timeFilter === -1 ? radiusScale.range([0, 25]) : radiusScale.range([3, 50]);

            circles = circles
                .data(filteredStations, d => d.short_name)
                .join('circle')
                .attr('r', d => radiusScale(d.totalTraffic))
                .attr('cx', d => getCoords(d).cx)
                .attr('cy', d => getCoords(d).cy);
        }

        // Slider listener
        timeSlider.addEventListener('input', updateTimeDisplay);
        updateTimeDisplay();

    } catch (error) {
        console.error('Error loading data:', error);
    }
});
