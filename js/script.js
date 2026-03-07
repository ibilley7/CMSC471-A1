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
let dataCounts = [];

// xVar = hours, yVar = count of crimes

let dropType = 'All Crime Types', dropYear = 'All Years';
let targetType = '', targetYear; 

const typeOptions = ['All Crime Types'];
const yearOptions = ['All Years'];

let xVar = 'Hour', yVar = 'count';

let xScale, yScale, sizeScale;

// Initialize hourCounts to count crimes for each hour of the day (0-23)
let hourCounts = Array.from({length: 24}, (_, i) => ({
    hour: i,
    count: 0
}));


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
            dataCounts = getHourlyCounts(allData);
            console.log(dataCounts);
            updateAxes();
            setOptions();
            setUpSelector();
            updateVis();
            // placeholder for adding listeners
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

    d3.selectAll('.variable')
        // Loop over each dropdown button
        .each(function() {
            if (d3.select(this).attr('id') === 'crimeType') {
                d3.select(this).selectAll('myOptions')
                .data(typeOptions) 
                .enter()
                .append('option')
                .text(d => d) // The displayed text
                .attr('value', d => d) // The actual value in the code
            }
            else if (d3.select(this).attr('id') === 'crimeYear') {
                d3.select(this).selectAll('myOptions')
                .data(yearOptions) 
                .enter()
                .append('option')
                .text(d => d) // The displayed text
                .attr('value', d => d) // The actual value in the code
            }
        })
        .on('change', function(event){
            console.log(d3.select(this).property('id'))
            console.log(d3.select(this).property('value'))
            if(d3.select(this).property('id') === 'crimeType'){
                dropType = d3.select(this).property('value')
            }
            else if(d3.select(this).property('id') === 'crimeYear'){
                dropYear = d3.select(this).property('value')
            }
            
            filterData();
            updateAxes();
            updateVis();
        })
    d3.select('#crimeType').property('value', dropType)
    d3.select('#crimeYear').property('value', dropYear)
}

// Function to get hourly counts of crimes for a given year and crime type
// filteredData is the subset of allData based on the user's selections (year and crime type)
function getHourlyCounts(filteredData) {

    let counts = Array.from({length:24}, (_,i)=>({hour:i,count:0}));

    filteredData.forEach(d=>{
        counts[d.Hour].count++;
    });

    return counts;
}

function updateAxes(){
    svg.selectAll('.axis').remove() // Clear old axes before drawing new ones
    svg.selectAll('.labels').remove() // Clear old labels before drawing new ones

    xScale = d3.scaleLinear()
        .domain([0, d3.max(allData, d => d[xVar])])
        .range([0, width]);
    const xAxis = d3.axisBottom(xScale)
        .ticks(24);

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${height})`) // Position at the bottom
        .call(xAxis);

    yScale = d3.scaleLinear()
        .domain([0, d3.max(dataCounts, d => d[yVar])])
        .range([height, 0]);
    const yAxis = d3.axisLeft(yScale)

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,0)`) // Position on the left
        .call(yAxis);

    
    // X-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 20)
        .attr("text-anchor", "middle")
        .text(xVar) // Displays the current x-axis variable
        .attr('class', 'labels')

    // Y-axis label (rotated)
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 40)
        .attr("text-anchor", "middle")
        .text(yVar) // Displays the current y-axis variable
        .attr('class', 'labels')
    
}

function updateVis(){
    // Use D3 to update the visualization based on the current selections (year and crime type)
    // This function will be called whenever the user changes a selection (e.g., from the dropdowns)
    // It should filter allData based on the current selections, then call getHourlyCounts() to get the data needed for the visualization, and finally update the SVG elements accordingly. 
    

    svg.selectAll('.line')
    .data([dataCounts]) // We wrap dataCounts in an array because we want to create one line for the entire dataset
    .join(
        function(enter){
            return enter.append('path')
            .attr('class', 'line')
            .attr('fill', 'none')
            .attr('stroke', 'steelblue')
            .attr('stroke-width', 2)
            .attr('d', d3.line()
                .x(d => xScale(d.hour))
                .y(d => yScale(d.count))
            )
        },
        function(update){
            return update
            .attr('d', d3.line()
                .x(d => xScale(d.hour))
                .y(d => yScale(d.count))
            )
        },
        function(exit){
            return exit.remove();
        }
    )
}

function setOptions(){
    // Helper function to set dropdown options based on the data
    allData.forEach(d => {
        if (!typeOptions.includes(d.PrimaryType)) {
            typeOptions.push(d.PrimaryType);
        }
        if (!yearOptions.includes(d.Year)) {
            yearOptions.push(d.Year);
        }
    });

    console.log(typeOptions);
    console.log(yearOptions);
}

function filterData(){
    let filteredData = allData;

    if(dropType !== 'All Crime Types'){
        filteredData = filteredData.filter(d => d.PrimaryType === dropType);
    }

    if(dropYear !== 'All Years'){
        filteredData = filteredData.filter(d => d.Year === +dropYear);
    }

    dataCounts = getHourlyCounts(filteredData);
}


