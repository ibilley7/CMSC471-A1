// Data found in chicago_crimes.csv has columns: Date, Primary Type, Year
/* 
    How data will be visualized:
        - Line graph
            - X-axis: Hours of the day (0-23)
            - Y-axis: Number of crimes
            - Lines: Different lines for different Primary Types of crime
            Selections: 
                - Dropdown 1: Year (e.g., 2018, 2019, ..., 2026)
                - Dropdown 2: All crime types or specific crime types (e.g., Theft, Assault, etc.)

        - Heat map (IF WE NEED MORE VISUALIZATIONS)
            - X-axis: Hours of the day (0-23)
            - Y-axis: Primary Type of crime
            - Color intensity: Number of crimes of that type at that hour
            Selections:
                - Dropdown 1: Year (e.g., 2018, 2019, ..., 2026)
                - Dropdown 2: Top N crime types (e.g., top 5, top 10, etc.)
*/

const margin = { top: 80, right: 60, bottom: 60, left: 100 };
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

let allData = [];

// Initialize hourCounts to count crimes for each hour of the day (0-23)
let hourCounts = Array.from({length: 24}, (_, i) => ({
    hour: i,
    count: 0
}));

const options = ['All Crime Types', 'Theft', 'Assault', 'Battery', 'Narcotics', 'Other Offenses']; // Example crime types

// Fetch and parse the chicago_csv file
function init(){
    d3.csv("data/chicago_crimes.csv", d => ({
        Date: d.Date,
        // Extract hour from Date (assuming Date is in a format like "MM/DD/YYYY HH:MM:SS AM/PM")
        Hour: +d.Date.split(' ')[1].split(':')[0] % 12 + (d.Date.includes('PM') ? 12 : 0),
        PrimaryType: d["Primary Type"],
        Year: +d.Year
    }))
    .then(data => {
            console.log(data)
            allData = data
            //hourCounts[d.Hour].count += 1;
            //print(hourCounts);
            setUpSelector()
            updateVis()
            // placeholder for adding listerners
        })
    .catch(error => console.error('Error loading data:', error));
}

window.addEventListener('load', init);

// Create SVG
const svg = d3.select('#vis')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

function setUpSelector(){
    // Handles UI changes (sliders, dropdowns)
    // Anytime the user tweaks something, this function reacts.
}

// Function to get hourly counts of crimes for a given year and crime type
// filteredData is the subset of allData based on the user's selections (year and crime type)
function getHourlyCounts(filteredData) {

    let counts = Array.from({length:24}, (_,i)=>({hour:i,count:0}));

    filteredData.forEach(d=>{
        counts[d.hour].count++;
    });

    return counts;
}

function updateVis(){
    // Use D3 to update the visualization based on the current selections (year and crime type)
    // This function will be called whenever the user changes a selection (e.g., from the dropdowns)
    // It should filter allData based on the current selections, then call getHourlyCounts() to get the data needed for the visualization, and finally update the SVG elements accordingly. 
}
