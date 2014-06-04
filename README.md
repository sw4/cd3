cd3
===

Reusable charting library for d3.js

Supported Chart Types
---
1. [Line (demo: linear, time)](http://jsfiddle.net/75UEt/44/)
2. [Column](http://jsfiddle.net/75UEt/35/)
3. [Bar](http://jsfiddle.net/75UEt/39/)
4. [Scatter (demo: linear, time)](http://jsfiddle.net/75UEt/40/)
5. [Scatter (demo: ordinal)](http://jsfiddle.net/75UEt/37/)
6. [Pie](http://jsfiddle.net/75UEt/36/)
7. [Mixed (demo: line, scatter - linear, time)](http://jsfiddle.net/75UEt/42/)

Features
---

1. Simple reusable charting, leveraging d3
2. Automatic time series support
3. Automatic animated chart rescaling on container resize & data update
4. Exposes underlying d3 structure for more complex manipulation

Requirements
---
d3.js (tested for 3.0.4), cd3 javscript and CSS.


Methods
===

`cd3.chart(options)`

Create a new cd3 chart, returns cd3 chart object (cd3chart)

`cd3.update(cd3chart, data)`

Update an existing cd3 chart object (cd3chart) with a new dataset


Configuration
====

```
cd3.chart({
    selector: "#chart", // required (string), can be any kind of valid 'd3.select' selector
    title: "My Chart", // optional (string), title text to be added to the chart (appears top center)
    resizable: true, // optional (bool), false by default, causes chart to fluidly resize on container resize
    tips:false, // optional (bool) display tooltips on hover !!! CURRENTLY BUGGED FOR NON LINE CHARTS 
    resample: false, // optional (bool), defaults to true, prevents number of datapoints exceeding visible pixel number, for better performance
    legend: true, // optional (bool), show a legend (defaults to top right, cn be changed in CSS)
    animate: { // optional (object), configures proeprties for all chart animations (resize, new data)
        ease: "linear", // optional string), defaults to linear, can be any d3 animation easing type
        duration: 200, // optional (int), milliseconds, defaults to 500
    },
    data: data, // required (object array), series data
    margin: 50, // optional (int/object) either a number or an object of top/left/bottom/right
    x: { // required for plots (not pie/donut charts) (object)
        scale: { // optional
            type: "time", // optional (string), defaults to linear
            format: "%I:%M:%S", // optional (string), determines format of tick marks
            domain: null, // optional (array), defaults to min/max of given source field in [data]
            range: null // optional  (array), defaults to [0, width] where width is parent container (chart.selector) height
        },
        axis: { // optional (object)
            orient: null // optional (string) can be any d3 axis orient string.
            ticks:{ // optional (object)
                rotate: 0, // optional (integer) degrees to rotate tick text by
                top: .71em // optional (integer/string) offset from top of tick text to tick line
            }
        },
        source: "time" // required (string) specifies key in data to be used for axis
    },
    y: { // required for plots (not pie/donut charts) (object)
        scale: { // optional
            type: null, // optional (string), defaults to linear
            domain: [0, 20], // optional (array), defaults to min/max of given source field in [data]
            range: null // optional (array), defaults to [height, 0] where height is parent container (chart.selector) height
        },
        axis: { // optional
            orient: null, // optional (string) can be any d3 axis orient string
            ticks:{ // optional (object)
                rotate: 0, // optional (integer) degrees to rotate tick text by
                top: .71em // optional (integer/string) offset from top of tick text to tick line
            }
        },
        source: "value1" // required (string) only if y->scale->domain not specified,  specifies key in data to be used for axis
    },
    series: [{ //required (object)
        type: "line", //required (string) can be either "line", "column", "bar", "pie" or "scatter"
        title: "First Series", //optional (string), defaults to series*index*, e.g. 'series0'
        source: "value1", //required (string), key to use for series in data
        category: "category1", // required if 'type=pie' (string), key to use for categories in data
        cssClass: "myFirstSeries" // optional (string), CSS class to give line, defaults to series source,
        color: "red", // (string) color to be used for the series, can be any svg format (HEX, shorthand, RGB etc), overridden by cssClass
        title: "series title" // (string) text to refer to the series by in legend/tooltips
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

The `cd3` class is applied to the top level container the chart is applied to. Series/category colors are randomly generated at runtime by default, but can be defined either in the initial configuration or your CSS.


**Legend**

Legend container:

(div)`.legend`

Each series is represented in the legend container by a `span` containing the series title. Each `span` is given the following classes by default:

`series[n]`
Where `[n]` is the index of the series (based at 1)

`[source]`
Where `[source]` is the `source` attribute of the series in the chart config

`[cssClass]`
Where `[cssClass]` is the `cssClass` attribute of the series in the chart config if present


**Title**

(text)`.title`

The title can be styled using svg attributes such as `stroke`, `fill` etc

**Axes**

(g)`.axis`

Top level axes selector, axes can be styled using svg attributes

(g)`.[x/y].axis`

Where `[[x/y]]` is the axis (x or y) you wish to style. Can be styled using svg attributes

(g)`.tick`

Style axis ticks, contains both the tick line (`.tick line`) and tick text (`.tick text`). Can be styled using svg attributes


**Series (line, bar, column, scatter)**

Each series is given the following classes by default:

`series[n]`
Where `[n]` is the index of the series (based at zero)

`[type]`
Where `[type]` is the `type` attribute of the series in the chart config (line, pie, bar etc)

`[source]`
Where `[source]` is the `source` attribute of the series in the chart config

`[cssClass]`
Where `[cssClass]` is the `cssClass` attribute of the series in the chart config if present

As such, you can target series by type, data source or order.

**Categories (pie)**

Each category (slice) is given the following classes by default:

`series0`

`pie`

`[source]`
Where `[source]` is the `source` attribute of the series in the chart config

`[cssClass]`
Where `[cssClass]` is the `cssClass` attribute of the series in the chart config if present

`category[n]`
Where `[n]` is the index of the category (based at zero)


Sample Linear (time) Dataset
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
