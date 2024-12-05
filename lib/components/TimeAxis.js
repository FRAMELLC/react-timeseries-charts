"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _underscore = _interopRequireDefault(require("underscore"));
var _merge = _interopRequireDefault(require("merge"));
var _moment = _interopRequireDefault(require("moment"));
var _react = _interopRequireDefault(require("react"));
var _reactDom = _interopRequireDefault(require("react-dom"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _d3Axis = require("d3-axis");
var _d3Selection = require("d3-selection");
var _d3Time = require("d3-time");
var _d3TimeFormat = require("d3-time-format");
require("moment-duration-format");
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

// eslint-disable-line

function scaleAsString(scale) {
  return `${scale.domain().toString()}-${scale.range().toString()}`;
}
const defaultStyle = {
  values: {
    stroke: "none",
    fill: "#8B7E7E",
    // Default value color
    fontWeight: 100,
    fontSize: 11,
    font: '"Goudy Bookletter 1911", sans-serif"'
  },
  ticks: {
    fill: "none",
    stroke: "#C0C0C0"
  },
  axis: {
    fill: "none",
    stroke: "#C0C0C0"
  }
};

/**
 * Renders a horizontal time axis. This is used internally by the ChartContainer
 * as a result of you specifying the timerange for the chart. Please see the API
 * docs for ChartContainer for more information.
 */
class TimeAxis extends _react.default.Component {
  componentDidMount() {
    const {
      scale,
      format,
      showGrid,
      gridHeight
    } = this.props;
    this.renderTimeAxis(scale, format, showGrid, gridHeight);
  }
  componentWillReceiveProps(nextProps) {
    const {
      scale,
      utc,
      format,
      showGrid,
      gridHeight
    } = nextProps;
    if (scaleAsString(this.props.scale) !== scaleAsString(scale) || this.props.utc !== utc || this.props.showGrid !== showGrid || this.props.gridHeight !== gridHeight) {
      this.renderTimeAxis(scale, format, showGrid, gridHeight);
    }
  }

  // Force the component not to update because d3 will control the
  // DOM from this point down.
  shouldComponentUpdate() {
    // eslint-disable-line
    return false;
  }
  mergeStyles(style) {
    return {
      valueStyle: (0, _merge.default)(true, defaultStyle.values, this.props.style.values ? this.props.style.values : {}),
      tickStyle: (0, _merge.default)(true, defaultStyle.ticks, this.props.style.ticks ? this.props.style.ticks : {})
    };
  }
  renderTimeAxis(scale, format, showGrid, gridHeight) {
    let axis;
    const tickSize = showGrid ? -gridHeight : 10;
    const utc = this.props.utc;
    const tickCount = this.props.tickCount;
    const style = this.mergeStyles(this.props.style);
    const {
      tickStyle,
      valueStyle
    } = style;
    if (tickCount > 0) {
      if (format === "day") {
        axis = (0, _d3Axis.axisBottom)(scale).tickArguments([utc ? _d3Time.utcDay : _d3Time.timeDay, 1, tickCount]).tickFormat((0, _d3TimeFormat.timeFormat)("%d")).tickSizeOuter(0);
      } else if (format === "month") {
        axis = (0, _d3Axis.axisBottom)(scale).tickArguments([utc ? _d3Time.utcMonth : _d3Time.timeMonth, 1, tickCount]).tickFormat((0, _d3TimeFormat.timeFormat)("%B")).tickSizeOuter(0);
      } else if (format === "year") {
        axis = (0, _d3Axis.axisBottom)(scale).tickArguments([utc ? _d3Time.utcYear : _d3Time.timeYear, 1, tickCount]).tickFormat((0, _d3TimeFormat.timeFormat)("%Y")).tickSizeOuter(0);
      } else if (format === "relative") {
        axis = (0, _d3Axis.axisBottom)(scale).ticks(tickCount).tickFormat(d => _moment.default.duration(+d).format()).tickSizeOuter(0);
      } else if (_underscore.default.isString(format)) {
        axis = (0, _d3Axis.axisBottom)(scale).ticks(tickCount).tickFormat((0, _d3TimeFormat.timeFormat)(format)).tickSizeOuter(0);
      } else if (_underscore.default.isFunction(format)) {
        axis = (0, _d3Axis.axisBottom)(scale).ticks(tickCount).tickFormat(format).tickSizeOuter(0);
      } else {
        axis = (0, _d3Axis.axisBottom)(scale).ticks(tickCount).tickSize(0);
      }
    } else {
      if (format === "day") {
        axis = (0, _d3Axis.axisBottom)(scale).tickArguments([utc ? _d3Time.utcDay : _d3Time.timeDay, 1]).tickFormat((0, _d3TimeFormat.timeFormat)("%d")).tickSizeOuter(0);
      } else if (format === "month") {
        axis = (0, _d3Axis.axisBottom)(scale).tickArguments([utc ? _d3Time.utcMonth : _d3Time.timeMonth, 1]).tickFormat((0, _d3TimeFormat.timeFormat)("%B")).tickSizeOuter(0);
      } else if (format === "year") {
        axis = (0, _d3Axis.axisBottom)(scale).tickArguments([utc ? _d3Time.utcYear : _d3Time.timeYear, 1]).tickFormat((0, _d3TimeFormat.timeFormat)("%Y")).tickSizeOuter(0);
      } else if (format === "relative") {
        axis = (0, _d3Axis.axisBottom)(scale).tickFormat(d => _moment.default.duration(+d).format()).tickSizeOuter(0);
      } else if (_underscore.default.isString(format)) {
        axis = (0, _d3Axis.axisBottom)(scale).tickFormat((0, _d3TimeFormat.timeFormat)(format)).tickSizeOuter(0);
      } else if (_underscore.default.isFunction(format)) {
        axis = (0, _d3Axis.axisBottom)(scale).tickFormat(format).tickSizeOuter(0);
      } else {
        axis = (0, _d3Axis.axisBottom)(scale).tickSize(0);
      }
    }

    // Remove the old axis from under this DOM node
    (0, _d3Selection.select)(_reactDom.default.findDOMNode(this)).selectAll("*").remove(); // eslint-disable-line
    //
    // Draw the new axis
    //
    let element = (0, _d3Selection.select)(_reactDom.default.findDOMNode(this)) // eslint-disable-line
    .append("g").attr("class", "x axis").style("stroke", "none").call(axis.tickSize(tickSize));
    Object.entries(valueStyle).forEach(_ref => {
      let [prop, val] = _ref;
      return element.style(prop, val);
    });
    if (this.props.angled) {
      element = (0, _d3Selection.select)(_reactDom.default.findDOMNode(this)) // eslint-disable-line
      .select("g").selectAll(".tick").select("text").attr("dx", "-1.2em").attr("dy", "0em").attr("transform", function (d) {
        return "rotate(-65)";
      }).style("text-anchor", "end");
      Object.entries(valueStyle).forEach(_ref2 => {
        let [prop, val] = _ref2;
        return element.style(prop, val);
      });
    } else {
      element = (0, _d3Selection.select)(_reactDom.default.findDOMNode(this)) // eslint-disable-line
      .select("g").selectAll(".tick").select("text");
      Object.entries(valueStyle).forEach(_ref3 => {
        let [prop, val] = _ref3;
        return element.style(prop, val);
      });
    }
    element = (0, _d3Selection.select)(_reactDom.default.findDOMNode(this)) // eslint-disable-line
    .select("g").selectAll(".tick").select("line");
    Object.entries(tickStyle).forEach(_ref4 => {
      let [prop, val] = _ref4;
      return element.style(prop, val);
    });
    (0, _d3Selection.select)(_reactDom.default.findDOMNode(this)).select("g").select("path").remove();
  }
  render() {
    return /*#__PURE__*/_react.default.createElement("g", null);
  }
}
exports.default = TimeAxis;
TimeAxis.defaultProps = {
  showGrid: false,
  style: defaultStyle,
  angled: false
};
TimeAxis.propTypes = {
  scale: _propTypes.default.func.isRequired,
  showGrid: _propTypes.default.bool,
  angled: _propTypes.default.bool,
  gridHeight: _propTypes.default.number,
  format: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.func]),
  utc: _propTypes.default.bool,
  style: _propTypes.default.shape({
    label: _propTypes.default.object,
    // eslint-disable-line
    values: _propTypes.default.object,
    // eslint-disable-line
    axis: _propTypes.default.object // eslint-disable-line
  }),
  tickCount: _propTypes.default.number
};