# Northwest Ohio Green Infrastructure Network

An interactive web map application for visualizing, exploring, and analyzing green infrastructure assets across Wood, Lucas, and Ottawa Counties in Ohio.

## Overview

This application provides regional planners, environmental consultants, and the public with tools to:

- Visualize parks, trails, wetlands, ecological corridors, and conservation areas
- Search and filter infrastructure assets by name, type, county, and conservation status
- Perform spatial analysis including buffer and intersection analysis
- Export analysis results in GeoJSON format
- Access the application on both desktop and mobile devices

## Features

- **Interactive Map Interface**: Vector-based map with multiple basemap options
- **Layer Controls**: Toggle different types of green infrastructure
- **Search Functionality**: Find assets by name or description
- **Filtering Capabilities**: Filter by county, type, and conservation status
- **Detailed Information**: View comprehensive details about each asset
- **Spatial Analysis**: Buffer and intersection analysis tools
- **Export Functionality**: Download analysis results as GeoJSON
- **Mobile Responsive**: Optimized for all device sizes

## Technology Stack

- **Leaflet.js**: Open-source JavaScript library for interactive maps
- **Turf.js**: Advanced geospatial analysis in the browser
- **GeoJSON**: Standard format for representing geographic features
- **HTML5/CSS3**: Modern web standards
- **Vanilla JavaScript**: No framework dependencies for maximum compatibility

## Getting Started

### Local Development

1. Clone this repository:
   ```
   git clone https://github.com/DaveoPrice/northwest-ohio-green-infrastructure.git
   cd northwest-ohio-green-infrastructure
   ```

2. Open `index.html` in your web browser to view the application.

3. For local development with live reload, you can use any simple HTTP server:
   ```
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve
   ```

### Editing the Data

The application uses GeoJSON files located in the `data` directory:

- `counties.geojson`: County boundaries for Wood, Lucas, and Ottawa Counties
- `infrastructure.geojson`: Green infrastructure assets including parks, trails, wetlands, etc.

To add or modify infrastructure assets, edit the `infrastructure.geojson` file following the existing structure.

## Application Structure

- `index.html`: Main HTML file
- `css/`: Stylesheet files
  - `style.css`: Main stylesheet
- `js/`: JavaScript files
  - `app.js`: Main application initialization
  - `map.js`: Map initialization and controls
  - `data.js`: Data loading and processing
  - `layers.js`: Layer management
  - `search.js`: Search functionality
  - `filters.js`: Filtering capabilities
  - `analysis.js`: Spatial analysis tools
  - `config.js`: Application configuration
- `data/`: GeoJSON data files
- `img/`: Image assets
- `docs/`: Documentation files

## Contributing

Contributions to improve the application are welcome! Please feel free to submit a pull request or open an issue to discuss proposed changes.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Data sources include Ohio Department of Natural Resources, Metroparks Toledo, Wood County Park District, and other regional planning authorities
- Basemap tiles provided by OpenStreetMap contributors and Stamen Design
