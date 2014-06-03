var cd3 = {
    list: [],
    updateDomain: function (cd3_object, axis, domain) {
        var scope = this,
            scale = axis === "x" ? cd3_object.cd3.d3xScale : cd3_object.cd3.d3yScale;
        scale.domain(domain || cd3_object.cd3[axis].scale && cd3_object.cd3[axis].scale.domain || d3.extent(cd3_object.cd3.resampling ? scope.resampleData(cd3_object) : cd3_object.cd3.data, function (d) {
            return d[cd3_object.cd3[axis].source];
        }));
    },
    updateRange: function (cd3_object, axis, range) {
        var scale = axis === "x" ? cd3_object.cd3.d3xScale : cd3_object.cd3.d3yScale;
        scale.range(range || cd3_object.cd3[axis].scale && cd3_object.cd3[axis].scale.range || (axis === "x" ? [0, cd3_object.cd3.width] : [cd3_object.cd3.height, 0]));
    },
    updateTicks: function (cd3_object) {
        cd3_object.cd3.d3yAxis.ticks(Math.max(cd3_object.cd3.height / 20, 2));
        cd3_object.cd3.d3xAxis.ticks(Math.max(cd3_object.cd3.width / 130, 2));
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
        cd3_object.cd3.d3parentSvg.attr("width", cd3_object.cd3.width + cd3_object.cd3.margin.left + cd3_object.cd3.margin.right)
            .attr("height", cd3_object.cd3.height + cd3_object.cd3.margin.top + cd3_object.cd3.margin.bottom);

        cd3_object.cd3.d3graphSvg.attr("width", cd3_object.cd3.width)
            .attr("height", cd3_object.cd3.height)
            .attr("transform", "translate(" + cd3_object.cd3.margin.left + "," + cd3_object.cd3.margin.top + ")");

        cd3_object.cd3.d3graphXAxis.attr("class", "x axis")
            .attr("transform", "translate(0," + cd3_object.cd3.height + ")")
            .call(cd3_object.cd3.d3xAxis);

        cd3_object.cd3.d3graphYAxis.attr("class", "y axis")
            .call(cd3_object.cd3.d3yAxis);

        cd3_object.cd3.d3graphTitle && cd3_object.cd3.d3graphTitle.attr("x", (cd3_object.cd3.width / 2))
            .attr("y", (cd3_object.cd3.margin.top / 2)).attr("class", "title");
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
    },
    tips: function (cd3_object) {
        var scope = this,
            tips = [];

        // create tooltip markers
        var tipsGroup=cd3_object.cd3.d3graphSvg.append("g").attr("class", "tips");
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
                startDatum = data[xPointIndex - 1],
                endDatum = data[xPointIndex];

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
    chart: function (config) {
        //define scope
        var scope = this;
        // define cd3 object
        var cd3_object = d3.select(config.selector);
        // apply passed configuration to object as cd3 property
        cd3_object.cd3 = config;

        // firstly set any defaults on the passed config... if missing

        // redefine and sort data if timescale being used
        scope.refactorData(cd3_object);

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

        scope.updateDimensions(cd3_object);

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
        }


        scope.updateDomain(cd3_object, "y");
        scope.updateRange(cd3_object, "y");
        // build d3 y axis
        cd3_object.cd3.d3yAxis.orient(cd3_object.cd3.y.axis && cd3_object.cd3.y.axis.orient || "left");

        cd3_object.cd3.d3yAxis.scale(cd3_object.cd3.d3yScale);


        scope.updateTicks(cd3_object);


        cd3_object.cd3.d3parentSvg = cd3_object.attr("class", "cd3").append("svg");
        cd3_object.cd3.d3graphSvg = cd3_object.cd3.d3parentSvg.append("g").attr("class", "chart").attr("position", "relative");
        var axes = cd3_object.cd3.d3graphSvg.append("g").attr("class", "axes");
        cd3_object.cd3.d3graphXAxis = axes.append("g");
        cd3_object.cd3.d3graphYAxis = axes.append("g");
        cd3_object.cd3.d3graphTitle = cd3_object.cd3.title ? cd3_object.cd3.d3parentSvg.append("text").text(cd3_object.cd3.title) : null;
        cd3_object.cd3.d3graphLegend = cd3_object.append("div").attr("class", "legend");


        cd3_object.cd3.d3graphSvg.append("g").attr("class", "series");


        if (cd3_object.cd3.tips) {
            scope.tips(cd3_object);
        }



        scope.updateScale(cd3_object);

        cd3_object.cd3.series.forEach(function (serie, index) {


            var series = cd3_object.selectAll(".series").append("g")
                .attr("class", serie.type + " " + serie.source + " " + serie.cssClass);

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
                    // Create path
                    var path = series.selectAll("path")
                        .data(cd3_object.cd3.resampling ? scope.resampleData(cd3_object) : [cd3_object.cd3.data]);
                    path.enter().append("path")
                        .attr("d", line);

                    break;
                case "scatter":

                    var circle = series.selectAll("circle");

                    // Create circles
                    circle = series.selectAll("circle")
                        .data(cd3_object.cd3.resampling ? scope.resampleData(cd3_object) : cd3_object.cd3.data);
                    circle.enter().append("circle")
                        .attr("r", 2.5)
                        .attr("cx", function (d) {
                        return cd3_object.cd3.d3xScale(d[cd3_object.cd3.x.source]);
                    })
                        .attr("cy", function (d) {
                        return cd3_object.cd3.d3yScale(d[serie.source]);
                    });

                    break;

            }
            cd3_object.cd3.d3graphLegend.html(cd3_object.cd3.d3graphLegend.html() + "<span class=" + (serie.cssClass || serie.source) + ">" + (serie.title || "series" + index) + "</span>");
        });


        scope.list.push(cd3_object);
        return cd3_object;
    },
    update: function (cd3_object, data) {

        var scope = this;
        if (!data) {
            return false;
        }

        //leave current dataset in situ
        var oldData = cd3_object.cd3.data;
        // copy array
        var newData = data.slice();


        // sort data if timeseries...
        newData = scope.refactorData(cd3_object, newData);



        //  through and replace items
        var diff = newData.length - oldData.length
        var checkLength = diff < 0 ? oldData.length += diff : oldData.length;
        if (diff < 0) {
            // remove items
            diff *= -1;
            oldData.splice(oldData.length - diff, diff);
        } else if (diff > 0) {
            //  add items
            var newItems = newData.splice(newData.length - diff, diff);
            newItems.forEach(function (item) {
                oldData.push(item);
            });
        }
        for (var i = 0; i < checkLength; i++) {
            oldData[i] = newData[i];
        }
        scope.updateData(cd3_object);
    },
    updateData: function (cd3_object) {
        var scope = this;

        // update the domains (value ranges) for the axis

        scope.updateDomain(cd3_object, "x");
        scope.updateDomain(cd3_object, "y");


        // loop through each series and redraw
        cd3_object.cd3.series.forEach(function (serie) {

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

                    var path = series.selectAll("path");

                    //Update path positions

                    path.data(cd3_object.cd3.resampling ? scope.resampleData(cd3_object) : [cd3_object.cd3.data])
                        .transition()
                        .duration(cd3_object.cd3.animate.duration)
                        .ease(cd3_object.cd3.animate.ease)
                        .attr("d", line);

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
    },
    resize: function () {
        var scope = cd3;
        scope.list.forEach(function (cd3_object) {
            if (!cd3_object.cd3.resizable) {
                return false;
            }
            scope.updateDimensions(cd3_object);
            scope.updateRange(cd3_object, "x");
            scope.updateRange(cd3_object, "y");
            scope.updateScale(cd3_object);
            scope.updateTicks(cd3_object);
            scope.update(cd3_object, cd3_object.cd3.data);
        });
    }
}
d3.select(window).on('resize', cd3.resize);