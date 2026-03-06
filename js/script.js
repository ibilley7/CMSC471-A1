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

// Fetch and parse the chicago_csv file
function init(){
    d3.csv("data/chicago_crimes.csv", d => ({
        Date: d.Date,
        PrimaryType: d["Primary Type"],
        Year: +d.Year
    }))
    .then(data => {
            console.log(data)
            allData = data
            setUpSelector()
            // placeholder for building vis
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
