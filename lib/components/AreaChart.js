"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
require("array.prototype.fill");
var _underscore = _interopRequireDefault(require("underscore"));
var _d3Shape = require("d3-shape");
var _merge = _interopRequireDefault(require("merge"));
var _react = _interopRequireDefault(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _pondjs = require("pondjs");
var _util = require("../js/util");
var _styler = require("../js/styler");
var _curve = _interopRequireDefault(require("../js/curve"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 *  Copyright (c) 2015-present, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

const defaultStyle = {
  line: {
    normal: {
      stroke: "steelblue",
      fill: "none",
      strokeWidth: 1
    },
    highlighted: {
      stroke: "#5a98cb",
      fill: "none",
      strokeWidth: 1
    },
    selected: {
      stroke: "steelblue",
      fill: "none",
      strokeWidth: 1
    },
    muted: {
      stroke: "steelblue",
      fill: "none",
      opacity: 0.4,
      strokeWidth: 1
    }
  },
  area: {
    normal: {
      fill: "steelblue",
      stroke: "none",
      opacity: 0.75
    },
    highlighted: {
      fill: "#5a98cb",
      stroke: "none",
      opacity: 0.75
    },
    selected: {
      fill: "steelblue",
      stroke: "none",
      opacity: 0.75
    },
    muted: {
      fill: "steelblue",
      stroke: "none",
      opacity: 0.25
    }
  }
};

/**
 * The `<AreaChart>` component is able to display single or multiple stacked
 * areas above or below the axis. It used throughout the
 * [My ESnet Portal](http://my.es.net).

 * The `<AreaChart>` should be used within a `<ChartContainer>` structure,
 * as this will construct the horizontal and vertical axis, and manage
 * other elements. Here is an example of an `<AreaChart>` with an up and down
 * network traffic visualization:
 *
 *  ```
 *   render() {
 *      return (
 *          ...
 *          <ChartContainer timeRange={trafficSeries.timerange()} width="1080">
 *              <ChartRow height="150">
 *                  <Charts>
 *                      <AreaChart
 *                          axis="traffic"
 *                          series={trafficSeries}
 *                          columns={{up: ["in"], down: ["out"]}}
 *                       />
 *                  </Charts>
 *                  <YAxis
 *                      id="traffic"
 *                      label="Traffic (bps)"
 *                      min={-max} max={max}
 *                      absolute={true}
 *                      width="60"
 *                      type="linear"
 *                  />
 *              </ChartRow>
 *          </ChartContainer>
 *          ...
 *      );
 *  }
 *  ```
 * The `<AreaChart>` takes a single `TimeSeries` object into its `series` prop. This
 * series can contain multiple columns and those columns can be referenced using the `columns`
 * prop. The `columns` props allows you to map columns in the series to the chart,
 * letting you specify the stacking and orientation of the data. In the above example
 * we map the "in" column in `trafficSeries` to the up direction and the "out" column to
 * the down direction. Each direction is specified as an array, so adding multiple
 * columns into a direction will stack the areas in that direction.
 *
 * Note: It is recommended that `<ChartContainer>`s be placed within a <Resizable> tag,
 * rather than hard coding the width as in the above example.
 * 
 * Note 2 : Columns can't have periods because periods represent a path to deep data 
 * in the underlying events (i.e. reference into nested data structures)
 * 
 */
class AreaChart extends _react.default.Component {
  shouldComponentUpdate(nextProps) {
    const newSeries = nextProps.series;
    const oldSeries = this.props.series;
    const width = nextProps.width;
    const timeScale = nextProps.timeScale;
    const yScale = nextProps.yScale;
    const interpolation = nextProps.interpolation;
    const columns = nextProps.columns;
    const style = nextProps.style;
    const highlight = nextProps.highlight;
    const selection = nextProps.selection;
    const widthChanged = this.props.width !== width;
    const timeScaleChanged = (0, _util.scaleAsString)(this.props.timeScale) !== (0, _util.scaleAsString)(timeScale);
    const yAxisScaleChanged = this.props.yScale !== yScale;
    const interpolationChanged = this.props.interpolation !== interpolation;
    const columnsChanged = JSON.stringify(this.props.columns) !== JSON.stringify(columns);
    const styleChanged = JSON.stringify(this.props.style) !== JSON.stringify(style);
    const highlightChanged = this.props.highlight !== highlight;
    const selectionChanged = this.props.selection !== selection;
    let seriesChanged = false;
    if (oldSeries.size() !== newSeries.size()) {
      seriesChanged = true;
    } else {
      seriesChanged = !_pondjs.TimeSeries.is(oldSeries, newSeries);
    }
    return seriesChanged || timeScaleChanged || widthChanged || interpolationChanged || columnsChanged || styleChanged || yAxisScaleChanged || highlightChanged || selectionChanged;
  }
  handleHover(e, column) {
    if (this.props.onHighlightChange) {
      this.props.onHighlightChange(column);
    }
  }
  handleHoverLeave() {
    if (this.props.onHighlightChange) {
      this.props.onHighlightChange(null);
    }
  }
  handleClick(e, column) {
    e.stopPropagation();
    if (this.props.onSelectionChange) {
      this.props.onSelectionChange(column);
    }
  }
  providedAreaStyleMap(column) {
    let style = {};
    if (this.props.style) {
      if (this.props.style instanceof _styler.Styler) {
        style = this.props.style.areaChartStyle()[column];
      } else if (_underscore.default.isFunction(this.props.style)) {
        style = this.props.style(column);
      } else if (_underscore.default.isObject(this.props.style)) {
        style = this.props.style ? this.props.style[column] : defaultStyle;
      }
    }
    return style;
  }

  /**
   * Returns the style used for drawing the path
   */
  style(column, type) {
    let style;
    const styleMap = this.providedAreaStyleMap(column);
    const isHighlighted = this.props.highlight && column === this.props.highlight;
    const isSelected = this.props.selection && column === this.props.selection;
    if (!_underscore.default.has(styleMap, "line")) {
      console.error("Provided style for AreaChart does not define a style for the outline:", styleMap, column);
    }
    if (!_underscore.default.has(styleMap, "area")) {
      console.error("Provided style for AreaChart does not define a style for the area:", styleMap);
    }
    if (this.props.selection) {
      if (isSelected) {
        style = (0, _merge.default)(true, defaultStyle[type].selected, styleMap[type].selected ? styleMap[type].selected : {});
      } else if (isHighlighted) {
        style = (0, _merge.default)(true, defaultStyle[type].highlighted, styleMap[type].highlighted ? styleMap[type].highlighted : {});
      } else {
        style = (0, _merge.default)(true, defaultStyle[type].muted, styleMap[type].muted ? styleMap[type].muted : {});
      }
    } else if (isHighlighted) {
      style = (0, _merge.default)(true, defaultStyle[type].highlighted, styleMap[type].highlighted ? styleMap[type].highlighted : {});
    } else {
      style = (0, _merge.default)(true, defaultStyle[type].normal, styleMap[type].normal ? styleMap[type].normal : {});
    }
    return style;
  }
  pathStyle(column) {
    return this.style(column, "line");
  }
  areaStyle(column) {
    return this.style(column, "area");
  }
  renderArea(data, column, key) {
    // Use D3 to build an area generation function
    const style = this.areaStyle(column);
    const pathStyle = this.pathStyle(column);
    const areaGenerator = (0, _d3Shape.area)().curve(_curve.default[this.props.interpolation]).x(d => d.x0).y0(d => d.y0).y1(d => d.y1);

    // Use the area generation function with our stacked data
    // to get an SVG path
    const areaPath = areaGenerator(data);

    // Outline the top of the curve
    const lineGenerator = (0, _d3Shape.line)().curve(_curve.default[this.props.interpolation]).x(d => d.x0).y(d => d.y1);
    const outlinePath = lineGenerator(data);
    return /*#__PURE__*/_react.default.createElement("g", {
      key: `area-${key}`
    }, /*#__PURE__*/_react.default.createElement("path", {
      d: areaPath,
      style: style
    }), /*#__PURE__*/_react.default.createElement("path", {
      d: areaPath,
      style: style,
      onClick: e => this.handleClick(e, column),
      onMouseLeave: () => this.handleHoverLeave(),
      onMouseMove: e => this.handleHover(e, column)
    }), /*#__PURE__*/_react.default.createElement("path", {
      d: outlinePath,
      style: pathStyle,
      onClick: e => this.handleClick(e, column),
      onMouseLeave: () => this.handleHoverLeave(),
      onMouseMove: e => this.handleHover(e, column)
    }));
  }
  renderPaths(columnList, direction) {
    const dir = direction === "up" ? 1 : -1;
    const size = this.props.series.size();
    const offsets = new Array(size).fill(0);
    const len = columnList.length;
    return columnList.map((column, i) => {
      // Stack the series columns to get our data in x0, y0, y1 format
      const pathAreas = [];
      let count = 1;
      if (this.props.breakArea) {
        let currentPoints = null;
        for (let j = 0; j < this.props.series.size(); j += 1) {
          const seriesPoint = this.props.series.at(j);
          let value = seriesPoint.get(column);
          const badPoint = _underscore.default.isNull(value) || _underscore.default.isNaN(value) || !_underscore.default.isFinite(value);
          if (badPoint) value = 0;

          // Case 1:
          // When stacking is present with multiple area charts, then mark bad points as 0
          if (len > 1) {
            if (!currentPoints) currentPoints = [];
            currentPoints.push({
              x0: this.props.timeScale(seriesPoint.timestamp()),
              y0: this.props.yScale(offsets[j]),
              y1: this.props.yScale(offsets[j] + dir * value)
            });
            if (this.props.stack) {
              offsets[j] += dir * value;
            }
          }
          // Case Two
          // When only one area chart is to be drawn, then create different areas for each area and ignore nulls and NaNs
          else {
            if (!badPoint) {
              if (!currentPoints) currentPoints = [];
              currentPoints.push({
                x0: this.props.timeScale(seriesPoint.timestamp()),
                y0: this.props.yScale(offsets[j]),
                y1: this.props.yScale(offsets[j] + dir * value)
              });
              if (this.props.stack) {
                offsets[j] += dir * value;
              }
            } else if (currentPoints) {
              if (currentPoints.length > 1) {
                pathAreas.push(this.renderArea(currentPoints, column, count));
                count += 1;
              }
              currentPoints = null;
            }
          }
        }
        if (currentPoints && currentPoints.length > 1) {
          pathAreas.push(this.renderArea(currentPoints, column, count));
          count += 1;
        }
      } else {
        // Ignore nulls and NaNs in the area chart
        const cleanedPoints = [];
        for (let j = 0; j < this.props.series.size(); j += 1) {
          const seriesPoint = this.props.series.at(j);
          const value = seriesPoint.get(column);
          const badPoint = _underscore.default.isNull(value) || _underscore.default.isNaN(value) || !_underscore.default.isFinite(value);
          if (!badPoint) {
            cleanedPoints.push({
              x0: this.props.timeScale(seriesPoint.timestamp()),
              y0: this.props.yScale(offsets[j]),
              y1: this.props.yScale(offsets[j] + dir * value)
            });
            if (this.props.stack) {
              offsets[j] += dir * value;
            }
          }
        }
        pathAreas.push(this.renderArea(cleanedPoints, column, count));
        count += 1;
      }
      return /*#__PURE__*/_react.default.createElement("g", {
        key: column
      }, pathAreas);
    });
  }
  renderAreas() {
    const up = this.props.columns.up || [];
    const down = this.props.columns.down || [];
    return /*#__PURE__*/_react.default.createElement("g", null, this.renderPaths(up, "up"), this.renderPaths(down, "down"));
  }
  render() {
    return /*#__PURE__*/_react.default.createElement("g", null, this.renderAreas());
  }
}
exports.default = AreaChart;
AreaChart.propTypes = {
  /**
   * What [Pond TimeSeries](https://esnet-pondjs.appspot.com/#/timeseries) data to visualize
   */
  series: _propTypes.default.instanceOf(_pondjs.TimeSeries).isRequired,
  /**
   * Reference to the axis which provides the vertical scale for ## drawing. e.g.
   * specifying axis="trafficRate" would refer the y-scale to the YAxis of id="trafficRate".
   */
  axis: _propTypes.default.string.isRequired,
  // eslint-disable-line

  /**
   * Show or hide this chart
   */
  visible: _propTypes.default.bool,
  /**
   * The series series columns mapped to stacking up and down.
   * Has the format:
   * ```
   *  "columns": {
   *      up: ["in", ...],
   *      down: ["out", ...]
   *  }
   *  ```
   * 
   * NOTE : Columns can't have periods because periods 
   * represent a path to deep data in the underlying events 
   * (i.e. reference into nested data structures)
   */
  columns: _propTypes.default.shape({
    up: _propTypes.default.arrayOf(_propTypes.default.string),
    down: _propTypes.default.arrayOf(_propTypes.default.string)
  }),
  /**
   * Stack areas on top of each other
   */
  stack: _propTypes.default.bool,
  /**
   * The styles to apply to the underlying SVG lines. This is a mapping
   * of column names to objects with style attributes, in the following
   * format:
   *
   * ```
   * const style = {
   *     in: {
   *         line: {
   *             normal: {stroke: "steelblue", fill: "none", strokeWidth: 1},
   *             highlighted: {stroke: "#5a98cb", fill: "none", strokeWidth: 1},
   *             selected: {stroke: "steelblue", fill: "none", strokeWidth: 1},
   *             muted: {stroke: "steelblue", fill: "none", opacity: 0.4, strokeWidth: 1}
   *         },
   *         area: {
   *             normal: {fill: "steelblue", stroke: "none", opacity: 0.75},
   *             highlighted: {fill: "#5a98cb", stroke: "none", opacity: 0.75},
   *             selected: {fill: "steelblue", stroke: "none", opacity: 0.75},
   *             muted: {fill: "steelblue", stroke: "none", opacity: 0.25}
   *         }
   *     },
   *     out: {
   *         ...
   *     }
   * };
   *
   * <AreaChart style={style} ... />
   * ```
   *
   * Alternatively, you can pass in a Styler. For example:
   *
   * ```
   * const upDownStyler = styler([
   *     {key: "in", color: "#C8D5B8"},
   *     {key: "out", color: "#9BB8D7"}
   * ]);
   *
   * <AreaChart columns={["in", "out"]} style={upDownStyler} ... />
   *
   * ```
   */
  style: _propTypes.default.oneOfType([_propTypes.default.object, _propTypes.default.func, _propTypes.default.instanceOf(_styler.Styler)]),
  /**
   * Any of D3's interpolation modes.
   */
  interpolation: _propTypes.default.oneOf(["curveBasis", "curveBasisOpen", "curveBundle", "curveCardinal", "curveCardinalOpen", "curveCatmullRom", "curveCatmullRomOpen", "curveLinear", "curveMonotoneX", "curveMonotoneY", "curveNatural", "curveRadial", "curveStep", "curveStepAfter", "curveStepBefore"]),
  /**
   * The currenly highlighted column
   */
  highlight: _propTypes.default.string,
  /**
   * Callback called when the highlight changes, i.e. hover event
   */
  onHighlightChange: _propTypes.default.func,
  /**
   * The currenly selected column
   */
  selection: _propTypes.default.string,
  /**
   * Callback called when the selection changes, i.e. area is clicked
   */
  onSelectionChange: _propTypes.default.func,
  /**
   * [Internal] The timeScale supplied by the surrounding ChartContainer
   */
  timeScale: _propTypes.default.func,
  /**
   * [Internal] The yScale supplied by the associated YAxis
   */
  yScale: _propTypes.default.func,
  /**
   * [Internal] The width supplied by the surrounding ChartContainer
   */
  width: _propTypes.default.number,
  /**
   * The determines how to handle bad/missing values in the supplied
   * TimeSeries. A missing value can be null or NaN. If breakArea
   * is set to true then the area chart will be broken on either side of
   * the bad value(s). If breakArea is false (the default) bad values
   * are simply removed and the adjoining points are connected.
   */
  breakArea: _propTypes.default.bool
};
AreaChart.defaultProps = {
  visible: true,
  interpolation: "curveLinear",
  columns: {
    up: ["value"],
    down: []
  },
  stack: true,
  breakArea: true
};