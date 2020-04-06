//  so same OtuId found in different subject ID would have the same color.
let maxOtuId = 1;

function init() {
    let selector = d3.select("#selDataset");

    d3.json("samples.json").then((data) => {
        console.log(data);
        let sampleNames = data.names;
        sampleNames.forEach((sample) => {
            selector
                .append("option")
                .text(sample)
                .property("value", sample);
        });

        //  find max otu_id across all subject ids.
        data.samples.forEach(s => {
            //  per subject max otu_id.
            let maxId = Math.max.apply(Math, s.otu_ids);
            if (maxOtuId < maxId) {
                maxOtuId = maxId;   //  all subjects' max otu_id.
            }
        })

        //  fire a "change" => default charts.
        let evt = new Event("change");
        document.getElementById("selDataset").dispatchEvent(evt);
    });
}

function optionChanged(sampleId) {
    //  this is the test subject/sample id.
    console.log(sampleId);
    d3.json("samples.json").then(data => {
        let resultArray = data.metadata.filter(m => m.id == sampleId);
        let result = resultArray[0];
        buildPanel(result);
        buildGaugeChart(result.wfreq);

        //  pick sampleId's data;
        let sampleArray = data.samples.filter(s => s.id == sampleId);
        let sample = sampleArray[0];
        buildBarChart(sample.otu_ids, sample.sample_values, sample.otu_labels);
        buildBubbleChart(sample.otu_ids, sample.sample_values, sample.otu_labels);
    });
}

function buildPanel(result) {

    let PANEL = d3.select("#sample-metadata");

    PANEL.html("");
    PANEL.append("h6").text("ID: " + result.id);
    PANEL.append("h6").text("ETHNICITY: " + result.ethnicity);
    PANEL.append("h6").text("GENDER: " + result.gender);
    PANEL.append("h6").text("AGE: " + result.age);
    PANEL.append("h6").text("LOCATION: " + result.location);
    PANEL.append("h6").text("BBTYPE: " + result.bbtype);
    PANEL.append("h6").text("WFREQ: " + result.wfreq);
}

function buildGaugeChart(wfreq) {
    //  ============================================
    //  angle in radian
    let alpha = Math.PI * wfreq / 9.0;
    alpha = Math.PI - alpha;
    if (wfreq < 0) {
        alpha = 0;
    } else if (wfreq > 9) {
        alpha = Math.PI;
    }
    console.log(Math.round(alpha * 180 / Math.PI));

    //  meter pointer.
    const radius = .5;
    let x = radius * Math.cos(alpha);
    let y = radius * Math.sin(alpha);
    //  a triange
    let mainPath = 'M -.0 -0.035 L .0 0.035 L ';
    let path = mainPath + String(x) + ' ' + String(y) + ' Z';

    //  ============================================
    const pieColors = [
        'rgba(214, 249, 207, 0.5)',
        'rgba(186, 228, 174, 0.5)',
        'rgba(156, 209, 143, 0.5)',
        'rgba(124, 191, 115, 0.5)',
        'rgba( 85, 174,  91, 0.5)',
        'rgba( 37, 157,  81, 0.5)',
        'rgba(  7, 138,  78, 0.5)',
        'rgba( 13, 117,  71, 0.5)',
        'rgba( 23,  95,  61, 0.5)',
        //        'rgba(25, 75, 49, 0.5)',
        'rgba(255, 255, 255,   0)'      //  fully transparent.
    ];

    let pieSum = 0;
    let pieVals = [],
        pieTexts = [];
    pieLabels = [];
    for (let i = 0; i < 9; i++) {
        pieVals.push(1.0);
        pieTexts.push(String(i) + "-" + String(i + 1));
        pieSum = pieSum + 1.0;
        pieLabels.push("wfreq = " + String(i + 1));
    }

    //  == 9.
    pieVals.push(pieSum);
    pieTexts.push("");
    pieLabels.push("");

    //  assemble the charts.
    let data = [
        {
            type: 'category',
            x: [0], y: [0],
            marker: { size: 28, color: '850000' },
            showlegend: false,
            name: 'wfreq = ' + String(wfreq),
            text: String(wfreq),
            hoverinfo: 'name'   //  'skip'
        },

        {
            values: pieVals,
            rotation: 90,
            direction: "clockwise",
            text: pieTexts,
            textinfo: 'text',
            textfont: {
                size: 18,
            },
            textposition: 'inside',
            marker: {
                colors: pieColors
            },
            labels: pieLabels,
            hoverinfo: 'skip',   //  'label',
            hole: .5,
            type: 'pie',
            showlegend: false
        },
        /*
                //  this is the gauge chart.
                {
                    domain: { x: [0.0, 1.0], y: [0.5, 1.0] },
                    value: wfreq,
        //            title: { text: "Speed" },
                    type: "indicator",
                    mode: "gauge",
                    gauge: {
                        axis: { range: [null, 9], visible: false },
                        steps: [
                            { range: [0, 1], color: "lightgray" },
                            { range: [1, 2], color: "gray" },
                            { range: [2, 3], color: "lightgray" },
                            { range: [3, 4], color: "gray" },
                            { range: [4, 5], color: "lightgray" },
                            { range: [5, 6], color: "gray" },
                            { range: [6, 7], color: "lightgray" },
                            { range: [7, 8], color: "gray" },
                            { range: [8, 9], color: "lightgray" }
                        ],
                    }
                }
        */
    ];

    //  layout.
    let layout = {
        shapes: [{
            type: 'path',
            path: path,
            fillcolor: '850000',
            line: {
                color: '850000'
            }
        }],
        title: { text: "<b>Belly Button Washing Frequency</b><br>Scrubs per Week" },
        height: 500,
        width: 600,
        //  added.
        margin: { t: 100, r: 25, l: 25, b: 0 },
        xaxis: {
            type: 'category',
            zeroline: false,
            showticklabels: false,
            showgrid: false,
            range: [-1, 1]
        },
        yaxis: {
            type: 'category',
            zeroline: false,
            showticklabels: false,
            showgrid: false,
            range: [-1, 1]
        }
    };

    //  plots
    Plotly.newPlot('gauge', data, layout);
}

function buildBarChart(otu_ids, sample_values, otu_labels) {

    //  zip otu_ids, sample_values and otu_labels.
    let otus = otu_ids.map((e, i) => [e, sample_values[i], otu_labels[i]]);
    //  sort based on sample_values, or otus[i][1];
    otus.sort((a, b) => parseInt(b[1]) - parseInt(a[1]));
    //  keep top 10 only.
    otus = otus.slice(0, 10);
    // Reverse the array due to Plotly's defaults
    otus = otus.reverse();

    //  bar chart
    //  Trace for the top OTU's
    let trace = {
        x: otus.map(e => e[1]),     //  sample_values
        y: otus.map(e => "OTU " + e[0]),    //  otu_ids
        text: otus.map(e => e[2]),  //  otu_labels
        name: "Top 10 OTUs",
        type: "bar",
        orientation: "h"
    };

    // Apply the group bar mode to the layout
    let layout = {
        title: { text: "<b>Top OTUs</b>" },
        xaxis: { title: "Sample Value" },
        margin: {
            l: 100,
            r: 25,
            t: 100,
            b: 100
        }
    };

    // Render the plot to the div tag with id "bar"
    Plotly.newPlot("bar", [trace], layout);
}

function buildBubbleChart(otu_ids, sample_values, otu_labels) {
    // ================================================================================
    //  map to following color scheme based on otu_id.
    const colorscale = [
        'rgb(64, 0, 75)',
        'rgb(118, 42, 131)',
        'rgb(153, 112, 171)',
        'rgb(194, 165, 207)',
        'rgb(231, 212, 232)',
        'rgb(210, 216, 219)',
        'rgb(199, 234, 229)',
        'rgb(128, 205, 193)',
        'rgb(53, 151, 143)',
        'rgb(1, 102, 94)'
    ];

    //  index to colorscale.
    let size = colorscale.length;
    let colorIds = otu_ids.map(id => Math.round((id * size) / maxOtuId));

    let trace = {
        y: sample_values,   //  sample_values
        x: otu_ids,         //  otu_ids
        text: otu_labels,   //  otu_labels
        mode: 'markers',
        marker: {
            color: colorIds.map(i => colorscale[i]),
            size: sample_values,
            sizeref: 0.05,
            sizemode: 'area'
        }
    };

    // Apply the group bar mode to the layout
    layout = {
        title: { text: "<b>OTUs Bubble Chart</b><br>(radius represents sample value)" },
        xaxis: { title: "OTU ID" },
        yaxis: { title: "Sample Value" },
        //        height: 500,
        //        width: 1000
        autosize: true
    };

    // Render the plot to the div tag with id "bubble"
    Plotly.newPlot("bubble", [trace], layout);
}

init();
