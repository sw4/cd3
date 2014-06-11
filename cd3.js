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
            type: null,
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
            title: false,
            legend: true
        };

        // extend default parameters for all plot objects    
        defaults.xAxis = {
            scale: "linear",
            format: null,
            values: null,
            ticks: {
                rotate: 0,
                x: null,
                y: null
            }
        }


        defaults.yAxis = {
            scale: "linear",
            format: null,
            values: null,
            ticks: {
                rotate: 0,
                x: null,
                y: null
            }
        }

        // data and series can contain unknown structures, so overwrite defaults with passed objects
        defaults.data = options.data;
        defaults.series = options.series;
        if (options.type !== "pie") {
            defaults.xAxis.domain = options.xAxis.domain;
            defaults.xAxis.range = options.xAxis.range;
            defaults.yAxis.domain = options.yAxis.domain;
            defaults.yAxis.range = options.yAxis.range;
        }
        // ensure passed margin is an object
        if (options.margin) options.margin = _resolveMargins(options.margin);

        // create chart config using defaults and passed options
        config = _extend(defaults, options);

        // convert misfiring objets to arrays
        config.data = _objToArray(config.data);
        config.series = _objToArray(config.series);
        if (config.xAxis.domain) config.xAxis.domain = _objToArray(config.xAxis.domain);
        if (config.xAxis.range) config.xAxis.range = _objToArray(config.xAxis.range);
        if (config.yAxis.domain) config.yAxis.domain = _objToArray(config.yAxis.domain);
        if (config.yAxis.range) config.yAxis.range = _objToArray(config.yAxis.range);

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
            if (config.type !== "pie") {
                xAxisEl.attr("transform", "translate(0," + (config.height - config.margin.bottom - config.margin.top) + ")");
            }
            d3yAxis.ticks(Math.max(config.height / 20, 2));
            range && _resolveRange("y", range);
        }
        chartEl.attr("transform", "translate(" + config.margin.left + "," + config.margin.top + ")");
    }

    function _strToColor(str) {
        var hash = 0;
        // str += Math.floor(Math.random() * 111111); // add extra randomization
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

    function _objToArray(obj) {
        var arr = [];
        for (var i in obj) {
            arr.push(obj[i]);
        }
        return arr;
    }

    // sort data
    function _sort(data, key, dir) {
        dir = dir || "asc";
        data = data.slice();
        data.sort(function (a, b) {
            return dir == "asc" ? a[key] - b[key] : b[key] - a[key];
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
        if (value.length > 0) {
            config.data = _compileData();
            if (config.type !== "pie") {
                // data has changed so resolve domains
                _resolveDomain("x");
                _resolveDomain("y");
                // domains have changed...so redraw axes
                _drawAxis("x");
                _drawAxis("y");
            }
            // now redraw series...
            _redrawSeries();
        }
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


    function _resolveTicks(axis) {
        if (axis) axis = axis.toLowerCase();
        ticks = axis == "x" ? xAxisEl.selectAll(".tick text") : yAxisEl.selectAll(".tick text");
        if (config[axis + "Axis"].ticks.rotate > 0) {
            ticks.attr("transform", function (d) {
                return "rotate(" + config[axis + "Axis"].ticks.rotate + ")"
            });
        }
        if (config[axis + "Axis"].ticks.x) {
            ticks.attr("x", config[axis + "Axis"].ticks.x);
        }
        if (config[axis + "Axis"].ticks.y) {
            ticks.attr("y", config[axis + "Axis"].ticks.y);
        }
        if (axis == "x") {
            d3xAxis.ticks(Math.max(config.width / 130, 2));
        }
        if (axis == "y") {
            d3yAxis.ticks(Math.max(config.height / 20, 2));
        }
    }

    function _drawAxis(axis) {

        if (axis) axis = axis.toLowerCase();
        if (!axis || axis == "x") {
            xAxisEl.call(d3xAxis);
            _resolveTicks("x");
        }
        if (!axis || axis == "y") {
            yAxisEl.call(d3yAxis);
            _resolveTicks("y");
        }
    }

    function _resolveScale(axis, value) {
        var scale = axis == "x" ? d3xScale : d3yScale;
        axis = axis.toLowerCase();
        if (!value) value = config[axis + "Axis"].scale;
        if (typeof value === "string") {
            switch (value) {
                case "time":
                    scale = d3.time.scale();
                    break;
                default:
                case "linear":
                    scale = d3.scale.linear();
                    break;
                case "ordinal":
                    scale = d3.scale.ordinal();
                    break;
            }
        }
        config[axis + "Axis"].scale = value;
        axis == "x" ? d3xScale = scale : d3yScale = scale;
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
        var scale = axis == "x" ? d3xScale : d3yScale,
            domain;
        axis = axis.toLowerCase();
        // domain value being manually changed...so change config...
        if (value) config[axis + "Axis"].domain = value;
        value = value || config[axis + "Axis"].domain;

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
            if (config.type == "bar" || config.type == "column") {
                scale.rangeBands(config[axis + "Axis"].range);
            } else {
                scale.rangePoints(config[axis + "Axis"].range);
            }
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

    function _resolveFormat(axis, value) {
        axis = axis.toLowerCase();
        value = value || config[axis + "Axis"].format;
        config[axis + "Axis"].format = value;
        if (axis == "x") {
            d3xAxis.tickFormat(value);
        } else {
            d3yAxis.tickFormat(value);
        }
        _drawAxis(axis);
    }

    function _xFormat(value) {
        if (arguments.length) {
            _resolveFormat("x", value);
            return chart;
        }
        return config.xAxis.format;
    }

    function _yFormat(value) {
        if (arguments.length) {
            _resolveFormat("y", value);
            return chart;
        }
        return config.yAxis.format;
    }



    function _onAdd(series, value) {
        if (arguments.length && typeof value == "function") {
            config.series[series].onAdd = value;
        }
        return chart;
    }

    function _onChange(series, value) {
        if (arguments.length && typeof value == "function") {
            config.series[series].onChange = value;
        }
        return chart;
    }

    function _onRemove(series, value) {
        if (arguments.length && typeof series == "number" && typeof value == "function") {
            config.series[series].onRemove = value;
        }
        return chart;
    }

    function _resolveLegend(series) {
        if (config.type === "pie") {
            // data needs to be filtered to exclude zero and negative amounts
            var pieData = config.data.filter(function (r) {
                return r[config.series[series].values] > 0;
            });
            pieData = _sort(pieData, config.series[series].values, "desc");
            legendEl.select("div .series" + series).selectAll("div").remove();
            pieData.forEach(function (r) {
                legendEl.select("div .series" + series).append("div")
                    .attr("class", "pie category_" + r[config.series[series].categories] + " value_" + r[config.series[series].values] + " " + config.series[series].cssClass)
                    .style("color", _strToColor("category_" + r[config.series[series].categories] + "value_" + r[config.series[series].values]))
                    .html(r[config.series[series].categories] + ": " + r[config.series[series].values]);
            });
        }
    }

    function _drawSeries(series) {
        var serieEl = seriesEl.append("g").attr("class", "series" + series);

        // randomly generate the series colors if not already done...
        config.series[series].color = config.series[series].color || _strToColor("series" + series + config.series[series].values);

        // lines need the path drawn in advance
        if (config.type === "line" || config.type === "area") {

            var path = serieEl.append("path")
                .attr("class", "series" + series + " line " + config.series[series].values + " " + config.series[series].cssClass)
                .attr("stroke", config.series[series].color);
            _do(path, series, "onAdd");

            if (config.type == "area") {
                var area = serieEl.append("path")
                    .attr("class", "series" + series + " area " + config.series[series].values + " " + config.series[series].cssClass)
                    .attr("fill", config.series[series].color);
                _do(area, series, "onAdd");
            }


        } else if (config.type === "pie") {
            config.series[series].donut = config.series[series].donut || 0;
        }

        if (legendEl) {
            legendEl.append("div")
                .attr("class", "series" + series + " " + config.type + " " + config.series[series].values + " " + config.series[series].cssClass)
                .style("color", config.series[series].color)
                .html(series.title || "series" + series);
        }
        _redrawSeries(series);
    }

    function _redrawSeries(series) {
        var seriesList = [];
        if (typeof series == "number") {
            seriesList.push(series);
        } else {
            config.series.forEach(function (serie, index) {
                seriesList.push(index);
            });
        }
        seriesList.forEach(function (series) {
            switch (config.type) {

                case "pie":
                    // data needs to be filtered to exclude zero and negative amounts
                    var pieData = config.data.filter(function (r) {
                        return r[config.series[series].values] > 0;
                    });

                    var radius = Math.min(config.width - config.margin.left - config.margin.right, config.height - config.margin.top - config.margin.bottom) / 2;
                    seriesEl.select(".series" + series)
                        .attr("transform", "translate(" + (config.width - config.margin.left - config.margin.right) / 2 + "," + (config.height - config.margin.top - config.margin.bottom) / 2 + ")");
                    var arc = d3.svg.arc().outerRadius(radius)
                        .innerRadius(radius * (config.series[series].donut / 100));
                    var pie = d3.layout.pie().value(function (d) {
                        return d[config.series[series].values];
                    });
                    var path = seriesEl.select(".series" + series).selectAll("path");

                    //Update slice positions
                    path.data(pie(pieData))

                        .attr("fill", function (d, i) {
                        return _strToColor("category_" + d.data[config.series[series].categories] + "value_" + d.data[config.series[series].values]);
                    })
                        .transition()
                        .call(function (obj) {
                        _do(obj, series, "onChange");
                    })
                        .attr("d", arc);

                    //Add new slices
                    path.data(pie(pieData))
                        .enter()
                        .append("path")
                        .attr("class", function (d, i) {
                        return "pie category_" + d.data[config.series[series].categories] + " value_" + d.data[config.series[series].values] + " " + config.series[series].cssClass
                    })
                        .attr("fill", function (d, i) {
                        return _strToColor("category_" + d.data[config.series[series].categories] + "value_" + d.data[config.series[series].values]);
                    })
                        .transition()
                        .call(function (obj) {
                        _do(obj, series, "onChange");
                    })
                        .attr("d", arc);

                    // Remove old slices            
                    path.data(pie(pieData))
                        .exit()
                        .transition()
                        .call(function (obj) {
                        _do(obj, series, "onChange");
                    }).remove();
                    _resolveLegend(series);

                    break;
                case "area":
                case "line":
                    var line = d3.svg.line()
                        .x(function (d, i) {
                        return d3xScale(d[config.xAxis.values]);
                    })
                        .y(function (d, i) {
                        return d3yScale(d[config.series[series].values]);
                    });

                    if (config.type == "area") {
                        var area = d3.svg.area()
                            .x(function (d) {
                            return d3xScale(d[config.xAxis.values]);
                        })
                            .y0(config.height - config.margin.top - config.margin.bottom)
                            .y1(function (d) {
                            return d3yScale(d[config.series[series].values]);
                        });

                        seriesEl.select(".series" + series).select("path.area")
                            .data([config.data])
                            .transition()
                            .call(function (obj) {
                            _do(obj, series, "onChange");
                        })
                            .attr("d", area);
                    }
                    seriesEl.select(".series" + series).select("path.line")
                        .data([config.data])
                        .transition()
                        .call(function (obj) {
                        _do(obj, series, "onChange");
                    })
                        .attr("d", line);
                    break;
                case "scatter":

                    var circle = seriesEl.select(".series" + series).selectAll("circle");

                    //Update circle positions
                    circle.data(config.data)
                        .transition()
                        .call(function (obj) {
                        _do(obj, series, "onChange");
                    })
                        .attr("cx", function (d) {
                        return d3xScale(d[config.xAxis.values]);
                    })
                        .attr("cy", function (d) {
                        return d3yScale(d[config.series[series].values]);
                    }).attr("r", function(d, i){
                        if(typeof config.series[series].radius == "function"){
                            return config.series[series].radius(d,i);
                        }else if (typeof config.series[series].radius == "number"){
                            return config.series[series].radius;
                        }else{
                             return 2.5;   
                        }
                    });

                    //Add new circles
                    circle.data(config.data)
                        .enter()
                        .append("circle")
                        .attr("class", "series" + series + " line " + config.series[series].values + " " + config.series[series].cssClass)
                        .attr("fill", config.series[series].color)
                        .attr("stroke", config.series[series].color)
                        .transition()
                        .call(function (obj) {
                        _do(obj, series, "onAdd");
                    })
                        .attr("cx", function (d) {
                        return d3xScale(d[config.xAxis.values]);
                    })
                        .attr("cy", function (d) {
                        return d3yScale(d[config.series[series].values]);
                    })
                    .attr("r", function(d, i){
                        if(typeof config.series[series].radius == "function"){
                            return config.series[series].radius(d,i);
                        }else if (typeof config.series[series].radius == "number"){
                            return config.series[series].radius;
                        }else{
                             return 2.5;   
                        }
                    });

                    // Remove old circles
                    circle.data(config.data)
                        .exit()
                        .transition()
                        .call(function (obj) {
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
                        dimension = config.xAxis.type == "ordinal" ? d3xScale.rangeBand() : (config.width - config.margin.left - config.margin.right) / config.data.length;
                    } else {
                        dimension = config.yAxis.type == "ordinal" ? d3yScale.rangeBand() : (config.height - config.margin.top - config.margin.bottom) / config.data.length;
                    }
                    dimension = dimension / config.series.length;
                    dimension = dimension < 2 ? 2 : dimension;

                    function seriesOffset(i) {
                        return (i * (dimension * config.series.length) + dimension * series)
                    }

                    var rect = seriesEl.select(".series" + series).selectAll("rect");
                    //Update bars/columns positions
                    rect.data(config.data)
                        .transition()
                        .call(function (obj) {
                        _do(obj, series, "onChange");
                    })
                        .attr("y", function (d, i) {
                        return config.type == "column" ? d3yScale(d[config.series[series].values]) : seriesOffset(i) + 1;
                    })
                        .attr("x", function (d, i) {
                        return config.type == "column" ? seriesOffset(i) + 1 : 0;
                    })
                        .attr("height", function (d) {
                        return config.type == "column" ? (config.height - config.margin.top - config.margin.bottom) - d3yScale(d[config.series[series].values]) : dimension - 2;
                    })
                        .attr("width", function (d) {
                        return config.type == "column" ? dimension - 2 : d3xScale(d[config.series[series].values]);
                    });


                    //Add new bars/columns
                    rect.data(config.data)
                        .enter()
                        .append("rect")
                        .attr("class", "series" + series + " line " + config.series[series].values + " " + config.series[series].cssClass)
                        .attr("fill", config.series[series].color)
                        .transition()
                        .call(function (obj) {
                        _do(obj, series, "onAdd");
                    })
                        .attr("y", function (d, i) {
                        return config.type == "column" ? d3yScale(d[config.series[series].values]) : seriesOffset(i) + 1;
                    })
                        .attr("x", function (d, i) {

                        return config.type == "column" ? seriesOffset(i) + 1 : 0;
                    })
                        .attr("height", function (d) {
                        return config.type == "column" ? (config.height - config.margin.top - config.margin.bottom) - d3yScale(d[config.series[series].values]) : dimension - 2;
                    })
                        .attr("width", function (d) {

                        return config.type == "column" ? dimension - 2 : d3xScale(d[config.series[series].values]);
                    });

                    // Remove old bars/columns
                    rect.data(config.data)
                        .exit()
                        .transition()
                        .call(function (obj) {
                        _do(obj, series, "onRemove");
                    })
                        .remove();



                    break;
            }
        });

    }

    function _do(obj, series, event) {
        if (config.series[series][event]) {
            config.series[series][event](obj, event);
        } else {
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

    function _showSeries(value) {
        if (arguments.length && typeof value == "number" && config.series[value]) {
            _drawSeries(value);
        }
        return chart;
    }

    function _hideSeries(value) {
        if (arguments.length && typeof value == "number" && config.series[value]) {
            var obj = null;
            switch (config.type) {
                case "line":
                    var obj = seriesEl.select(".series" + value).selectAll("path");
                    break;
                case "scatter":
                    var obj = seriesEl.select(".series" + value).selectAll("circle");
                    break;
                case "bar":
                case "column":
                    var obj = seriesEl.select(".series" + value).selectAll("rect");
                    break;
            }

            obj.transition()
                .call(function (obj) {
                _do(obj, series, "onRemove");
            })
                .remove();
        }

        return chart;
    }

    function _resize() {
        _resolveSizing("auto");
        if (config.type !== "pie") {
            _drawAxis("x");
            _drawAxis("y");
        }
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
    chart.hideSeries = _hideSeries;
    chart.showSeries = _showSeries;
    chart.resize = _resize;
    chart.onAdd = _onAdd;
    chart.onChange = _onAdd;
    chart.onAdd = _onAdd;
    chart.xFormat = _xFormat;
    chart.yFormat = _yFormat;

    function _draw() {
        // create the chart elements);
        svgEl = svgEl || parentEl.append("svg");
        chartEl = chartEl || svgEl.append("g").attr("class", "chart");
        titleEl = titleEl || config.title ? svgEl.append("text").text(config.title).attr("class", "title").attr("y", config.margin.top - (config.margin.top / 2)) : null;
        legendEl = legendEl || config.legend ? parentEl.append("div").attr("class", "legend") : null;
        seriesEl = seriesEl || chartEl.append("g").attr("class", "series");
        if (config.type !== "pie") {
            axesEl = axesEl || chartEl.append("g").attr("class", "axes");
            xAxisEl = xAxisEl || axesEl.append("g").attr("class", "x axis");
            yAxisEl = yAxisEl || axesEl.append("g").attr("class", "y axis");
        }


        // format the raw data...do first so domains can be calculated correctly
        _compileData();

        // sizes all elements...also dont change ranges...as scales not setup
        _resolveSizing(false);
        if (config.type !== "pie") {
            // orient the axes
            d3xAxis.orient("bottom");
            d3yAxis.orient("left");

            _resolveFormat("x");
            _resolveFormat("y");
            // create scale, automatically propogates domain and ranges..do before sizing so scales exist.
            _resolveScale("x");
            _resolveScale("y");
        }
        config.series.forEach(function (serie, index) {
            // draw initial series....       
            _drawSeries(index);
        });

    }
    return chart;
};
