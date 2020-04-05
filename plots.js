const colorscale = [
    ['0.0', 'rgb(165,0,38)'],
    ['0.111111111111', 'rgb(215,48,39)'],
    ['0.222222222222', 'rgb(244,109,67)'],
    ['0.333333333333', 'rgb(253,174,97)'],
    ['0.444444444444', 'rgb(254,224,144)'],
    ['0.555555555556', 'rgb(224,243,248)'],
    ['0.666666666667', 'rgb(171,217,233)'],
    ['0.777777777778', 'rgb(116,173,209)'],
    ['0.888888888889', 'rgb(69,117,180)'],
    ['1.0', 'rgb(49,54,149)']
];

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
    })
}

function optionChanged(sampleId) {
    //  this is the test subject/sample id.
    console.log(sampleId);
    d3.json("samples.json").then(data => {
        buildMetadata(sampleId, data);
        buildCharts(sampleId, data);
    });
}

function buildMetadata(sampleId, data) {

    let metadata = data.metadata;
    let resultArray = metadata.filter(sampleObj => sampleObj.id == sampleId);
    let result = resultArray[0];
    let PANEL = d3.select("#sample-metadata");

    PANEL.html("");
    PANEL.append("h6").text("ID: " + result.id);
    PANEL.append("h6").text("ETHNICITY: " + result.ethnicity);
    PANEL.append("h6").text("GENDER: " + result.gender);
    PANEL.append("h6").text("AGE: " + result.age);
    PANEL.append("h6").text("LOCATION: " + result.location);
    PANEL.append("h6").text("BBTYPE: " + result.bbtype);
    PANEL.append("h6").text("WFREQ: " + result.wfreq);

    buildGaugeChart(result.wfreq);
}

function buildGaugeChart(wfreq) {
    //  ============================================
    //  angle in radian
    let alpha = Math.PI * wfreq / 9.;
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
        'rgba( 14, 127,   0, .5)', 'rgba( 14, 127,  0, .5)',
        'rgba(110, 154,  22, .5)', 'rgba(110, 154, 22, .5)',
        'rgba(170, 202,  42, .5)', 'rgba(170, 202, 42, .5)',
        'rgba(202, 209,  95, .5)', 'rgba(202, 209, 95, .5)',
        'rgba(210, 206, 145, .5)',
        'rgba(255, 255, 255,  0)'       //  fully transparent.
    ];

    let pieSum = 0;
    let pieVals = [],
        pieTexts = [];
    pieLabels = [];
    for (let i = 0; i < 9; i++) {
        pieVals.push(1);
        pieTexts.push(String(i) + "-" + String(i + 1));
        pieSum = pieSum + 1;
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
            name: 'wfreq = ',
            text: String(wfreq),
            hoverinfo: 'name + text'
        },
        {
            values: pieVals,
            rotation: 90,
            direction: "clockwise",
            text: pieTexts,
            textinfo: 'text',
            textposition: 'inside',
            marker: {
                colors: pieColors
            },
            labels: pieLabels,
            hoverinfo: 'label',
            hole: .5,
            type: 'pie',
            showlegend: false
        }
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

function buildCharts(sampleId, data) {

    //  pick sampleId's data;
    let sample = data.samples.filter(s => s.id == sampleId);
    //  get the all three array's
    let otu_ids = sample[0].otu_ids;
    let sample_values = sample[0].sample_values;
    let otu_labels = sample[0].otu_labels;
    //  zip otu_ids, sample_values and otu_labels.
    let otus = otu_ids.map((e, i) => [e, sample_values[i], otu_labels[i]]);
    //  sort based on sample_values, or otus[i][1];
    otus.sort((a, b) => parseInt(b[1]) - parseInt(a[1]));
    //  keep top 10 only.
    otus = otus.slice(0, 10);
    // Reverse the array due to Plotly's defaults
    otus = otus.reverse();

    console.log(otus);

    //  bar chart
    //  Trace1 for the top OTU's
    let trace1 = {
        x: otus.map(e => e[1]),     //  sample_values
        y: otus.map(e => "OTU " + e[0]),    //  otu_ids
        text: otus.map(e => e[2]),  //  otu_labels
        name: "Top 10 OTUs of " + sampleId,
        type: "bar",
        orientation: "h"
    };

    // Apply the group bar mode to the layout
    let layout = {
        title: { text: "<b>Top OTUs</b>" },
        xaxis: { title: "Sample Value" },
        margin: {
            l: 25,
            r: 25,
            t: 100,
            b: 100
        }
    };

    // Render the plot to the div tag with id "bar"
    Plotly.newPlot("bar", [trace1], layout);

    // ================================================================================
    //  map to following color scheme based on otu_id.
    let max = Math.max.apply(Math, otu_ids);
    let colors = otu_ids.map(id => Math.round((id * 9) / max));
    colors = colors.map(i => colorscale[i][1]);
    console.log(colors);

    trace1 = {
        y: sample_values,   //  sample_values
        x: otu_ids,         //  otu_ids
        mode: 'markers',
        marker: {
            color: colors,
            size: sample_values
        }
    };

    // Apply the group bar mode to the layout
    layout = {
        title: { text: "<b>OTUs Bubble Chart</b><br>(radius represents sample value)" },
        xaxis: { title: "OTU ID" },
        yaxis: { title: "Sample Value", }
        //        height: 600,
        //        width: 600
    };

    // Render the plot to the div tag with id "bubble"
    Plotly.newPlot("bubble", [trace1], layout);

};

init();
