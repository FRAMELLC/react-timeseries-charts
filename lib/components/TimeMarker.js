"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _underscore = _interopRequireDefault(require("underscore"));
var _moment = _interopRequireDefault(require("moment"));
var _react = _interopRequireDefault(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _d3TimeFormat = require("d3-time-format");
require("moment-duration-format");
var _ValueList = _interopRequireDefault(require("./ValueList"));
var _Label = _interopRequireDefault(require("./Label"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); } /**
 *  Copyright (c) 2015-present, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */
class TimeMarker extends _react.default.Component {
  renderLine(posx) {
    return /*#__PURE__*/_react.default.createElement("line", {
      style: this.props.infoStyle.line,
      x1: posx,
      y1: 0,
      x2: posx,
      y2: this.props.height
    });
  }
  renderTimeMarker(d) {
    const textStyle = {
      fontSize: 11,
      textAnchor: "left",
      fill: "#bdbdbd"
    };
    let dateStr = `${d}`;
    if (this.props.timeFormat === "day") {
      const formatter = (0, _d3TimeFormat.timeFormat)("%d");
      dateStr = formatter(d);
    } else if (this.props.timeFormat === "month") {
      const formatter = (0, _d3TimeFormat.timeFormat)("%B");
      dateStr = formatter(d);
    } else if (this.props.timeFormat === "year") {
      const formatter = (0, _d3TimeFormat.timeFormat)("%Y");
      dateStr = formatter(d);
    } else if (this.props.timeFormat === "relative") {
      dateStr = _moment.default.duration(+d).format();
    } else if (_underscore.default.isString(this.props.timeFormat)) {
      const formatter = (0, _d3TimeFormat.timeFormat)(this.props.timeFormat);
      dateStr = formatter(d);
    } else if (_underscore.default.isFunction(this.props.timeFormat)) {
      dateStr = this.props.timeFormat(d);
    }
    return /*#__PURE__*/_react.default.createElement("text", {
      x: 0,
      y: 0,
      dy: "1.2em",
      style: textStyle
    }, dateStr);
  }
  renderInfoBox(posx) {
    const w = this.props.infoWidth;
    const infoBoxProps = {
      align: "left",
      style: {
        box: this.props.infoStyle.box,
        label: this.props.infoStyle.label
      },
      width: this.props.infoWidth,
      height: this.props.infoHeight
    };
    if (this.props.infoValues) {
      const infoBox = _underscore.default.isString(this.props.infoValues) ? /*#__PURE__*/_react.default.createElement(_Label.default, _extends({}, infoBoxProps, {
        label: this.props.infoValues
      })) : /*#__PURE__*/_react.default.createElement(_ValueList.default, _extends({}, infoBoxProps, {
        values: this.props.infoValues
      }));
      if (posx + 10 + w < this.props.width - 50) {
        return /*#__PURE__*/_react.default.createElement("g", {
          transform: `translate(${posx + 10},${5})`
        }, this.props.showTime ? this.renderTimeMarker(this.props.time) : null, /*#__PURE__*/_react.default.createElement("g", {
          transform: `translate(0,${this.props.showTime ? 20 : 0})`
        }, infoBox));
      }
      return /*#__PURE__*/_react.default.createElement("g", {
        transform: `translate(${posx - w - 10},${5})`
      }, this.props.showTime ? this.renderTimeMarker(this.props.time) : null, /*#__PURE__*/_react.default.createElement("g", {
        transform: `translate(0,${this.props.showTime ? 20 : 0})`
      }, infoBox));
    }
    return /*#__PURE__*/_react.default.createElement("g", null);
  }
  render() {
    const posx = this.props.timeScale(this.props.time);
    if (posx) {
      return /*#__PURE__*/_react.default.createElement("g", null, this.props.showLine ? this.renderLine(posx) : null, this.props.showInfoBox ? this.renderInfoBox(posx) : null);
    }
    return null;
  }
}
exports.default = TimeMarker;
TimeMarker.propTypes = {
  /**
   * Show or hide this chart
   */
  visible: _propTypes.default.bool,
  /**
   * The time, expressed as a Javascript `Date` object, to display the marker
   */
  time: _propTypes.default.instanceOf(Date),
  /**
   * The values to show in the info box. This is either an array of
   * objects, with each object specifying the label and value
   * to be shown in the info box, or a simple string label
   */
  infoValues: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.arrayOf(_propTypes.default.shape({
    label: _propTypes.default.string,
    // eslint-disable-line
    value: _propTypes.default.string // eslint-disable-line
  }))]),
  /**
   * The style of the info box and connecting lines. This is an
   * object of the form { line, box, dot }. Line, box and dot
   * are themselves objects representing inline CSS for each of
   * the pieces of the info marker.
   */
  infoStyle: _propTypes.default.shape({
    line: _propTypes.default.object,
    // eslint-disable-line
    box: _propTypes.default.object,
    // eslint-disable-line
    dot: _propTypes.default.object // eslint-disable-line
  }),
  /**
   * The width of the hover info box
   */
  infoWidth: _propTypes.default.number,
  /**
   * The height of the hover info box
   */
  infoHeight: _propTypes.default.number,
  /**
   * Display the info box at all. If you don't have any values to show and just
   * want a line and a time (for example), you can set this to false.
   */
  showInfoBox: _propTypes.default.bool,
  /**
   * You can show the info box without the corresponding time marker. Why would
   * you do this? I don't know. Actually, I do. You might use the ChartContainer
   * tracker mechanism to show the line across multiple rows, then add a TimeMarker
   * selectively to each row.
   */
  showLine: _propTypes.default.bool,
  /**
   * You can hide the time displayed above the info box. You might do this because
   * it is already displayed elsewhere in your UI. Or maybe you just don't like it.
   */
  showTime: _propTypes.default.bool,
  /**
   * The time format used for display of the time above the info box.
   */
  timeFormat: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.func]),
  /**
   * [Internal] The timeScale supplied by the surrounding ChartContainer
   */
  timeScale: _propTypes.default.func,
  /**
   * [Internal] The width supplied by the surrounding ChartContainer
   */
  width: _propTypes.default.number,
  /**
   * [Internal] The height supplied by the surrounding ChartContainer
   */
  height: _propTypes.default.number
};
TimeMarker.defaultProps = {
  visible: true,
  showInfoBox: true,
  showLine: true,
  showTime: true,
  infoStyle: {
    line: {
      stroke: "#999",
      cursor: "crosshair",
      pointerEvents: "none"
    },
    box: {
      fill: "white",
      opacity: 0.9,
      stroke: "#999",
      pointerEvents: "none"
    },
    dot: {
      fill: "#999"
    }
  },
  infoWidth: 90,
  infoHeight: 25
};