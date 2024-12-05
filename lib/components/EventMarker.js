"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _underscore = _interopRequireDefault(require("underscore"));
var _react = _interopRequireDefault(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _merge = _interopRequireDefault(require("merge"));
var _pondjs = require("pondjs");
var _d3TimeFormat = require("d3-time-format");
var _Label = _interopRequireDefault(require("./Label"));
var _ValueList = _interopRequireDefault(require("./ValueList"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); } /**
 *  Copyright (c) 2016, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */
const EventTime = _ref => {
  let {
    time,
    format = "%m/%d/%y %X"
  } = _ref;
  const textStyle = {
    fontSize: 11,
    textAnchor: "left",
    fill: "#bdbdbd",
    pointerEvents: "none"
  };
  let text;
  if (_underscore.default.isFunction(format)) {
    text = format(time);
  } else {
    const fmt = (0, _d3TimeFormat.timeFormat)(format);
    text = fmt(time);
  }
  return /*#__PURE__*/_react.default.createElement("text", {
    x: 0,
    y: 0,
    dy: "1.2em",
    style: textStyle
  }, text);
};
EventTime.propTypes = {
  time: _propTypes.default.instanceOf(Date),
  format: _propTypes.default.oneOfType([_propTypes.default.func, _propTypes.default.string])
};
EventTime.defaultProps = {
  infoTimeFormat: "%m/%d/%y %X"
};
const EventTimeRange = _ref2 => {
  let {
    timerange,
    format = "%m/%d/%y %X"
  } = _ref2;
  const textStyle = {
    fontSize: 11,
    textAnchor: "left",
    fill: "#bdbdbd",
    pointerEvents: "none"
  };
  const d1 = timerange.begin();
  const d2 = timerange.end();
  let beginText;
  let endText;
  if (_underscore.default.isFunction(format)) {
    beginText = format(d1);
    endText = format(d2);
  } else {
    const fmt = (0, _d3TimeFormat.timeFormat)(format);
    beginText = fmt(d1);
    endText = fmt(d2);
  }
  return /*#__PURE__*/_react.default.createElement("text", {
    x: 0,
    y: 0,
    dy: "1.2em",
    style: textStyle
  }, `${beginText} to ${endText}`);
};
EventTimeRange.propTypes = {
  timerange: _propTypes.default.instanceOf(_pondjs.TimeRange),
  format: _propTypes.default.oneOfType([_propTypes.default.func, _propTypes.default.string])
};
EventTimeRange.defaultProps = {
  infoTimeFormat: "%m/%d/%y %X"
};
const EventIndex = _ref3 => {
  let {
    index,
    format
  } = _ref3;
  const textStyle = {
    fontSize: 11,
    textAnchor: "left",
    fill: "#bdbdbd",
    pointerEvents: "none"
  };
  let text;
  if (_underscore.default.isFunction(format)) {
    text = format(index);
  } else if (_underscore.default.isString(format)) {
    const fmt = (0, _d3TimeFormat.timeFormat)(format);
    text = fmt(index.begin());
  } else {
    text = index.toString();
  }
  return /*#__PURE__*/_react.default.createElement("text", {
    x: 0,
    y: 0,
    dy: "1.2em",
    style: textStyle
  }, text);
};
EventIndex.propTypes = {
  index: _propTypes.default.instanceOf(_pondjs.Index),
  format: _propTypes.default.oneOfType([_propTypes.default.func, _propTypes.default.string])
};

/**
 * Renders a marker at a specific event on the chart.
 *
 * To explain how EventMarkers work, it's useful to explain a little
 * terminology used here. A marker has several parts:
 *
 *  * the "marker" itself which appears at the (value, time) of the event.
 *    This is a dot which whose radius is defined by markerRadius, and
 *    whose style is set with markerStyle
 *  * the "markerLabel" which is a string that will be rendered next to
 *    the marker. The label can be aligned with markerAlign and also
 *    styled with markerLabelStyle
 *  * the "info box" which is a box containing values that hovers that the
 *    top of the chart. Optionally it can show the time above the box.
 *    The values themselves are supplied as an array of objects using
 *    the `info` prop. The info box can be styled with `infoStyle`,
 *    sized with `infoWidth` and `infoHeight`, and the time formatted
 *    with `infoTimeFormat`
 *  * the "stem" which is a connector between the marker and the
 *    info box to visually link the two
 *
 * Combining these attributes, Event markers fall into two flavors, either
 * you want to omit the infoBox and mark the event with a dot and optionally
 * a label, or you want to omit the label (and perhaps marker dot) and show
 * a flag style marker with the infoBox connected to the event with the stem.
 *
 * As with other IndexedEvents or TimeRangeEvents, the marker will appear at
 * the center of the timerange represented by that event. You can, however,
 * override either the x or y position by a number of pixels.
 */
class EventMarker extends _react.default.Component {
  renderTime(event) {
    if (event instanceof _pondjs.TimeEvent) {
      return /*#__PURE__*/_react.default.createElement(EventTime, {
        time: event.timestamp(),
        format: this.props.infoTimeFormat
      });
    } else if (event instanceof _pondjs.IndexedEvent) {
      return /*#__PURE__*/_react.default.createElement(EventIndex, {
        index: event.index(),
        format: this.props.infoTimeFormat
      });
    } else if (event instanceof _pondjs.TimeRangeEvent) {
      return /*#__PURE__*/_react.default.createElement(EventTimeRange, {
        timerange: event.timerange(),
        format: this.props.infoTimeFormat
      });
    }
    return /*#__PURE__*/_react.default.createElement("g", null);
  }
  renderMarker(event, column, info) {
    let t;
    if (event instanceof _pondjs.TimeEvent) {
      t = event.timestamp();
    } else {
      t = new Date(event.begin().getTime() + (event.end().getTime() - event.begin().getTime()) / 2);
    }
    let value;
    if (this.props.yValueFunc) {
      value = this.props.yValueFunc(event, column);
    } else {
      value = event.get(column);
    }

    // Allow overrides on the x and y position. This is useful for the barchart
    // tracker because bars maybe be offset from their actual event position in
    // order to display them side by side.
    const posx = this.props.timeScale(t) + this.props.offsetX;
    const posy = this.props.yScale(value) - this.props.offsetY;
    const infoOffsetY = this.props.infoOffsetY;
    const infoBoxProps = {
      align: "left",
      style: this.props.infoStyle,
      width: this.props.infoWidth,
      height: this.props.infoHeight
    };
    const w = this.props.infoWidth;
    const lineBottom = posy - 10;
    let verticalStem;
    let horizontalStem;
    let dot;
    let infoBox;
    let transform;
    let label;
    if (info) {
      if (_underscore.default.isString(this.props.info)) {
        infoBox = /*#__PURE__*/_react.default.createElement(_Label.default, _extends({}, infoBoxProps, {
          label: info
        }));
      } else {
        infoBox = /*#__PURE__*/_react.default.createElement(_ValueList.default, _extends({}, infoBoxProps, {
          values: info
        }));
      }
    }

    //
    // Marker on right of event
    //

    if (this.props.type === "point") {
      let textDefaultStyle = {
        fontSize: 11,
        pointerEvents: "none",
        paintOrder: "stroke",
        fill: "#b0b0b0",
        strokeWidth: 2,
        strokeLinecap: "butt",
        strokeLinejoin: "miter",
        fontWeight: 800
      };
      let dx = 0;
      let dy = 0;
      switch (this.props.markerLabelAlign) {
        case "left":
          dx = 5;
          textDefaultStyle.textAnchor = "start";
          textDefaultStyle.alignmentBaseline = "central";
          break;
        case "right":
          dx = -5;
          textDefaultStyle.textAnchor = "end";
          textDefaultStyle.alignmentBaseline = "central";
          break;
        case "top":
          dy = -5;
          textDefaultStyle.textAnchor = "middle";
          textDefaultStyle.alignmentBaseline = "bottom";
          break;
        case "bottom":
          dy = 5;
          textDefaultStyle.textAnchor = "middle";
          textDefaultStyle.alignmentBaseline = "hanging";
          break;
        default:
        //pass
      }
      const tstyle = (0, _merge.default)(true, textDefaultStyle, this.props.markerLabelStyle);
      dot = /*#__PURE__*/_react.default.createElement("circle", {
        cx: posx,
        cy: posy,
        r: this.props.markerRadius,
        pointerEvents: "none",
        style: this.props.markerStyle
      });
      label = /*#__PURE__*/_react.default.createElement("text", {
        x: posx,
        y: posy,
        dx: dx,
        dy: dy,
        style: tstyle
      }, this.props.markerLabel);
      return /*#__PURE__*/_react.default.createElement("g", null, dot, label);
    } else {
      if (posx + 10 + w < this.props.width * 3 / 4) {
        if (info) {
          verticalStem = /*#__PURE__*/_react.default.createElement("line", {
            pointerEvents: "none",
            style: this.props.stemStyle,
            x1: -10,
            y1: lineBottom,
            x2: -10,
            y2: infoOffsetY
          });
          horizontalStem = /*#__PURE__*/_react.default.createElement("line", {
            pointerEvents: "none",
            style: this.props.stemStyle,
            x1: -10,
            y1: infoOffsetY,
            x2: -2,
            y2: infoOffsetY
          });
        }
        dot = /*#__PURE__*/_react.default.createElement("circle", {
          cx: -10,
          cy: lineBottom,
          r: this.props.markerRadius,
          pointerEvents: "none",
          style: this.props.markerStyle
        });
        transform = `translate(${posx + 10},${10})`;
      } else {
        if (info) {
          verticalStem = /*#__PURE__*/_react.default.createElement("line", {
            pointerEvents: "none",
            style: this.props.stemStyle,
            x1: w + 10,
            y1: lineBottom,
            x2: w + 10,
            y2: infoOffsetY
          });
          horizontalStem = /*#__PURE__*/_react.default.createElement("line", {
            pointerEvents: "none",
            style: this.props.stemStyle,
            x1: w + 10,
            y1: infoOffsetY,
            x2: w + 2,
            y2: infoOffsetY
          });
        }
        dot = /*#__PURE__*/_react.default.createElement("circle", {
          cx: w + 10,
          cy: lineBottom,
          r: this.props.markerRadius,
          pointerEvents: "none",
          style: this.props.markerStyle
        });
        transform = `translate(${posx - w - 10},${10})`;
      }
      return /*#__PURE__*/_react.default.createElement("g", {
        transform: transform
      }, verticalStem, horizontalStem, dot, /*#__PURE__*/_react.default.createElement("g", {
        transform: `translate(0,${infoOffsetY - 20})`
      }, this.renderTime(event)), /*#__PURE__*/_react.default.createElement("g", {
        transform: `translate(0,${infoOffsetY})`
      }, infoBox));
    }
  }
  render() {
    const {
      event,
      column,
      info
    } = this.props;
    if (!event) {
      return /*#__PURE__*/_react.default.createElement("g", null);
    }
    return /*#__PURE__*/_react.default.createElement("g", null, this.renderMarker(event, column, info));
  }
}
exports.default = EventMarker;
EventMarker.propTypes = {
  type: _propTypes.default.oneOf(["point", "flag"]),
  /**
   * What [Pond Event](https://esnet-pondjs.appspot.com/#/event) to mark
   */
  event: _propTypes.default.oneOfType([_propTypes.default.instanceOf(_pondjs.TimeEvent), _propTypes.default.instanceOf(_pondjs.IndexedEvent), _propTypes.default.instanceOf(_pondjs.TimeRangeEvent)]),
  /**
   * Which column in the Event to use
   *
   * NOTE : Columns can't have periods because periods
   * represent a path to deep data in the underlying events
   * (i.e. reference into nested data structures)
   */
  column: _propTypes.default.string,
  /**
   * The values to show in the info box. This is either an array of
   * objects, with each object specifying the label and value
   * to be shown in the info box, or a simple string label. If this
   * prop is not supplied, no infoBox will be displayed.
   */
  info: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.arrayOf(_propTypes.default.shape({
    label: _propTypes.default.string,
    // eslint-disable-line
    value: _propTypes.default.string // eslint-disable-line
  }))]),
  /**
   * The style of the info box itself. Typically you'd want to
   * specify a fill color, and stroke color/width here.
   */
  infoStyle: _propTypes.default.object,
  /**
   * The width of the info box
   */
  infoWidth: _propTypes.default.number,
  /**
   * The height of the info box
   */
  infoHeight: _propTypes.default.number,
  /**
   * Alter the format of the timestamp shown on the info box.
   * This may be either a function or a string. If you provide a function
   * that will be passed an Index and should return a string. For example:
   * ```
   *     index => moment(index.begin()).format("Do MMM 'YY")
   * ```
   * Alternatively you can pass in a d3 format string. That will be applied
   * to the begin time of the Index range.
   */
  infoTimeFormat: _propTypes.default.oneOfType([_propTypes.default.func, _propTypes.default.string]),
  /**
   * Show a label to the left or right of the marker
   */
  markerLabelAlign: _propTypes.default.oneOf(["left", "right", "top", "bottom"]),
  /**
   * The radius of the dot at the end of the marker
   */
  markerRadius: _propTypes.default.number,
  /**
   * The style of the event marker dot
   */
  markerStyle: _propTypes.default.object,
  /**
   * The y value is calculated by the column and event, but if
   * this prop is provided this will be used instead.
   */
  yValueFunc: _propTypes.default.func,
  /**
   * Offset the marker position in the x direction.
   */
  offsetX: _propTypes.default.number,
  /**
   * Offset the marker position in the y direction
   */
  offsetY: _propTypes.default.number,
  /**
   * The vertical offset in pixels of the EventMarker info box from the
   * top of the chart. The default is 20.
   */
  infoOffsetY: _propTypes.default.number,
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
EventMarker.defaultProps = {
  type: "flag",
  column: "value",
  infoWidth: 90,
  infoHeight: 25,
  infoStyle: {
    fill: "white",
    opacity: 0.9,
    stroke: "#999",
    pointerEvents: "none"
  },
  stemStyle: {
    stroke: "#999",
    cursor: "crosshair",
    pointerEvents: "none"
  },
  markerStyle: {
    fill: "#999"
  },
  markerRadius: 2,
  markerLabelAlign: "left",
  markerLabelStyle: {
    fill: "#999"
  },
  offsetX: 0,
  offsetY: 0,
  infoOffsetY: 20
};