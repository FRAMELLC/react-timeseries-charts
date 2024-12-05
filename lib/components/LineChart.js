"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _underscore = _interopRequireDefault(require("underscore"));
var _d3Shape = require("d3-shape");
var _merge = _interopRequireDefault(require("merge"));
var _react = _interopRequireDefault(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _pondjs = require("pondjs");
var _styler = require("../js/styler");
var _util = require("../js/util");
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
    strokeWidth: 2
  },
  muted: {
    stroke: "steelblue",
    fill: "none",
    opacity: 0.4,
    strokeWidth: 1
  }
};

/**
 * The `<LineChart>` component is able to display multiple columns of a TimeSeries
 * as separate line charts.
 *
 * The `<LineChart>` should be used within `<ChartContainer>` etc., as this will
 * construct the horizontal and vertical axis, and manage other elements.
 *
 * Here is an example of two columns of a TimeSeries being plotted with the `<LineChart>`:
 *
 * ```
  <ChartContainer timeRange={this.state.timerange} >
    <ChartRow height="200">
      <YAxis id="y" label="Price ($)" min={0.5} max={1.5} format="$,.2f" />
      <Charts>
        <LineChart
          axis="y"
          breakLine={false}
          series={currencySeries}
          columns={["aud", "euro"]}
          style={style}
          interpolation="curveBasis" />
      </Charts>
    </ChartRow>
  </ChartContainer>
 * ```
 */
class LineChart extends _react.default.Component {
  shouldComponentUpdate(nextProps) {
    const newSeries = nextProps.series;
    const oldSeries = this.props.series;
    const width = nextProps.width;
    const timeScale = nextProps.timeScale;
    const yScale = nextProps.yScale;
    const interpolation = nextProps.interpolation;
    const highlight = nextProps.highlight;
    const selection = nextProps.selection;
    const columns = nextProps.columns;

    // What changed?
    const widthChanged = this.props.width !== width;
    const timeScaleChanged = (0, _util.scaleAsString)(this.props.timeScale) !== (0, _util.scaleAsString)(timeScale);
    const yAxisScaleChanged = this.props.yScale !== yScale;
    const interpolationChanged = this.props.interpolation !== interpolation;
    const highlightChanged = this.props.highlight !== highlight;
    const selectionChanged = this.props.selection !== selection;
    const columnsChanged = this.props.columns !== columns;
    let seriesChanged = false;
    if (oldSeries.size() !== newSeries.size()) {
      seriesChanged = true;
    } else {
      seriesChanged = !_pondjs.TimeSeries.is(oldSeries, newSeries);
    }
    return widthChanged || seriesChanged || timeScaleChanged || yAxisScaleChanged || interpolationChanged || highlightChanged || selectionChanged || columnsChanged;
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
  providedPathStyleMap(column) {
    let style = {};
    if (this.props.style) {
      if (this.props.style instanceof _styler.Styler) {
        style = this.props.style.lineChartStyle()[column];
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
  pathStyle(column) {
    let style;
    const styleMap = this.providedPathStyleMap(column);
    const isHighlighted = this.props.highlight && column === this.props.highlight;
    const isSelected = this.props.selection && column === this.props.selection;
    if (this.props.selection) {
      if (isSelected) {
        style = (0, _merge.default)(true, defaultStyle.selected, styleMap.selected ? styleMap.selected : {});
      } else if (isHighlighted) {
        style = (0, _merge.default)(true, defaultStyle.highlighted, styleMap.highlighted ? styleMap.highlighted : {});
      } else {
        style = (0, _merge.default)(true, defaultStyle.muted, styleMap.muted ? styleMap.muted : {});
      }
    } else if (isHighlighted) {
      style = (0, _merge.default)(true, defaultStyle.highlighted, styleMap.highlighted ? styleMap.highlighted : {});
    } else {
      style = (0, _merge.default)(true, defaultStyle.normal, styleMap.normal);
    }
    style.pointerEvents = "none";
    return style;
  }
  renderPath(data, column, key) {
    const hitStyle = {
      stroke: "white",
      fill: "none",
      opacity: 0.0,
      strokeWidth: 7,
      cursor: "crosshair",
      pointerEvents: "stroke"
    };

    // D3 generates each path
    const path = (0, _d3Shape.line)().curve(_curve.default[this.props.interpolation]).x(d => this.props.timeScale(d.x)).y(d => this.props.yScale(d.y))(data);
    return /*#__PURE__*/_react.default.createElement("g", {
      key: key
    }, /*#__PURE__*/_react.default.createElement("path", {
      d: path,
      style: this.pathStyle(column)
    }), /*#__PURE__*/_react.default.createElement("path", {
      d: path,
      style: hitStyle,
      onClick: e => this.handleClick(e, column),
      onMouseLeave: () => this.handleHoverLeave(),
      onMouseMove: e => this.handleHover(e, column)
    }));
  }
  renderLines() {
    return _underscore.default.map(this.props.columns, column => this.renderLine(column));
  }
  renderLine(column) {
    const pathLines = [];
    let count = 1;
    if (this.props.breakLine) {
      // Remove nulls and NaNs from the line by generating a break in the line
      let currentPoints = null;
      for (const d of this.props.series.events()) {
        const timestamp = new Date(d.begin().getTime() + (d.end().getTime() - d.begin().getTime()) / 2);
        const value = d.get(column);
        const badPoint = _underscore.default.isNull(value) || _underscore.default.isNaN(value) || !_underscore.default.isFinite(value);
        if (!badPoint) {
          if (!currentPoints) currentPoints = [];
          currentPoints.push({
            x: timestamp,
            y: value
          });
        } else if (currentPoints) {
          if (currentPoints.length > 1) {
            pathLines.push(this.renderPath(currentPoints, column, count));
            count += 1;
          }
          currentPoints = null;
        }
      }
      if (currentPoints && currentPoints.length > 1) {
        pathLines.push(this.renderPath(currentPoints, column, count));
        count += 1;
      }
    } else {
      // Ignore nulls and NaNs in the line
      const cleanedPoints = [];
      for (const d of this.props.series.events()) {
        const timestamp = new Date(d.begin().getTime() + (d.end().getTime() - d.begin().getTime()) / 2);
        const value = d.get(column);
        const badPoint = _underscore.default.isNull(value) || _underscore.default.isNaN(value) || !_underscore.default.isFinite(value);
        if (!badPoint) {
          cleanedPoints.push({
            x: timestamp,
            y: value
          });
        }
      }
      pathLines.push(this.renderPath(cleanedPoints, column, count));
      count += 1;
    }
    return /*#__PURE__*/_react.default.createElement("g", {
      key: column
    }, pathLines);
  }
  render() {
    return /*#__PURE__*/_react.default.createElement("g", null, this.renderLines());
  }
}
exports.default = LineChart;
LineChart.propTypes = {
  /**
   * Show or hide this chart
   */
  visible: _propTypes.default.bool,
  /**
   * What [Pond TimeSeries](https://esnet-pondjs.appspot.com/#/timeseries) data to visualize
   */
  series: _propTypes.default.instanceOf(_pondjs.TimeSeries).isRequired,
  /**
   * Reference to the axis which provides the vertical scale for drawing.
   * e.g. specifying `axis="trafficRate"` would refer the y-scale of the YAxis
   * with id="trafficRate".
   */
  axis: _propTypes.default.string.isRequired,
  // eslint-disable-line

  /**
   * Which columns from the series to draw.
   * 
   * NOTE : Columns can't have periods because periods 
   * represent a path to deep data in the underlying events 
   * (i.e. reference into nested data structures)
   */
  columns: _propTypes.default.arrayOf(_propTypes.default.string),
  /**
   * The styles to apply to the underlying SVG lines. This is a mapping
   * of column names to objects with style attributes, in the following
   * format:
   *
   * ```
   * const style = {
   *     in: {
   *         normal: {stroke: "steelblue", fill: "none", strokeWidth: 1},
   *         highlighted: {stroke: "#5a98cb", fill: "none", strokeWidth: 1},
   *         selected: {stroke: "steelblue", fill: "none", strokeWidth: 1},
   *         muted: {stroke: "steelblue", fill: "none", opacity: 0.4, strokeWidth: 1}
   *     },
   *     out: {
   *         ...
   *     }
   * };
   *
   *  <LineChart style={style} ... />
   * ```
   *
   * Alternatively, you can pass in a `Styler`. For example:
   *
   * ```
   * const currencyStyle = Styler([
   *     {key: "aud", color: "steelblue", width: 1, dashed: true},
   *     {key: "euro", color: "#F68B24", width: 2}
   * ]);
   *
   * <LineChart columns={["aud", "euro"]} style={currencyStyle} ... />
   *
   * ```
   */
  style: _propTypes.default.oneOfType([_propTypes.default.object, _propTypes.default.func, _propTypes.default.instanceOf(_styler.Styler)]),
  /**
   * Any of D3's interpolation modes.
   */
  interpolation: _propTypes.default.oneOf(["curveBasis", "curveBasisOpen", "curveBundle", "curveCardinal", "curveCardinalOpen", "curveCatmullRom", "curveCatmullRomOpen", "curveLinear", "curveMonotoneX", "curveMonotoneY", "curveNatural", "curveRadial", "curveStep", "curveStepAfter", "curveStepBefore"]),
  /**
   * The determines how to handle bad/missing values in the supplied
   * TimeSeries. A missing value can be null or NaN. If breakLine
   * is set to true (the default) then the line will be broken on either
   * side of the bad value(s). If breakLine is false bad values
   * are simply removed and the adjoining points are connected.
   */
  breakLine: _propTypes.default.bool,
  /**
   * The selected item, which will be rendered in the "selected" style.
   * If a line is selected, all other lines will be rendered in the "muted" style.
   *
   * See also `onSelectionChange`
   */
  selection: _propTypes.default.string,
  /**
   * A callback that will be called when the selection changes. It will be called
   * with the column corresponding to the line being clicked.
   */
  onSelectionChange: _propTypes.default.func,
  /**
   * The highlighted column, which will be rendered in the "highlighted" style.
   *
   * See also `onHighlightChange`
   */
  highlight: _propTypes.default.string,
  /**
   * A callback that will be called when the hovered over line changes.
   * It will be called with the corresponding column.
   */
  onHighlightChange: _propTypes.default.func,
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
  width: _propTypes.default.number
};
LineChart.defaultProps = {
  visible: true,
  columns: ["value"],
  smooth: true,
  interpolation: "curveLinear",
  breakLine: true
};