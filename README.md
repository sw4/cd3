cd3
===

Reusable charting library for d3.js

[See example charts here from version 0.0.1](https://github.com/sw4/cd3/blob/0.0.1/README.md)

Since this version the entire library has been rewritten so that:

1. Code implements best bractice (closure, naming etc)
2. Charts integrate strick reusability principles
3. Charts are declarative
4. Charts are repeatable, modifiable, configurable and extensibile
5. Charts adhere to ['Towards Reusable Charts' (Mike Bostock)](http://bost.ocks.org/mike/chart/) and ['Exploring Reusability with D3.js' (Mike Pennisi)](http://bocoup.com/weblog/reusability-with-d3/)

Requirements
---
d3.js (tested for 3.0.4), cd3 javscript and CSS.

Configuration
---
```javascript
var chart = cd3({
    element:"#chart", // either id or DOM element to place chart within
    type:"line" // chart type, line, bar, column or scatter
    title: "chart", // string to use for chart title
    data: data, // JSON data
    autoResize: true, // resize chart on window/container resize
    margin: 10, // either an integer to be uniformly applied to all chart margins, or an object consisting of top, right, bottom, left values
    legend: true, // add a legend to the chart,
    animation: {
                easing: "linear", // default chart animation easing
                duration: 200 // default chart animation duration
    },
    xAxis: {
        scale: "ordinal", // scale type, e.g. ordinal, linear, time
        values: "time" // source of axis values
        range:[0,100], // axis range
        domain:[0,100], // axis domain
        format:function(d){} // function to format tick values
    },
    yAxis: {
        // same configuration as for x Axis
    },
    series: [{ // array of objects representing series to plot
        values: "values", // source of series values        
        color:"red", // series color, can be any web recognized color format
        title:"series 1", // series title
        color:"red", // series color, can be any web recognized color format
        cssClass:"seriesClass", // string, name of a css class to apply to series
    }]
});
```
Methods
---

Unless otherwise stated: setters return the chart object, getters return the current value

`chart.config(value)`

Set: Where `value` a configuration object to rebuild the chart
Get: No value passed, returns current chart configuration


`chart.margin(value)`

Set: Where `value` is either an integer to be uniformly applied to all chart margins, or an object consisting of top, right, bottom, left values
Get: No value passed, returns current margins


`chart.data(value)`

Set: Where `value` is a JSON object to update the chart data with
Get: No value passed, returns current chart data

`chart.d3xAxis()` / `chart.d3yAxis()`

Set: None available
Get: No value passed, returns d3 x or y axis object

`chart.d3xScale(value)` / `chart.d3yScale(value)`

Set: Where value is a d3 scale type to set (e.g. "linear", "time", "ordinal" etc)
Get: No value passed, returns d3 x or y scale object

`chart.xScale(value)` / `chart.yScale(value)`

Set: Where value is a d3 scale type to set (e.g. "linear", "time", "ordinal" etc)
Get: No value passed, returns x or y axis scale type

`chart.xDomain(value)` / `chart.yDomain(value)`

Set: Where value is an array representing the axis domain extent
Get: No value passed, returns x or y axis domain

`chart.xRange(value)` / `chart.yRange(value)`

Set: Where value is an array representing the axis range extent
Get: No value passed, returns x or y axis range

`chart.xFormat(value)` / `chart.yFormat(value)`

Set: Where value is a function to apply to axis tick values
Get: No value passed, returns x or y axis format

`chart.onAdd(series, value)` / `chart.onChange(series, value)` / `chart.onRemove(series, value)`

Set: Where value is a function representing a transition that occurs when a series has new chart elements added, existing elements changed, or removed. Function passed transitioning object, and event.
Get: No value passed, returns chart

`chart.addSeries(value)`

Set: Where value is an object representing a series configuration
Get: No value passed, returns chart

`chart.showSeries(value)` / `chart.hideSeries(value)`

Set: Where value is the index of a series to show/hide
Get: No value passed, returns chart

`chart.seriesValues(value)`

Set: Where value is a string representing the data source of the series
Get: No value passed, returns current series valus 

`chart.resize()`

Set: Non available - resizes chart to parent container dimensions
Get: No value passed, returns chart
