const margin = {top: 50, bottom: 200, right: 50, left: 130}
const width = 900 - margin.left - margin.right;
const svg_width = 1800 - margin.left - margin.right;
const height = 900 - margin.top - margin.bottom;
const transform_down = 200
const hover_in_fade = 100
const hover_out_fade = 1000
const labels = ["blues", "classical", "country", "disco", "hiphop", "jazz", "metal", "pop", "reggae", "rock"]
const colorScale = d3.scaleOrdinal(d3.schemeDark2);
const f = d3.format(".2f");


const svg = d3.select("#main-chart")
.append("svg")
.attr("width", svg_width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)

var tooltip = d3.select('body').append("div")
.attr("class", "tooltip")
.style("position", "absolute")
.style("opacity", 0);

const data = d3.csv("data/features_30_sec.csv").then(function(d){
    var possibleGenres = ["all", "blues", "classical", "country", "disco", "hiphop", "jazz", "metal", "pop", "reggae", "rock"]

    d3.select("#genre-selection-button")
        .selectAll('genres')
        .data(possibleGenres)
        .enter()
    	.append('option')
        .text(function (d) { return d; })
        .attr("value", function (d) { return d; })

    //Calling first time so data loads on startup
    updateData("all")

    function updateData(selectedGroup) {
        d3.select("svg").selectAll("circle").remove();
        data_to_use = d;

        if (selectedGroup !== "all") {
            data_to_use = d.filter(function(d) {
              return d.label === selectedGroup;
            });
          }

        svg.selectAll("circle")
            .data(data_to_use)
            .enter()
            .append("circle")
            .attr("transform", `translate(${margin.left}, ${transform_down})`)
            .attr("cx", function(d) {return f(Number(d.chroma_stft_mean)*width);})
            .attr("cy", function(d) {return height-150-(Number(d.rms_mean)*height);})
            .attr("r", function(d) {return 3;})
            .attr("fill", d => colorScale(d.label))
            .attr("color", d => colorScale(d.label))
            .on("mouseover", function(d) {
                tooltip.transition()
                    .duration(hover_in_fade)
                    .style("opacity", 1);
                tooltip.html(
                    "Genre: " + String(d.label) + "<br/>" + 
                    "Chroma STFT Mean: " + f(Number(d.chroma_stft_mean)) + "<br/>" + 
                    "RMS: " + f(Number(d.rms_mean)) + "<br/>"
                );
                d3.select(this)
                    .attr("r", 15);
            })
            .on("mousemove", function(d) {
                tooltip.style("left", `${(Number(d.chroma_stft_mean)*width)+margin.left/2}px`)
                tooltip.style("top", `${height-(Number(d.rms_mean)*height)-100}px`)
            })
            .on("mouseout", function(event, d) {
                tooltip.transition()
                    .duration(hover_out_fade)
                    .style("opacity", 0);
                d3.select(this)
                    .attr("r", 3);
            })
            .on("click", function(d) {
                d3.select("svg").selectAll("image").remove();
                var audio_filename = d.filename
                var label = d.label
                var spectrogram_filename= audio_filename.replace(/\./g, "").replace('wav', '.png')
                var spectrogram_filepath = `data/images_original/${d.label}/${spectrogram_filename}`;

                    imageElement = d3.select("svg").append("image")
                    .attr("xlink:href", `${spectrogram_filepath}`)
                    .attr("width", 500)
                    .attr("height", 700)
                    .attr("x", 1080)
            })
    }

    d3.select("#genre-selection-button").on("change", function(d) {
    var selected_genre = d3.select(this).property("value")
    updateData(selected_genre)
})
});



// x-axis
x = d3.scaleLinear().range([0, width]);
svg.append("g")
    .attr("transform", `translate(${margin.left},${height+margin.top})`)
    .call(d3.axisBottom(x))

svg.append("text")
    .attr("text-anchor", "middle")
    .text("Chroma STFT Mean")
    .attr("x", (width / 2) + margin.left)
    .attr("y", height + margin.bottom-100)

// y-axis
y = d3.scaleLinear().range([height, 0]);
svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`)
    .call(d3.axisLeft(y))

svg.append("text")
    .attr("text-anchor", "middle")
    .text("RMS Mean")
    .attr("x", margin.left/2)
    .attr("y", height/2);


// legend boxes, labels, and titles
svg.selectAll("legend-rect")
  .data(labels)
  .enter()
  .append("rect")
    .attr("x", 780)
    .attr("y", function(d,i){ return 200 + i*(30)})
    .attr("width", 20)
    .attr("height", 20)
    .style("fill", function(d){ return colorScale(d)})

svg.selectAll("legend-labels")
    .data(labels)
    .enter()
    .append("text")
        .attr("x", 805)
        .attr("y", function(d,i){ return 215 + i*(30)})
        .text(function(d){ return d})


svg.append("text")
    .attr("text-anchor", "middle")
    .text("Legend")
    .attr("x", 815)
    .attr("y", 180)
    .attr("font-weight", "bold")


// filter data by genre selector title
svg.append("text")
    .attr("text-anchor", "middle")
    .text("Filter Data By Genre")
    .attr("x", 815)
    .attr("y", 50)
    .attr("font-weight", "bold")


// Spectrogram Title
svg.append("text")
    .attr("text-anchor", "middle")
    .text("Spectrogram for Sample")
    .attr("x", 1330)
    .attr("y", 175)
    .attr("font-weight", "bold")

// Spectrogram horizontal axis and label
svg.append("g")
    .attr("transform", `translate(1141,541)`)
    .call(d3.axisBottom(d3.scaleLinear().domain([0, 30]).range([0, 390])))

svg.append("text")
    .attr("text-anchor", "middle")
    .text("Time (s)")
    .attr("x", 1330)
    .attr("y", 580)
    .attr("font-weight", "bold")

// Spectrogram vertical axis and label
svg.append("g")
    .attr("transform", `translate(1075,225)`)
    .call(d3.axisLeft(d3.scaleLinear().domain([11025, 0]).range([0, 250])))

svg.append("text")
    .attr("text-anchor", "middle")
    .text("Hz")
    .attr("x", 1020)
    .attr("y", 355)
    .attr("font-weight", "bold")

// Spectrogram border
svg.append("rect")
      .attr("x", 1130)
      .attr("y", 220)
      .attr("width", 410)
      .attr("height", 270)
      .attr("fill", "none")
      .attr("stroke", "black");

// Spectrogram instruction
svg.append("text")
    .text("Click on a datapoint to view its spectrogram")
    .attr("x", 1185)
    .attr("y", 350)
    .attr("font-weight", "bold")

// Spectrogram note
x_spectrogram_note = 1150
var spectrogram_note = svg.append("text")
    .text("- Note that spectrograms have 3 dimensions.")
    .attr("x", `${x_spectrogram_note}`)
    .attr("y", 650)
    .attr("font-weight", "bold")

    var spectrogram_note = svg.append("text")
    .text("- Time (x-axis), Frequency (y-axis), and Volume (brightness)")
    .attr("x", `${x_spectrogram_note}`)
    .attr("y", 670)
    .attr("font-weight", "bold")