# plotly_deploy

# Challenge

This challenge is an augment to the class project "plotly_deploy", which consists a html file, a javascript file and json data file:  
- [index.html](https://github.com/pqrt12/plotly_deploy/blob/master/index.html)  
- [plots.js](https://github.com/pqrt12/plotly_deploy/blob/master/plots.js)
- [sample.json](https://github.com/pqrt12/plotly_deploy/blob/master/samples.json).

All challenge work is done in plots.js.  

A Bar chart, a Bubble chart and a Gauge / Pie chart are added. The web page is properly initialized with a manual "change" event launch. Efforts have been put in to do a true Gauge chart, but it seems impossible to get a chart like the sample chart given. After some internet search, a Pie chart is used instead, and the resulting chart closely matches the sample.

The plots.js is also re-organized. The event handler is divided into two parts: 
+ data retrieving and processing
+ plotly chart plots  

The "Bellybutton Biodiversity" web page may be viewed / played [here](https://pqrt12.github.io/plotly_deploy/). A Chrome browser is recommended.
