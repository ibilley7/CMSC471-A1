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

// Color scale for different crime types
const colorScale = d3.scaleOrdinal() .range(d3.quantize(d3.interpolateRainbow, 33));

// Tooltip group inside SVG
const tooltipGroup = d3.select('#vis')
    .append("div")
    .style("position","absolute")
    .style("background","white")
    .style("border","1px solid #ccc")
    .style("padding","6px")
    .style("border-radius","4px")
    .style("font-size","12px")
    .style("opacity",0);


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
            dataCounts = getHourlyCounts(allData);
            console.log(dataCounts);
            updateAxes();
            setOptions();
            colorScale.domain(typeOptions.slice(1));
            createLegend();
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

// Line generator for smoother lines
const lineGenerator = d3.line()
    .x(d => xScale(d.hour))
    .y(d => yScale(d.count))
    .curve(d3.curveMonotoneX);

const brush = d3.brushX()
    .extent([[0,0],[width,height]])
    .on("end", brushed);

svg.append("g")
    .attr("class","brush")
    .call(brush);

// Create zoom behavior
const zoom = d3.zoom()
    .scaleExtent([1,5])
    .translateExtent([[0,0],[width,height]])
    .on("zoom", zoomed);

function zoomed(event){
    svg.attr("transform", event.transform);
}

// Apply zoom to the svg
d3.select("#vis svg").call(zoom);
    
function brushed(event){
    if(!event.selection) return;
    const [x0,x1] = event.selection;
    const startHour = Math.ceil(xScale.invert(x0));
    const endHour = Math.floor(xScale.invert(x1));
    
    svg.selectAll(".dot")
    .attr("opacity", d => d.hour >= startHour && d.hour <= endHour ? 1 : 0.2       
    );
}

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
        .domain([0, 23])
        .range([0, width]);

    const xAxis = d3.axisBottom(xScale)
        .ticks(24);

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${height})`) // Position at the bottom
        .call(xAxis);

    yScale = d3.scaleLinear()
        .domain([0, d3.max(dataCounts, d => d[yVar])])
        .nice()
        .range([height, 0]);

    const yAxis = d3.axisLeft(yScale)
        .ticks(12);

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,0)`) // Position on the left
        .call(yAxis);

    
    // X-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 20)
        .attr("text-anchor", "middle")
        .text("Hour of Day")
        .attr('class', 'labels')

    // Y-axis label (rotated)
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 40)
        .attr("text-anchor", "middle")
        .text("Number of Crimes")
        .attr('class', 'labels')
}

function updateVis(){
    // Use D3 to update the visualization based on the current selections (year and crime type)
    // This function will be called whenever the user changes a selection (e.g., from the dropdowns)
    // It should filter allData based on the current selections, then call getHourlyCounts() to get the data needed for the visualization, and finally update the SVG elements accordingly. 
    
    const lineColor = dropType === "All Crime Types" ? "black" : colorScale(dropType);

    svg.selectAll('.line')
    .data([dataCounts]) // We wrap dataCounts in an array because we want to create one line for the entire dataset
    .join(
        function(enter){
            return enter.append('path')
            .attr('class', 'line')
            .attr('fill', 'none')
            .attr('stroke', lineColor)
            .attr('stroke-width', 3)
            .attr("d", lineGenerator)
            .attr("stroke-dasharray", function() {
                return this.getTotalLength();
            })
            .attr("stroke-dashoffset", function() {
                return this.getTotalLength();
            })
            .transition()
            .duration(1200)
            .attr("stroke-dashoffset", 0);
        },
        function(update){
            return update
            .transition()
            .duration(800)
            .attr('stroke', lineColor)
                        .attr("d", lineGenerator)
            .attr("stroke-dasharray", function() {
                return this.getTotalLength();
            })
            .attr("stroke-dashoffset", function() {
                return this.getTotalLength();
            })
            .transition()
            .duration(1200)
            .attr("stroke-dashoffset", 0);
        },
        function(exit){
            return exit.remove();
        }
    )

    const maxCrime = d3.max(dataCounts, d => d.count);
    const peak = dataCounts.find(d => d.count === maxCrime);

    svg.selectAll(".annotation").remove();

    svg.append("text")
        .attr("class","annotation")
        .attr("x", xScale(peak.hour))
        .attr("y", yScale(peak.count) - 15)
        .attr("text-anchor","middle")
        .style("font-size","18px")
        .style("fill","red")
        .text("Peak");

    // Add circles for hover tooltips
    svg.selectAll(".dot")
        .data(dataCounts)
        .join(
            enter => enter.append("circle")
                .attr("class","dot")
                .attr("cx",d=>xScale(d.hour))
                .attr("cy",height)
                .attr("r",4)
                .attr("fill",lineColor)
                .transition()
                .duration(800)
                .attr("cy",d=>yScale(d.count)),

            update => update
                .transition()
                .duration(800)
                .attr("cx",d=>xScale(d.hour))
                .attr("cy",d=>yScale(d.count))
                .attr("fill",lineColor),

            exit => exit.remove()
        )

        .on("mouseover",function(event,d){
            
            d3.select(this)
                .transition()
                .attr("r",7);
            
            svg.selectAll(".line")
                .transition()
                .attr("stroke-width",5);
            tooltipGroup
                .style("opacity",1)
                .html( "Hour: "+d.hour+":00"+ "<br>Crimes: "+d.count+ "<br>Type: "+dropType+ "<br>Year: "+dropYear )
                .style("left",(event.pageX+10)+"px")
                .style("top",(event.pageY-20)+"px")

        })

        .on("mouseout",function(){
            d3.select(this)
                .transition()
                .attr("r",4);

            svg.selectAll(".line")
                .transition()
                .attr("stroke-width",2);
            tooltipGroup
                .style("opacity",0)
        })
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

function createLegend(){

    const legend = d3.select("#legend");

    legend.selectAll("*").remove();

    typeOptions.slice(1).forEach(type => {

        const item = legend.append("div")
            .attr("class","legend-item");

        item.append("div")
            .attr("class","legend-color")
            .style("background", colorScale(type));

        item.append("div")
            .text(type);

    });
}