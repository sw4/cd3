function cd3(config) {

    var chart = {},
    parentEl = null,
        svgEl = null,
        chartEl = null,
        seriesEl = null,
        titleEl = null,
        legendEl = null,
        axesEl = null,
        xAxisEl = null,
        yAxisEl = null,
        d3xAxis = d3.svg.axis(),
        d3yAxis = d3.svg.axis(),
        d3xScale = d3.scale.linear(),
        d3yScale = d3.scale.linear();

    // recursive extension function to deep merge two or more objects, to aid in initial configuration
    function _extend(initial, update) {
        var result = {};

        function updateFunction(a, b) {
            return b;
        };
        for (prop in initial) {
            if ({}.hasOwnProperty.call(initial, prop)) {
                result[prop] = initial[prop];
                if ({}.hasOwnProperty.call(update, prop)) {
                    if (typeof initial[prop] === 'object' && typeof update[prop] === 'object') {
                        result[prop] = _extend(initial[prop], update[prop]);
                    } else {
                        result[prop] = updateFunction(initial[prop], update[prop]);
                    }
                }
            }
        }
        return result;
    }
    // configure the chart
    function _configure(options) {
        // default parameters for all charting objects
        var defaults = {
            element: {},
            resampling: true,
            fit: true,
            type:null,
            margin: {
                top: 40,
                right: 40,
                bottom: 40,
                left: 40
            },
            animation: {
                easing: "linear",
                duration: 200
            },
            autoResize: true,
            title: false,
            legend: true
        };

        // extend default parameters for all plot objects    
        defaults.xAxis = {
            scale: "linear",
            format: null,
            values: null,
            ticks: {
                xOffset: 0,
                yOffset: 0,
                rotate: 0
            }
        }


        defaults.yAxis = {
            scale: "linear",
            format: null,
            values: null,
            ticks: {
                xOffset: 0,
                yOffset: 0,
                rotate: 0
            }
        }

        // data and series can contain unknown structures, so overwrite defaults with passed objects
        defaults.data = options.data;
        defaults.series = options.series;
        defaults.xAxis.domain = options.xAxis.domain;
        defaults.xAxis.range = options.xAxis.range;
        defaults.yAxis.domain = options.yAxis.domain;
        defaults.yAxis.range = options.yAxis.range;

        // ensure passed margin is an object
        if (options.margin) options.margin = _resolveMargins(options.margin);
        
        // create chart config using defaults and passed options
        config = _extend(defaults, options);
        
        // convert misfiring objets to arrays
        config.data=_objToArray(config.data);
        config.series=_objToArray(config.series);        
        if(config.xAxis.domain)config.xAxis.domain = _objToArray(config.xAxis.domain);
        if(config.xAxis.range)config.xAxis.range = _objToArray(config.xAxis.range);
        if(config.yAxis.domain)config.yAxis.domain = _objToArray(config.yAxis.domain);
        if(config.yAxis.range)config.yAxis.range = _objToArray(config.yAxis.range);
        
        // (re)build chart as config has changed...
        _draw();
    }

    // build the chart if config being passed for the first time
    if (config) {
        parentEl = typeof config.element == "string" ? d3.select(config.element) : parentEl;
        parentEl.attr("class", "cd3").html('');
        _configure(config);
    }





    // config getter/setter
    chart.config = function (options) {
        if (!arguments.length) return config;
        // keep original element reference as config is being changed
        options.element = config.element;
        _configure(options);
        return chart;
    };

    function _resolveMargins(value) {
        // ensure passed margin is an object
        if (value && typeof value !== "object") {
            value = {
                top: value,
                right: value,
                bottom: value,
                left: value
            };
        }
        return value;
    }
    // width getter/setter
    function _margin(value) {
        if (!arguments.length) return config.margin;
        config.margin = _resolveMargins(value);
        // margins change sizing...so update..doesnt change height/width so change ranges to auto
        _resolveSizing("auto");
        // then apply the axes
        _drawAxis();
        return chart;
    };
    // dimension adjustment (any change to width or height)

    function _resolveSizing(range, dimension) {

        // automatically define height/width based on parent
        config.width = parseInt(parentEl.style("width"));
        config.height = parseInt(parentEl.style("height"));
        
        
        // size anything related to height/width...including ranges
        if (!dimension || dimension == "width") {
            //    svgEl.attr("width", config.width);
            titleEl && titleEl.attr("x", (config.width / 2) - (config.margin.left / 2));
            d3xAxis.ticks(Math.max(config.width / 130, 2));
            range && _resolveRange("x", range);
        }
        if (!dimension || dimension == "height") {
            //    svgEl.attr("height", config.height);
            xAxisEl.attr("transform", "translate(0," + (config.height - config.margin.bottom - config.margin.top) + ")");
            d3yAxis.ticks(Math.max(config.height / 20, 2));
            range && _resolveRange("y", range);
        }
        chartEl.attr("transform", "translate(" + config.margin.left + "," + config.margin.top + ")");
    }

    function _strToColor(str) {
        var hash = 0;
        str+=Math.floor(Math.random() * 111111); // add extra randomization
        for (var i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        var color = '#';
        for (var i = 0; i < 3; i++) {
            var value = (hash >> (i * 8)) & 0xFF;
            color += ('00' + value.toString(16)).substr(-2);
        }
        return color;
    }
    
    function _objToArray(obj){
        var arr = [];
        for (var i in obj) {
            arr.push(obj[i]);
        }
        return arr;
    }
    // sort data
    function _sort(data, key) {
        data = data.slice();
        data.sort(function (a, b) {
            return a[key] - b[key];
        });
        return data;
    }
    // format data correctly and sort if required
    function _compileData() {
        // if either axis is of type = time, sort the data - also compress the data into an array
        if (config.xAxis.type == 'time') {
            config.data = sort(config.data, config.xAxis.values);
        } else if (config.yAxis.type == 'time') {
            config.data = sort(config.data, config.yAxis.values);
        }
        return config.data;
    }
    // data getter/setter
    function _data(value) {
        if (!arguments.length) return config.data;
        config.data = _compileData(data);
        // data has changed so resolve domains
        _resolveDomain("x");
        _resolveDomain("y");
        // domains have changed...so redraw axes
        _drawAxis("x");
        _drawAxis("y");
        // now redraw series...
        _redrawSeries();
        return chart;
    }


    // getter only
    function _d3xAxis() {
        return d3xAxis;
    }
    // getter only
    function _d3yAxis() {
        return d3yAxis;
    }

    function _drawAxis(axis) {

        if (axis) axis = axis.toLowerCase();

        if (!axis || axis == "x") {
            xAxisEl.call(d3xAxis);
        }
        if (!axis || axis == "y") {
            yAxisEl.call(d3yAxis);
        }
    }

    function _resolveScale(axis, value) {
        var scale = axis == "x" ? d3xScale : d3yScale;
        axis = axis.toLowerCase();
        if (!value) value = config[axis + "Axis"].scale;
        if (typeof value === "string") {
            switch (value) {
                case "time":
                    scale(d3.time.scale());
                    break;
                default:
                case "linear":
                    scale(d3.scale.linear());
                    break;
                case "ordinal":
                    scale(d3.scale.ordinal());
                    break;
            }
        }
        config[axis + "Axis"].scale = value;
        // reapply range and domain
        _resolveRange(axis, config[axis + "Axis"].range);
        _resolveDomain(axis, config[axis + "Axis"].domain);
        // update the axis with the updated scale
        if (axis == "x") {
            d3xAxis.scale(d3xScale);
        } else {
            d3yAxis.scale(d3yScale);
        }
        _drawAxis(axis);
    }
    // set scale but return d3 scale object
    function _d3xScale(value) {
        if (arguments.length) {
            _resolveScale("x", value);
            return chart;
        }
        return d3xScale;
    }

    function _d3yScale(value) {
        if (arguments.length) {
            _resolveScale("y", value);
            return chart;
        }
        return d3yScale;
    }
    // set scale but return scale type
    function _xScale(value) {
        if (arguments.length) {
            _resolveScale("x", value);
            return chart;
        }
        return config.xAxis.scale;
    }

    function _yScale(value) {
        if (arguments.length) {
            _resolveScale("y", value);
            return chart;
        }
        return config.yAxis.scale;
    }

    function _resolveDomain(axis, value) {
        var scale = axis == "x" ? d3xScale : d3yScale, domain;
        axis = axis.toLowerCase();
        // domain value being manually changed...so change config...
        if(value) config[axis + "Axis"].domain = value;
        value=value || config[axis + "Axis"].domain;

        // automatically work out domain...based on scale type, set config values
        if (!value && config[axis + "Axis"].scale == "ordinal") {
            domain = config.data.map(function (d) {
                return d[config[axis + "Axis"].values];
            })
        } else if (!value) {
            domain = d3.extent(config.data, function (d) {
                return d[config[axis + "Axis"].values];
            });
        } else {
            domain = value;
        }

        scale.domain(domain);
    }

    function _xDomain(value) {
        if (arguments.length) {
            _resolveDomain("x", value);
            _drawAxis("x");
            _redrawSeries();
            return chart;
        }
        return config.xAxis.domain;
    }

    function _yDomain(value) {
        if (arguments.length) {
            _resolveDomain("y", value);
            _drawAxis("y");
            _redrawSeries();
            return chart;
        }
        return config.yAxis.domain;
    }

    function _resolveRange(axis, value) {
        var scale = axis == "x" ? d3xScale : d3yScale;
        axis = axis.toLowerCase();
        if ((!value || value == "auto") && config[axis + "Axis"].scale == "ordinal") {
            config[axis + "Axis"].range = axis === "x" ? [0, config.width - config.margin.left - config.margin.right] : [config.height - config.margin.top - config.margin.bottom, 0];
            scale.rangePoints(config[axis + "Axis"].range);
        } else if (!value || value == "auto") {
            config[axis + "Axis"].range = axis === "x" ? [0, config.width - config.margin.left - config.margin.right] : [config.height - config.margin.top - config.margin.bottom, 0];
            scale.range(config[axis + "Axis"].range);
        } else {
            config[axis + "Axis"].range = value;
            scale.range(config[axis + "Axis"].range);
        }
    }

    function _xRange(value) {
        if (arguments.length) {
            _resolveRange("x", value);
            _drawAxis("x");
            return chart;
        }
        return config.xAxis.range;
    }

    function _yRange(value) {
        if (arguments.length) {
            _resolveRange("y", value);
            _drawAxis("y");
            return chart;
        }
        return config.yAxis.range;
    }



    function _drawSeries(series) {
        var serieEl = seriesEl.append("g").attr("class", "series" + series);

        
        // randomly generate the series colors if not already done...
        config.series[series].color = config.series[series].color || _strToColor("series"+series+config.series[series].values);

        // lines need the path drawn in advance
        if(config.type==="line"){
            
            var path = serieEl.append("path")
                .attr("class", "series" + series + " line " + config.series[series].values + " " + config.series[series].cssClass)
                .attr("stroke", config.series[series].color);
            _do(path, series, "onAdd");
        }

        
        _redrawSeries(series);
    }

    function _redrawSeries(series) {        
        var seriesList=[];
        if(typeof series == "number"){
            seriesList.push(series);
        }else{
            config.series.forEach(function(serie, index){
                seriesList.push(index);
            });
        }
        seriesList.forEach(function(series){
            switch(config.type){
                case "line":
                    var line = d3.svg.line()
                        .x(function (d, i) {
                        return d3xScale(d[config.xAxis.values]);
                    })
                    .y(function (d, i) {
                        return d3yScale(d[config.series[series].values]);
                    });
                    seriesEl.select(".series" + series).select("path")
                        .data([config.data])
                        .transition()
                        .call(function(obj){
                            _do(obj, series, "onChange");
                        })
                        .attr("d", line);    
                break;
                case "scatter":
   
                    var circle = seriesEl.select(".series" + series).selectAll("circle");

                    //Update circle positions
                    circle.data(config.data)
                    .transition()
                    .call(function(obj){
                        _do(obj, series, "onChange");
                    })
                    .attr("cx", function (d) {
                        return d3xScale(d[config.xAxis.values]);
                    })
                    .attr("cy", function (d) {
                        return d3yScale(d[config.series[series].values]);
                    });
                    
                    //Add new circles
                    circle.data(config.data)
                    .enter()
                    .append("circle")
                    .attr("class", "series" + series + " line " + config.series[series].values + " " + config.series[series].cssClass)
                    .attr("fill", config.series[series].color)
                    .attr("stroke", config.series[series].color)
                    .transition()
                    .call(function(obj){
                        _do(obj, series, "onAdd");
                    })
                    .attr("cx", function (d) {
                        return d3xScale(d[config.xAxis.values]);
                    })
                    .attr("cy", function (d) {
                        return d3yScale(d[config.series[series].values]);
                    })
                    .attr("r", 2.5);                    
                    
                    // Remove old circles
                    circle.data(config.data)
                    .exit()
                    .transition()
                    .call(function(obj){
                        _do(obj, series, "onRemove");
                    })
                    .remove();                    
                    
                    
                break;

                case "bar":
                case "column":
                    
                    // define dimensions (height for bar, width for column)
                    var dimension = 0;
                    // give dimensio value depending on nautre of chart and scale
                    if (config.type == "column") {
                        dimension = config.xAxis.type == "ordinal" ? d3xScale.rangeBand() : (config.width-config.margin.left-config.margin.right) / config.data.length;
                    } else {
                        dimension = config.yAxis.type == "ordinal" ? d3yScale.rangeBand() : (config.height-config.margin.top-config.margin.bottom) / config.data.length;
                    }
                    console.log(dimension);
                    dimension = dimension < 2 ? 2 : dimension;
                    
                    var rect = seriesEl.select(".series" + series).selectAll("rect");
                    //Update bars/columns positions
                    rect.data(config.data)
                    .transition()                    
                    .call(function(obj){
                        _do(obj, series, "onChange");
                    })
                    .attr("y", function (d, i) {
                        return config.type == "column" ? d3yScale(d[config.series[series].values]) : (i * dimension) + 1;
                    })
                    .attr("x", function (d, i) {
                        return config.type == "column" ? (i * dimension) + 1 : 0;
                    })
                    .attr("height", function (d) {                        
                        return config.type == "column" ? config.height-config.margin.top-config.margin.bottom - d3yScale(d[config.series[series].values]) : dimension - 2;
                    })
                    .attr("width", function (d) {
                        return config.type == "column" ? dimension - 2 : config.width-config.margin.left-config.margin.right - d3xScale(d[config.series[series].values]);
                    });
                    
                    
                    //Add new bars/columns
                    rect.data(config.data)
                    .enter()
                    .append("rect")
                    .attr("class", "series" + series + " line " + config.series[series].values + " " + config.series[series].cssClass)
                    .attr("fill", config.series[series].color)
                    .attr("y", function (d, i) {
                        return config.type == "column" ? d3yScale(d[config.series[series].values]) : (i * dimension) + 1;
                    })
                    .attr("x", function (d, i) {
                        return config.type == "column" ? (i * dimension) + 1 : 0;
                    })
                    .attr("height", function (d) {
                        return config.type == "column" ? config.height-config.margin.top-config.margin.bottom - d3yScale(d[config.series[series].values]) : dimension - 2;
                    })
                    .attr("width", function (d) {
                        return config.type == "column" ? dimension - 2 : config.width-config.margin.left-config.margin.right - d3xScale(d[config.series[series].values]);
                    });
                    
                    // Remove old bars/columns
                    rect.data(config.data)
                    .exit().remove();

                    
                    
                break;                    
            }
        });
            
    }
    function _do(obj, series, event){        
        if(config.series[series][event]){
            config.series[series][event](obj, event);
        }else{
            obj.duration && obj.duration(config.animation.duration).ease(config.animation.easing);   
        }
    }
    function _seriesValues(series, value) {
        var isSeries = typeof series == "number" ? true : false;
        if (isSeries && !value) return config.series[series].values;
        if (isSeries && value) {
            // set SPECIFIC series to value
            config.series[series].values = value;
            _redrawSeries(series);
        }
        return chart;
    }

    function _addSeries(value) {
        if (arguments.length) {
            config.series.push(value);
            _drawSeries(config.series.length - 1);
        }
        return chart;
    }

    function _resize() {
        _resolveSizing("auto");
        _drawAxis("x");
        _drawAxis("y");
        config.series.forEach(function (serie, index) {
            // redraw line data....       
            _redrawSeries(index);
        });
    }
    chart.margin = _margin;
    chart.data = _data;
    chart.d3xAxis = _d3xAxis;
    chart.d3yAxis = _d3yAxis;
    chart.d3xScale = _d3xScale;
    chart.d3yScale = _d3yScale;
    chart.xScale = _xScale;
    chart.yScale = _yScale;
    chart.xDomain = _xDomain;
    chart.yDomain = _yDomain;
    chart.xRange = _xRange;
    chart.yRange = _yRange;
    chart.seriesValues = _seriesValues;
    chart.addSeries = _addSeries;
    chart.resize = _resize;

    function _draw() {
        // create the chart elements);
        svgEl = svgEl || parentEl.append("svg");
        chartEl = chartEl || svgEl.append("g").attr("class", "chart");
        titleEl = titleEl || config.title ? svgEl.append("text").text(config.title).attr("class", "title").attr("y", config.margin.top - (config.margin.top / 2)) : null;
        legendEl = legendEl || config.legend ? parentEl.append("div").attr("class", "legend") : null;
        seriesEl = seriesEl || chartEl.append("g").attr("class", "series");
        axesEl = axesEl || chartEl.append("g").attr("class", "axes");
        xAxisEl = xAxisEl || axesEl.append("g").attr("class", "x axis");
        yAxisEl = yAxisEl || axesEl.append("g").attr("class", "y axis");
        
        // format the raw data...do first so domains can be calculated correctly
        _compileData();

        // sizes all elements...also dont change ranges...as scales not setup
        _resolveSizing(false);

        // orient the axes
        d3xAxis.orient("bottom");
        d3yAxis.orient("left");

        // create scale, automatically propogates domain and ranges..do before sizing so scales exist.
        _resolveScale("x");
        _resolveScale("y");

        config.series.forEach(function (serie, index) {
            // draw initial series....       
            _drawSeries(index);
        });
        
        config.fit && d3.select(window).on('resize', _resize);

    }
    return chart;

};
