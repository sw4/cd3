cd3
===

Reusable charting library for d3.js


**Note**: Currently only configured to support line charts

**[View Live Demo](http://jsfiddle.net/75UEt/3/)**


Features
---

1. Simple reusable charting, leveraging d3
2. Automatic time series support
2. Automatic animated chart rescaling on container resize
3. Automatic animated chart rescaling on data update
4. cd3 object exposes d3 for more in depth manipulation


Methods
===

`cd3.chart(options)`

Create a new cd3 chart returns cd3 chart object (cd3chart)

`cd3.update(cd3chart, data)`

Update an existing cd3 chart object (cd3chart) with a new dataset


Configuration
====

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

The simplest configuration would be:

```
cd3.chart({
    selector: "#chart",
    data: data,
    margin: 50, 
    x: { 
        source: "time"
    },
    y: { 
        source: "value1"
    },
    series: [{ 
        type: "line",
        source: "value1", 
    }, { 
        type: "line",
        title: "Second Series",
        source: "value2",
        class: "mySecondSeries"
    }]
});
```


CSS
----

Prefix all related classes with `.cd3` or your a chart container attribute (id, class etc) to ensure speficity. The `cd3` class is applied to the top level container the chart is applied to.

`.legend`

Style legend

`.legend span`

Style legend items

`.legend .seriesClass`

Style legend item for a specific series, where seriesClass is the name of a class defined in a chart->series config

`.title`

Style title

`.axis`

Style axes

`.x.axis`

Style X axis

`.y.axis`

Style Y axis

`.[x/y].axis .tick`

Style X/Y axis ticks

`.path`

Style paths

`.line`

Style lines

`.cd3 .seriesClass`

Style a series line, where seriesClass is the name of a class defined in a chart->series config

Sample Dataset
----

```
[{
    "time": 1401446958259,
        "value1": 4,
        "value2": 4,
        "value3": 0
}, {
    "time": 1401446958560,
        "value1": 6,
        "value2": 10,
        "value3": 0
}, {
    "time": 1401446958860,
        "value1": 8,
        "value2": 13,
        "value3": 1
}, {
    "time": 1401446959160,
        "value1": 3,
        "value2": 18,
        "value3": 1
}, {
    "time": 1401446959460,
        "value1": 9,
        "value2": 10,
        "value3": 1
}, {
    "time": 1401446959761,
        "value1": 0,
        "value2": 7,
        "value3": 3
}, {
    "time": 1401446960061,
        "value1": 7,
        "value2": 17,
        "value3": 1
}, {
    "time": 1401446960361,
        "value1": 3,
        "value2": 10,
        "value3": 0
}, {
    "time": 1401446960662,
        "value1": 0,
        "value2": 16,
        "value3": 0
}, {
    "time": 1401446960962,
        "value1": 9,
        "value2": 9,
        "value3": 0
}, {
    "time": 1401446961262,
        "value1": 5,
        "value2": 4,
        "value3": 0
}, {
    "time": 1401446961562,
        "value1": 3,
        "value2": 10,
        "value3": 0
}, {
    "time": 1401446961862,
        "value1": 0,
        "value2": 17,
        "value3": 1
}, {
    "time": 1401446962162,
        "value1": 8,
        "value2": 8,
        "value3": 1
}, {
    "time": 1401446962462,
        "value1": 2,
        "value2": 19,
        "value3": 1
}, {
    "time": 1401446962762,
        "value1": 0,
        "value2": 0,
        "value3": 1
}, {
    "time": 1401446963062,
        "value1": 4,
        "value2": 11,
        "value3": 5
}, {
    "time": 1401446963762,
        "value1": 12,
        "value2": 5,
        "value3": 3
}]
```
