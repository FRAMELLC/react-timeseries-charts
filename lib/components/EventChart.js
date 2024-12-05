"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _underscore = _interopRequireDefault(require("underscore"));
var _merge = _interopRequireDefault(require("merge"));
var _react = _interopRequireDefault(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _pondjs = require("pondjs");
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

/**
 * Renders an event view that shows the supplied set of events along a time axis.
 * The events should be supplied as a Pond TimeSeries.
 * That series may contain regular TimeEvents, TimeRangeEvents
 * or IndexedEvents.
 */
class EventChart extends _react.default.Component {
  constructor(props) {
    super(props);
    this.state = {
      hover: null
    };
  }

  /**
   * Continues a hover event on a specific bar of the bar chart.
   */
  onMouseOver(e, event) {
    if (this.props.onMouseOver) {
      this.props.onMouseOver(event);
    }
    this.setState({
      hover: event
    });
  }

  /**
   * Handle mouse leave and calls onMouseLeave callback if one is provided
   */
  onMouseLeave() {
    if (this.props.onMouseLeave) {
      this.props.onMouseLeave(this.state.hover);
    }
    this.setState({
      hover: null
    });
  }

  /**
   * Handle click will call the onSelectionChange callback if one is provided
   * as a prop. It will be called with the event selected.
   */
  handleClick(e, event) {
    e.stopPropagation();
    if (this.props.onSelectionChange) {
      this.props.onSelectionChange(event);
    }
  }
  render() {
    const {
      series,
      textOffsetX,
      textOffsetY,
      hoverMarkerWidth
    } = this.props;
    const scale = this.props.timeScale;
    const eventMarkers = [];

    // Create and array of markers, one for each event
    let i = 0;
    for (const event of series.events()) {
      const begin = event.begin();
      const end = event.end();
      const beginPos = scale(begin) >= 0 ? scale(begin) : 0;
      const endPos = scale(end) <= this.props.width ? scale(end) : this.props.width;
      const transform = `translate(${beginPos},0)`;
      const isHover = this.state.hover ? _pondjs.Event.is(event, this.state.hover) : false;
      let state;
      if (isHover) {
        state = "hover";
      } else {
        state = "normal";
      }
      let barNormalStyle = {};
      let barStyle = {};
      if (this.props.style) {
        barNormalStyle = this.props.style(event, "normal");
        barStyle = this.props.style(event, state);
      }
      let label = "";
      if (this.props.label) {
        if (_underscore.default.isString(this.props.label)) {
          label = this.props.label;
        } else if (_underscore.default.isFunction(this.props.label)) {
          label = this.props.label(event);
        }
      }
      const x = this.props.spacing;
      const y = 0;
      let width = endPos - beginPos - 2 * this.props.spacing;
      width = width < 0 ? 0 : width;
      const height = this.props.size;
      const eventLabelStyle = {
        fontWeight: 100,
        fontSize: 11
      };
      let text = null;
      if (isHover) {
        text = /*#__PURE__*/_react.default.createElement("g", null, /*#__PURE__*/_react.default.createElement("rect", {
          className: "eventchart-marker",
          x: x,
          y: y,
          width: hoverMarkerWidth,
          height: height + 4,
          style: (0, _merge.default)(true, barNormalStyle, {
            pointerEvents: "none"
          })
        }), /*#__PURE__*/_react.default.createElement("text", {
          style: {
            pointerEvents: "none",
            fill: "#444",
            ...eventLabelStyle
          },
          x: 8 + textOffsetX,
          y: 15 + textOffsetY
        }, label));
      }
      eventMarkers.push(/*#__PURE__*/_react.default.createElement("g", {
        transform: transform,
        key: i
      }, /*#__PURE__*/_react.default.createElement("rect", {
        className: "eventchart-marker",
        x: x,
        y: y,
        width: width,
        height: height,
        style: barStyle,
        onClick: e => this.handleClick(e, event),
        onMouseLeave: () => this.onMouseLeave(),
        onMouseOver: e => this.onMouseOver(e, event)
      }), text));
      i += 1;
    }
    return /*#__PURE__*/_react.default.createElement("g", null, eventMarkers);
  }
}
exports.default = EventChart;
EventChart.defaultProps = {
  visible: true,
  size: 30,
  spacing: 0,
  textOffsetX: 0,
  textOffsetY: 0,
  hoverMarkerWidth: 5
};
EventChart.propTypes = {
  /**
   * Show or hide this chart
   */
  visible: _propTypes.default.bool,
  /**
   * What [Pond TimeSeries](https://esnet-pondjs.appspot.com/#/timeseries) data to visualize
   */
  series: _propTypes.default.instanceOf(_pondjs.TimeSeries).isRequired,
  /**
   * Set hover label text
   * When label is function callback it will be called with current event.
   */
  label: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.func]),
  /**
   * The height in pixels for the event bar
   */
  size: _propTypes.default.number,
  /**
   * The distance in pixels to inset the event bar from its actual timerange
   */
  spacing: _propTypes.default.number,
  /**
   * Marker width on hover
   */
  hoverMarkerWidth: _propTypes.default.number,
  /**
   * Hover text offset position X
   */
  textOffsetX: _propTypes.default.number,
  /**
   * Hover text offset position Y
   */
  textOffsetY: _propTypes.default.number,
  /**
   * A function that should return the style of the event box
   */
  style: _propTypes.default.func,
  /**
   * Event selection on click. Will be called with selected event.
   */
  onSelectionChange: _propTypes.default.func,
  /**
   * Mouse leave at end of hover event
   */
  onMouseLeave: _propTypes.default.func,
  /**
   * Mouse over event callback
   */
  onMouseOver: _propTypes.default.func,
  /**
   * [Internal] The timeScale supplied by the surrounding ChartContainer
   */
  timeScale: _propTypes.default.func,
  /**
   * [Internal] The width supplied by the surrounding ChartContainer
   */
  width: _propTypes.default.number
};