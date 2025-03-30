// Script to fetch authoritative data from APIs
const fs = require('fs');
const https = require('https');
const path = require('path');

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Function to fetch data from URL
function fetchData(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      let data = '';
      
      // Handle HTTP errors
      if (response.statusCode < 200 || response.statusCode >= 300) {
        return reject(new Error(`Status Code: ${response.statusCode}`));
      }
      
      // Collect data chunks
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      // Process complete response
      response.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          resolve(parsedData);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// URLs for authoritative data sources
const woodCountyParksUrl = 'https://wcohgis.woodcountyohio.gov/arcgis/rest/services/Hosted/Parks_Wood_County/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson';
const lucasMetroparksUrl = 'https://services1.arcgis.com/SvdVZfVAhlYe04Tl/arcgis/rest/services/ParkBoundaries/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson';
const odnrLandsUrl = 'https://gis.ohiodnr.gov/arcgis/rest/services/OIT_Services/ODNR_ODNR_Lands_External/MapServer/0/query?outFields=*&where=1%3D1&f=geojson';

// County boundaries from Census Bureau
const countyBoundariesUrl = 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Counties/FeatureServer/0/query?where=STATE_NAME%3D%27Ohio%27%20AND%20(NAME%3D%27Wood%27%20OR%20NAME%3D%27Lucas%27%20OR%20NAME%3D%27Ottawa%27)&outFields=*&f=geojson';

// Fetch and save all data
async function fetchAllData() {
  try {
    console.log('Fetching Wood County Parks data...');
    const woodCountyData = await fetchData(woodCountyParksUrl);
    fs.writeFileSync(path.join(dataDir, 'wood_county_parks.geojson'), JSON.stringify(woodCountyData, null, 2));
    console.log('Wood County Parks data saved.');
    
    console.log('Fetching Lucas County Metroparks data...');
    const lucasMetroparksData = await fetchData(lucasMetroparksUrl);
    fs.writeFileSync(path.join(dataDir, 'lucas_metroparks.geojson'), JSON.stringify(lucasMetroparksData, null, 2));
    console.log('Lucas County Metroparks data saved.');
    
    console.log('Fetching ODNR Lands data...');
    const odnrLandsData = await fetchData(odnrLandsUrl);
    fs.writeFileSync(path.join(dataDir, 'odnr_lands.geojson'), JSON.stringify(odnrLandsData, null, 2));
    console.log('ODNR Lands data saved.');
    
    console.log('Fetching County Boundaries data...');
    const countyBoundariesData = await fetchData(countyBoundariesUrl);
    fs.writeFileSync(path.join(dataDir, 'counties.geojson'), JSON.stringify(countyBoundariesData, null, 2));
    console.log('County Boundaries data saved.');
    
    console.log('All data fetched and saved successfully!');
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Run the fetch operation
fetchAllData();
