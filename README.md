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
            type: "time", // optional, defaults to linear
            format: "%I:%M:%S", // optional - determines format of tick marks
            domain: null, // optional, defaults to min/max of given source field in [data]
            range: null // optional, defaults to [0, width] where width is parent container (chart.selector) height
        },
        axis: { // optional
            orient: null // optional
        },
        source: "time" // required
    },
    y: { // required
        scale: { // optional
            type: null, // optional, defaults to linear
            domain: [0, 20], // optional, defaults to min/max of given source field in [data]
            range: null // optional, defaults to [height, 0] where height is parent container (chart.selector) height
        },
        axis: { // optional
            orient: null // optional
        },
        source: "value1" // required only if domain not specified
    },
    series: [{ //required
        type: "line", //required
        title: "First Series", //optional
        source: "value1", //required,
        class: "myFirstSeries" // optional CSS class to give line, defaults to series*index*, e.g. 'series0'
    }, { //required
        type: "line", //required
        title: "Second Series", //optional
        source: "value2", //required,
        class: "mySecondSeries"
    }, { //required
        type: "line", //required
        title: "Third Series", //optional
        source: "value3", //required,
        class: "myThirdSeries"
    }]
});
```
