var cd3 = {
    list: [],    
    stringToColor: function(str) {
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
    },    
    updateDomain: function (cd3_object, axis, domain) {

        var scope = this,
            scale = axis === "x" ? cd3_object.cd3.d3xScale : cd3_object.cd3.d3yScale;

        //domain can be directly passed, read from the config, or interpreted automatically
        if (!domain && cd3_object.cd3[axis].scale && cd3_object.cd3[axis].scale.domain) {
            // no domain passed, one defined in initial chart config...so use that
            domain = cd3_object.cd3[axis].scale.domain;
        } else if (!domain && cd3_object.cd3[axis].scale && cd3_object.cd3[axis].scale.type == "ordinal") {
            // no domain passed or defined in initial chart config...if scale is ordinal..define categories
            domain = cd3_object.cd3.data.map(function (d) {
                return d[cd3_object.cd3[axis].source];
            })
        } else if (!domain) {
            // no domain passed, defined in initial chart config and scale is not ordinal..so use min/max values
            domain = d3.extent(cd3_object.cd3.resampling ? scope.resampleData(cd3_object) : cd3_object.cd3.data, function (d) {
                return d[cd3_object.cd3[axis].source];
            });
        }
        scale.domain(domain);
    },
    updateRange: function (cd3_object, axis, range) {
        var scale = axis === "x" ? cd3_object.cd3.d3xScale : cd3_object.cd3.d3yScale;
        //range can be directly passed, read from the config, or interpreted automatically
        if (!range && cd3_object.cd3[axis].scale && cd3_object.cd3[axis].scale.range) {
            // no range passed, one defined in initial chart config...so use that
            scale.range(cd3_object.cd3[axis].scale.range);
        } else if (!range && cd3_object.cd3[axis].scale && cd3_object.cd3[axis].scale.type == "ordinal") {
            // no range passed or defined in initial chart config...if scale is ordinal..range bands (column) or points (scatter)
            if (cd3_object.cd3.series.length > 0 && cd3_object.cd3.series[0].type == "column") {
                scale.rangeBands([0, cd3_object.cd3.width]);
            } else if (cd3_object.cd3.series.length > 0 && cd3_object.cd3.series[0].type == "bar") {
                scale.rangeBands([0, cd3_object.cd3.height]);
            } else {
                scale.rangePoints([0, cd3_object.cd3.width]);
            }
        } else if (!range) {
            // no range passed, defined in initial chart config and scale is not ordinal..so use min/max values
            scale.range(axis === "x" ? [0, cd3_object.cd3.width] : [cd3_object.cd3.height, 0]);
        }
    },
    updateTicks: function (cd3_object) {

        function orientTicks(axis) {
            var rotate = cd3_object.cd3[axis].axis && cd3_object.cd3[axis].axis.ticks && cd3_object.cd3[axis].axis.ticks.rotate || 0,
                top = cd3_object.cd3[axis].axis && cd3_object.cd3[axis].axis.ticks && cd3_object.cd3[axis].axis.ticks.top || null,
                ticks = axis == "x" ? cd3_object.cd3.d3graphXAxis.selectAll(".tick text") : cd3_object.cd3.d3graphYAxis.selectAll(".tick text");
            ticks.attr("transform", function (d) {
                return "rotate(" + rotate + ")"
            });
            top && ticks.attr("dy", top);
        }

        cd3_object.cd3.d3yAxis.ticks(Math.max(cd3_object.cd3.height / 20, 2));
        orientTicks("x");
        cd3_object.cd3.d3xAxis.ticks(Math.max(cd3_object.cd3.width / 130, 2));
        orientTicks("y");
    },
    refactorData: function (cd3_object, data) {
        data = data || cd3_object.cd3.data;
        if (cd3_object.cd3.x.scale.type == 'time') {
            data = data.slice();
            data.sort(function (a, b) {
                return a.time - b.time;
            });
        }
        return data;
    },
    resampleData: function (cd3_object) {
        dataPerPixel = cd3_object.cd3.data.length / cd3_object.cd3.width;
        return cd3_object.cd3.data.filter(function (d, i) {
            return i % Math.ceil(dataPerPixel) == 0;
        });
    },
    bisectData: function (cd3_object, xPoint) {
        var bisect = d3.bisector(function (data) {
            return data[cd3_object.cd3.x.source];
        }).right;
        return bisect(cd3_object.cd3.data, xPoint);
    },
    updateScale: function (cd3_object) {


        cd3_object.cd3.d3graphXAxis.attr("class", "x axis")
            .attr("transform", "translate(0," + cd3_object.cd3.height + ")")
            .call(cd3_object.cd3.d3xAxis);

        cd3_object.cd3.d3graphYAxis.attr("class", "y axis")
            .call(cd3_object.cd3.d3yAxis);


    },
    updateSizing: function (cd3_object) {

    },
    updateDimensions: function (cd3_object) {
        cd3_object.cd3.width = parseInt(cd3_object.style("width"));
        cd3_object.cd3.height = parseInt(cd3_object.style("height"));
        // redefine widths based on margins
        if (typeof cd3_object.cd3.margin !== "object") {
            cd3_object.cd3.margin = {
                top: cd3_object.cd3.margin,
                left: cd3_object.cd3.margin,
                right: cd3_object.cd3.margin,
                bottom: cd3_object.cd3.margin
            };
        }
        cd3_object.cd3.width = cd3_object.cd3.width - cd3_object.cd3.margin.left - cd3_object.cd3.margin.right;
        cd3_object.cd3.height = cd3_object.cd3.height - cd3_object.cd3.margin.top - cd3_object.cd3.margin.bottom;

        cd3_object.cd3.tips && cd3_object.cd3.d3TipOverlay && cd3_object.cd3.d3TipOverlay.attr("width", cd3_object.cd3.width).attr("height", cd3_object.cd3.height);

        cd3_object.cd3.d3parentSvg.attr("width", cd3_object.cd3.width + cd3_object.cd3.margin.left + cd3_object.cd3.margin.right)
            .attr("height", cd3_object.cd3.height + cd3_object.cd3.margin.top + cd3_object.cd3.margin.bottom);

        cd3_object.cd3.d3graphSvg.attr("width", cd3_object.cd3.width)
            .attr("height", cd3_object.cd3.height)
            .attr("transform", "translate(" + cd3_object.cd3.margin.left + "," + cd3_object.cd3.margin.top + ")");

        cd3_object.cd3.d3graphTitle && cd3_object.cd3.d3graphTitle.attr("x", (cd3_object.cd3.width / 2))
            .attr("y", (cd3_object.cd3.margin.top / 2)).attr("class", "title");
    },
    tips: function (cd3_object) {
        var scope = this,
            tips = [];

        // create tooltip markers
        var tipsGroup = cd3_object.cd3.d3graphSvg.append("g").attr("class", "tips");
        cd3_object.cd3.series.forEach(function (serie) {
            serie.d3Tip = tipsGroup.append('circle').attr("display", "none").attr('r', 4.5).attr("class", "tip " + serie.cssClass);
            tips.push(serie.d3Tip);
        });

        // create tooltip overlay

        cd3_object.cd3.d3TipOverlay = cd3_object.cd3.d3graphSvg.append("rect").attr("class", "overlay").attr("width", cd3_object.cd3.width).attr("height", cd3_object.cd3.height)
            .on("mouseover", function () {
            cd3_object.cd3.d3TipInfo = d3.select("body").append("div").attr("class", "cd3 tips");

            cd3_object.cd3.data && cd3_object.cd3.data.length > 1 && tips.forEach(function (tip) {
                tip.style("display", "block");
            });
            cd3_object.cd3.d3TipInfo.style("display", "block");
        }).on("mouseout", function () {
            cd3_object.cd3.data && cd3_object.cd3.data.length > 1 && tips.forEach(function (tip) {
                tip.style("display", "none");
            });
            cd3_object.cd3.d3TipInfo.style("display", "none");
        }).on("mousemove", function () {

            var mouse = d3.mouse(this);
            if (!cd3_object.cd3.data || cd3_object.cd3.data.length < 1) {
                return false;
            }

            var xPoint = cd3_object.cd3.d3xScale.invert(mouse[0]),
                xPointIndex = scope.bisectData(cd3_object, xPoint),
                startDatum = cd3_object.cd3.data[xPointIndex - 1],
                endDatum = cd3_object.cd3.data[xPointIndex];

            if (!startDatum || !endDatum) {
                return false;
            }

            var xRange = endDatum[cd3_object.cd3.x.source] - startDatum[cd3_object.cd3.x.source],
                tipInfo = (cd3_object.cd3.x.title ? cd3_object.cd3.x.title : cd3_object.cd3.x.source) + ":" + (cd3_object.cd3.x.scale.format ? cd3_object.cd3.x.scale.format(cd3_object.cd3.d3xScale.invert(mouse[0])) : cd3_object.cd3.d3xScale.invert(mouse[0]));

            cd3_object.cd3.series.forEach(function (serie) {
                var interpolateValue = d3.interpolateNumber(startDatum[serie.source], endDatum[serie.source]),
                    interpolatedValue = interpolateValue((xPoint - startDatum[cd3_object.cd3.x.source]) / xRange);
                serie.d3Tip.attr('cx', mouse[0])
                    .attr('cy', cd3_object.cd3.d3yScale(interpolatedValue));

                tipInfo += " <span class='" + serie.cssClass + " " + serie.source + "'>" + (serie.title ? serie.title : serie.source) + ":" + interpolatedValue.toFixed(2) + "</span>";

            });

            var drawWidth = parseInt(cd3_object.style("width"));
            cd3_object.cd3.d3TipInfo.style("top", mouse[1] + cd3_object.cd3.margin.top + 10 + "px");
            if (mouse[0] > (drawWidth / 2)) {
                cd3_object.cd3.d3TipInfo.style("right", drawWidth - mouse[0] - cd3_object.cd3.margin.right + 10 + "px").style("left", "auto");
            } else {
                cd3_object.cd3.d3TipInfo.style("left", mouse[0] + cd3_object.cd3.margin.right + 20 + "px").style("right", "auto");
            }
            cd3_object.cd3.d3TipInfo.html(tipInfo);
        });
    },
    buildPlot: function (cd3_object) {
        var scope = this;
        var axes = cd3_object.cd3.d3graphSvg.append("g").attr("class", "axes");

        // redefine and sort data if timescale being used
        scope.refactorData(cd3_object);


        cd3_object.cd3.d3graphXAxis = axes.append("g");
        cd3_object.cd3.d3graphYAxis = axes.append("g");

        // define d3 objects for x & y axis
        cd3_object.cd3.d3xScale = {},
        cd3_object.cd3.d3yScale = {},
        cd3_object.cd3.d3xAxis = d3.svg.axis(),
        cd3_object.cd3.d3yAxis = d3.svg.axis();


        // build d3 x axis scale
        switch (cd3_object.cd3.x.scale.type) {
            case "time":
                cd3_object.cd3.d3xScale = d3.time.scale();
                if (!cd3_object.cd3.x.scale.format) {
                    cd3_object.cd3.x.scale.format = "%I:%M:%S";
                }
                break;
            default:
            case "linear":
                cd3_object.cd3.d3xScale = d3.scale.linear();
                break;
            case "ordinal":
                cd3_object.cd3.d3xScale = d3.scale.ordinal();
                break;
        }

        scope.updateDomain(cd3_object, "x");
        scope.updateRange(cd3_object, "x");

        cd3_object.cd3.d3xAxis.orient(cd3_object.cd3.x.axis && cd3_object.cd3.x.axis.orient || "bottom");

        // build d3 x axis
        cd3_object.cd3.d3xAxis.scale(cd3_object.cd3.d3xScale);
        // tick format must be done last
        cd3_object.cd3.x.scale.format && cd3_object.cd3.d3xAxis.tickFormat(d3.time.format(cd3_object.cd3.x.scale.format));

        // build d3 y axis scale    
        switch (cd3_object.cd3.y.scale.type) {
            case "time":
                cd3_object.cd3.d3yScale = d3.time.scale();
                if (!cd3_object.cd3.y.scale.format) {
                    cd3_object.cd3.y.scale.format = "%I:%M:%S";
                }
                cd3_object.cd3.d3yScale.tickFormat(d3.time.format(cd3_object.cd3.y.scale.format));
                break;
            default:
            case "linear":
                cd3_object.cd3.d3yScale = d3.scale.linear();
                break;
            case "ordinal":
                cd3_object.cd3.d3yScale = d3.scale.ordinal();
                break;
        }


        scope.updateDomain(cd3_object, "y");
        scope.updateRange(cd3_object, "y");
        // build d3 y axis
        cd3_object.cd3.d3yAxis.orient(cd3_object.cd3.y.axis && cd3_object.cd3.y.axis.orient || "left");

        cd3_object.cd3.d3yAxis.scale(cd3_object.cd3.d3yScale);


        scope.updateScale(cd3_object);

        cd3_object.cd3.series.forEach(function (serie, index) {


            var series = cd3_object.selectAll(".series").append("g")
                .attr("class", "series" + (index + 1) + " " + serie.type + " " + serie.source + " " + serie.cssClass);
            // paths need to be added in advance
            if (serie.type == "line") {
                series
                    .append("path")
                    .attr("stroke", serie.color);
            }
            cd3_object.cd3.d3graphLegend.html(cd3_object.cd3.d3graphLegend.html() + "<span class='series" + index + " " + serie.source + " " + serie.cssClass + "'>" + (serie.title || "series" + index) + "</span>");
        });

        scope.updateTicks(cd3_object);
    },
    buildPie: function (cd3_object) {

        cd3_object.cd3.d3graphSvg.select("g .series")
            .append("g")
            .attr("class", "series0 pie " + cd3_object.cd3.series[0].source + " " + cd3_object.cd3.series[0].cssClass);

    },
    chart: function (config) {

        //define scope
        var scope = this;
        // define cd3 object
        var cd3_object = d3.select(config.selector);
        // apply passed configuration to object as cd3 property
        cd3_object.cd3 = config;

        // firstly set any defaults on the passed config... if missing

        // set up any missing animation properties
        if (!cd3_object.cd3.animate || !cd3_object.cd3.animate.ease) {
            cd3_object.cd3.animate.ease = "linear";
        }
        if (!cd3_object.cd3.animate || cd3_object.cd3.animate.duration === null) {
            cd3_object.cd3.animate.duration = 200;
        }
        // set resampling
        if (cd3_object.cd3.resampling === null) {
            cd3_object.cd3.resampling = true;
        }

        cd3_object.cd3.series.forEach(function(serie, index){
            if(!serie.color){serie.color=scope.stringToColor("series"+(index+1));}
        });
        
        
        cd3_object.cd3.d3parentSvg = cd3_object.attr("class", "cd3").append("svg");
        cd3_object.cd3.d3graphSvg = cd3_object.cd3.d3parentSvg.append("g").attr("class", "chart").attr("position", "relative");

        cd3_object.cd3.d3graphTitle = cd3_object.cd3.title ? cd3_object.cd3.d3parentSvg.append("text").text(cd3_object.cd3.title) : null;
        cd3_object.cd3.d3graphLegend = cd3_object.append("div").attr("class", "legend");
        cd3_object.cd3.d3graphSvg.append("g").attr("class", "series");
        if (cd3_object.cd3.tips) {
            scope.tips(cd3_object);
        }
        scope.updateDimensions(cd3_object);
        cd3_object.cd3.series[0].type == "pie" ? scope.buildPie(cd3_object) : scope.buildPlot(cd3_object);

        scope.list.push(cd3_object);
        scope.redrawData(cd3_object);
        return cd3_object;
    },
    update: function (cd3_object, data) {
        var scope = this;
        cd3_object.cd3.data = data;
        scope.redrawData(cd3_object);
    },
    redrawData: function (cd3_object) {
        var scope = this;
        if (cd3_object.cd3.series[0].type == "pie") {

            var series = cd3_object.select("g.series g.pie");
            var radius = Math.min(cd3_object.cd3.width, cd3_object.cd3.height) / 2;

       //     var color = d3.scale.category20c();
            
            cd3_object.cd3.d3graphSvg.select("g .series .pie")
                .attr("transform", "translate(" + (cd3_object.cd3.width - cd3_object.cd3.margin.left) / 2 + "," + cd3_object.cd3.height / 2 + ")");

            var arc = d3.svg.arc().outerRadius(radius);

            var pie = d3.layout.pie().value(function (d) {
                return d[cd3_object.cd3.series[0].source];
            });
            
            var slice = series.selectAll("path.slice");
            
            //Update slice positions
            slice.data(pie(cd3_object.cd3.resampling ? scope.resampleData(cd3_object) : cd3_object.cd3.data))
                .transition()
                .duration(cd3_object.cd3.animate.duration)
                .ease(cd3_object.cd3.animate.ease)
                .attr("d", arc);            

            //Add new slices
            slice.data(pie(cd3_object.cd3.resampling ? scope.resampleData(cd3_object) : cd3_object.cd3.data))
            .enter()
            .append("svg:path")
            .attr("fill", function (d, i) {
                return scope.stringToColor("category" + i);
            })
            .attr("d", arc)
            .each(function(d) { this._current = d; })
            .attr("class", function (d, i) {
                return "slice category" + i + " " + d.data[cd3_object.cd3.series[0].category];
            }); 
            // Remove old slices            
            slice.data(pie(cd3_object.cd3.resampling ? scope.resampleData(cd3_object) : cd3_object.cd3.data))
            .exit().remove();  
        } else {
            // update the domains (value ranges) for the axis

            scope.updateDomain(cd3_object, "x");
            scope.updateDomain(cd3_object, "y");


            // loop through each series and redraw
            cd3_object.cd3.series.forEach(function (serie, index) {

                var series = cd3_object.select("g." + serie.type + "." + serie.source);

                switch (serie.type) {
                    default:
                    case "line":

                        var line = d3.svg.line()
                            .x(function (d, i) {
                            return cd3_object.cd3.d3xScale(d[cd3_object.cd3.x.source]);
                        })
                            .y(function (d, i) {
                            return cd3_object.cd3.d3yScale(d[serie.source]);
                        });

                        //Update path positions
                        var path = series.selectAll("path")
                            .data(cd3_object.cd3.resampling ? scope.resampleData(cd3_object) : [cd3_object.cd3.data])
                            .transition()
                            .duration(cd3_object.cd3.animate.duration)
                            .ease(cd3_object.cd3.animate.ease)
                            .attr("d", line);

                        break;
                    case "bar":
                    case "column":

                        // define dimensions (height for bar, width for column)
                        var dimension = 0;
                        // give dimensio value depending on nautre of chart and scale
                        if (serie.type == "column") {
                            dimension = cd3_object.cd3.x.scale.type == "ordinal" ? cd3_object.cd3.d3xScale.rangeBand() : cd3_object.cd3.width / data.length;
                        } else {
                            dimension = cd3_object.cd3.y.scale.type == "ordinal" ? cd3_object.cd3.d3yScale.rangeBand() : cd3_object.cd3.height / data.length;
                        }
                        dimension = dimension < 2 ? 2 : dimension;
                        var rect = series.selectAll("rect");
                        //Update bars/columns positions
                        rect.data(cd3_object.cd3.resampling ? scope.resampleData(cd3_object) : cd3_object.cd3.data)
                            .transition()
                            .duration(cd3_object.cd3.animate.duration)
                            .ease(cd3_object.cd3.animate.ease)
                            .attr("y", function (d, i) {
                            return serie.type == "column" ? cd3_object.cd3.d3yScale(d[serie.source]) : (i * dimension) + 1;
                        })
                            .attr("x", function (d, i) {
                            return serie.type == "column" ? (i * dimension) + 1 : 0;
                        })
                            .attr("height", function (d) {
                            return serie.type == "column" ? cd3_object.cd3.height - cd3_object.cd3.d3yScale(d[serie.source]) : dimension - 2;
                        })
                            .attr("width", function (d) {
                            return serie.type == "column" ? dimension - 2 : cd3_object.cd3.width - cd3_object.cd3.d3xScale(d[serie.source]);
                        });


                        //Add new bars/columns
                        rect.data(cd3_object.cd3.resampling ? scope.resampleData(cd3_object) : cd3_object.cd3.data)
                            .enter()
                            .append("rect")
                            .attr("fill", serie.color)
                            .attr("y", function (d, i) {
                            return serie.type == "column" ? cd3_object.cd3.d3yScale(d[serie.source]) : (i * dimension) + 1;
                        })
                            .attr("x", function (d, i) {
                            return serie.type == "column" ? (i * dimension) + 1 : 0;
                        })
                            .attr("height", function (d) {
                            return serie.type == "column" ? cd3_object.cd3.height - cd3_object.cd3.d3yScale(d[serie.source]) : dimension - 2;
                        })
                            .attr("width", function (d) {
                            return serie.type == "column" ? dimension - 2 : cd3_object.cd3.width - cd3_object.cd3.d3xScale(d[serie.source]);
                        });

                        // Remove old bars/columns
                        rect.data(cd3_object.cd3.resampling ? scope.resampleData(cd3_object) : cd3_object.cd3.data)
                            .exit().remove();

                        break;
                    case "scatter":

                        var circle = series.selectAll("circle");

                        //Update circle positions
                        circle.data(cd3_object.cd3.resampling ? scope.resampleData(cd3_object) : cd3_object.cd3.data)
                            .transition()
                            .duration(cd3_object.cd3.animate.duration)
                            .ease(cd3_object.cd3.animate.ease)
                            .attr("cx", function (d) {
                            return cd3_object.cd3.d3xScale(d[cd3_object.cd3.x.source]);
                        })
                            .attr("cy", function (d) {
                            return cd3_object.cd3.d3yScale(d[serie.source]);
                        });

                        //Add new circles
                        circle.data(cd3_object.cd3.resampling ? scope.resampleData(cd3_object) : cd3_object.cd3.data)
                            .enter()
                            .append("circle")
                            .attr("fill", serie.color)
                            .attr("stroke", serie.color)
                            .attr("cx", function (d) {
                            return cd3_object.cd3.d3xScale(d[cd3_object.cd3.x.source]);
                        })
                            .attr("cy", function (d) {
                            return cd3_object.cd3.d3yScale(d[serie.source]);
                        })
                            .attr("r", 2.5);

                        // Remove old circles
                        circle.data(cd3_object.cd3.resampling ? scope.resampleData(cd3_object) : cd3_object.cd3.data)
                            .exit().remove();

                        break;

                }

            });
            // redraw the axes..
            cd3_object.cd3.d3graphYAxis.transition()
                .duration(cd3_object.cd3.animate.duration)
                .ease(cd3_object.cd3.animate.ease)
                .call(cd3_object.cd3.d3yAxis);

            cd3_object.cd3.d3graphXAxis.transition()
                .duration(cd3_object.cd3.animate.duration)
                .ease(cd3_object.cd3.animate.ease)
                .call(cd3_object.cd3.d3xAxis);

            scope.updateTicks(cd3_object);
        }
    },
    resize: function () {
        var scope = cd3;
        scope.list.forEach(function (cd3_object) {
            if (!cd3_object.cd3.resizable) {
                return false;
            }
            scope.updateDimensions(cd3_object);
            if (cd3_object.cd3.series[0].type == "pie") {

            } else {

                scope.updateRange(cd3_object, "x");
                scope.updateRange(cd3_object, "y");
                scope.updateScale(cd3_object);
            }
            scope.update(cd3_object, cd3_object.cd3.data);
        });
    }
}
d3.select(window).on('resize', cd3.resize);