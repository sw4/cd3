cd3
===

Reusable charting library for d3.js


**Note**: Currently only configured to support line charts


Methods
---

`cd3.chart(options)`

Create a new cd3 chart (cd3chart)

`cd3.update(cd3chart, data)`

Update an existing cd3 chart (cd3chart) with a new dataset


Configuration
---

```
cd3.chart({
    selector: "#chart", // required (string), can be any kind of valid 'd3.select' selector
    title: "My Chart", // optional (string), title text to be added to the chart (appears top center)
    resizable: true, // optional (bool), false by default, causes chart to fluidly resize on container resize
    resample: false, // optional (bool), defaults to true, prevents number of datapoints exceeding visible pixel number, for better performance
    legend: true, // optional (bool), show a legend (defaults to top right, cn be changed in CSS)
    animate: { // optional (object), configures proeprties for all chart animations (resize, new data)
        ease: "linear", // optional string), defaults to linear, can be any d3 animation easing type
        duration: 200, // optional (int), milliseconds, defaults to 500
    },
    data: data, // required (object array), series data
    margin: 50, // optional (int/object) either a number or an object of top/left/bottom/right
    x: { // required (object)
        scale: { // optional
            type: "time", // optional (string), defaults to linear
            format: "%I:%M:%S", // optional (string), determines format of tick marks
            domain: null, // optional (array), defaults to min/max of given source field in [data]
            range: null // optional  (array), defaults to [0, width] where width is parent container (chart.selector) height
        },
        axis: { // optional (object)
            orient: null // optional (string) can be any d3 axis orient string
        },
        source: "time" // required (string) specifies key in data to be used for axis
    },
    y: { // required (object)
        scale: { // optional
            type: null, // optional (string), defaults to linear
            domain: [0, 20], // optional (array), defaults to min/max of given source field in [data]
            range: null // optional (array), defaults to [height, 0] where height is parent container (chart.selector) height
        },
        axis: { // optional
            orient: null // optional (string) can be any d3 axis orient string
        },
        },
        source: "value1" // required (string) only if y->scale->domain not specified,  specifies key in data to be used for axis
    },
    series: [{ //required (object)
        type: "line", //required (string)
        title: "First Series", //optional (string), defaults to series*index*, e.g. 'series0'
        source: "value1", //required (string), key to use for series in data
        cssClass: "myFirstSeries" // optional (string), CSS class to give line, defaults to series*index*, e.g. 'series0'
    }]
});
```
