"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _merge = _interopRequireDefault(require("merge"));
var _react = _interopRequireDefault(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _pondjs = require("pondjs");
var _util = require("../js/util");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 *  Copyright (c) 2016, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */
/**
 * Renders a brush with the range defined in the prop `timeRange`.
 */
class MultiBrush extends _react.default.Component {
  constructor(props) {
    super(props);
    _defineProperty(this, "hasNullBrush", () => {
      return (this.props.timeRanges || []).length > 0 && this.props.timeRanges[this.props.timeRanges.length - 1] == null;
    });
    _defineProperty(this, "handleMouseClick", (e, brushIndex) => {
      if (this.props.onTimeRangeClicked) {
        this.props.onTimeRangeClicked(brushIndex);
      }
    });
    this.state = {
      isBrushing: false
    };
    this.handleBrushMouseDown = this.handleBrushMouseDown.bind(this);
    this.handleOverlayMouseDown = this.handleOverlayMouseDown.bind(this);
    this.handleHandleMouseDown = this.handleHandleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
  }
  viewport() {
    const {
      width,
      timeScale
    } = this.props;
    const viewBeginTime = timeScale.invert(0);
    const viewEndTime = timeScale.invert(width);
    return new _pondjs.TimeRange(viewBeginTime, viewEndTime);
  }

  //
  // Event handlers
  //

  handleBrushMouseDown(e, brush_idx) {
    e.preventDefault();
    const {
      pageX: x,
      pageY: y
    } = e;
    const xy0 = [Math.round(x), Math.round(y)];
    const begin = +this.props.timeRanges[brush_idx].begin();
    const end = +this.props.timeRanges[brush_idx].end();
    document.addEventListener("mouseup", this.handleMouseUp);
    this.setState({
      isBrushing: true,
      brushingInitializationSite: "brush",
      initialBrushBeginTime: begin,
      initialBrushEndTime: end,
      initialBrushXYPosition: xy0,
      brushIndex: brush_idx
    });
  }
  handleOverlayMouseDown(e) {
    if (this.props.allowFreeDrawing || this.hasNullBrush()) {
      e.preventDefault();
      const offset = (0, _util.getElementOffset)(this.overlay);
      const x = e.pageX - offset.left;
      const t = this.props.timeScale.invert(x).getTime();
      document.addEventListener("mouseup", this.handleMouseUp);
      const drawingPosition = this.props.allowFreeDrawing ? this.props.timeRanges.length : this.props.timeRanges.length - 1;
      this.setState({
        isBrushing: true,
        brushingInitializationSite: "overlay",
        initialBrushBeginTime: t,
        initialBrushEndTime: t,
        initialBrushXYPosition: null,
        brushIndex: drawingPosition
      });
    }
  }
  handleHandleMouseDown(e, handle, brushIndex) {
    e.preventDefault();
    const {
      pageX: x,
      pageY: y
    } = e;
    const xy0 = [Math.round(x), Math.round(y)];
    const begin = this.props.timeRanges[brushIndex].begin().getTime();
    const end = this.props.timeRanges[brushIndex].end().getTime();
    document.addEventListener("mouseover", this.handleMouseMove);
    document.addEventListener("mouseup", this.handleMouseUp);
    this.setState({
      isBrushing: true,
      brushingInitializationSite: `handle-${handle}`,
      initialBrushBeginTime: begin,
      initialBrushEndTime: end,
      initialBrushXYPosition: xy0,
      brushIndex: brushIndex
    });
  }
  handleMouseUp(e) {
    e.preventDefault();
    document.removeEventListener("mouseover", this.handleMouseMove);
    document.removeEventListener("mouseup", this.handleMouseUp);
    const brushing_is = this.state.brushIndex;
    this.setState({
      isBrushing: false,
      brushingInitializationSite: null,
      initialBrushBeginTime: null,
      initialBrushEndTime: null,
      initialBrushXYPosition: null,
      brushIndex: null
    }, () => {
      if (this.props.onUserMouseUp) {
        this.props.onUserMouseUp(brushing_is);
      }
    });
  }
  handleMouseMove(e) {
    e.preventDefault();
    const x = e.pageX;
    const y = e.pageY;
    const xy = [Math.round(x), Math.round(y)];
    const viewport = this.viewport();
    if (this.state.isBrushing) {
      let newBegin;
      let newEnd;
      const tb = this.state.initialBrushBeginTime;
      const te = this.state.initialBrushEndTime;
      if (this.state.brushingInitializationSite === "overlay") {
        const offset = (0, _util.getElementOffset)(this.overlay);
        const xx = e.pageX - offset.left;
        const t = this.props.timeScale.invert(xx).getTime();
        if (t < tb) {
          newBegin = t < viewport.begin().getTime() ? viewport.begin() : t;
          newEnd = tb > viewport.end().getTime() ? viewport.end() : tb;
        } else {
          newBegin = tb < viewport.begin().getTime() ? viewport.begin() : tb;
          newEnd = t > viewport.end().getTime() ? viewport.end() : t;
        }
      } else {
        const xy0 = this.state.initialBrushXYPosition;
        let timeOffset = this.props.timeScale.invert(xy0[0]).getTime() - this.props.timeScale.invert(xy[0]).getTime();

        // Constrain
        let startOffsetConstraint = timeOffset;
        let endOffsetConstrain = timeOffset;
        if (tb - timeOffset < viewport.begin()) {
          startOffsetConstraint = tb - viewport.begin().getTime();
        }
        if (te - timeOffset > viewport.end()) {
          endOffsetConstrain = te - viewport.end().getTime();
        }
        newBegin = this.state.brushingInitializationSite === "brush" || this.state.brushingInitializationSite === "handle-left" ? parseInt(tb - startOffsetConstraint, 10) : tb;
        newEnd = this.state.brushingInitializationSite === "brush" || this.state.brushingInitializationSite === "handle-right" ? parseInt(te - endOffsetConstrain, 10) : te;

        // Swap if needed
        if (newBegin > newEnd) [newBegin, newEnd] = [newEnd, newBegin];
      }
      if (this.props.onTimeRangeChanged) {
        this.props.onTimeRangeChanged(new _pondjs.TimeRange(newBegin, newEnd), this.state.brushIndex);
      }
    }
  }

  //
  // Render
  //

  renderOverlay() {
    const {
      width,
      height
    } = this.props;
    let cursor;
    switch (this.state.brushingInitializationSite) {
      case "handle-right":
      case "handle-left":
        cursor = "ew-resize";
        break;
      case "brush":
        cursor = "move";
        break;
      default:
        cursor = this.props.allowFreeDrawing || this.hasNullBrush() ? "crosshair" : "default";
    }
    const overlayStyle = {
      fill: "white",
      opacity: 0,
      cursor
    };
    return /*#__PURE__*/_react.default.createElement("rect", {
      ref: c => {
        this.overlay = c;
      },
      x: 0,
      y: 0,
      width: width,
      height: height,
      style: overlayStyle,
      onClick: this.handleMouseClick,
      onMouseDown: this.handleOverlayMouseDown,
      onMouseUp: this.handleMouseUp
    });
  }
  renderBrush(timeRange, idx) {
    const {
      timeScale,
      height
    } = this.props;
    if (!timeRange) {
      return /*#__PURE__*/_react.default.createElement("g", null);
    }
    let cursor;
    switch (this.state.brushingInitializationSite) {
      case "handle-right":
      case "handle-left":
        cursor = "ew-resize";
        break;
      case "overlay":
        cursor = this.props.allowFreeDrawing || this.hasNullBrush() ? "crosshair" : "default";
        break;
      default:
        cursor = "move";
    }

    // Style of the brush area
    const brushDefaultStyle = {
      fill: "#777",
      fillOpacity: 0.3,
      stroke: "#fff",
      shapeRendering: "crispEdges",
      cursor
    };
    const userStyle = this.props.style ? this.props.style(idx) : {};
    const brushStyle = (0, _merge.default)(true, brushDefaultStyle, userStyle);
    if (!this.viewport().disjoint(timeRange)) {
      const range = timeRange.intersection(this.viewport());
      const begin = range.begin();
      const end = range.end();
      const [x, y] = [timeScale(begin), 0];
      const endPos = timeScale(end);
      let width = endPos - x;
      if (width < 1) {
        width = 1;
      }
      const bounds = {
        x,
        y,
        width,
        height
      };
      return /*#__PURE__*/_react.default.createElement("rect", _extends({}, bounds, {
        key: `${idx}-${brushStyle}`,
        style: brushStyle,
        pointerEvents: "all",
        onClick: e => this.handleMouseClick(e, idx),
        onMouseDown: e => this.handleBrushMouseDown(e, idx),
        onMouseUp: this.handleMouseUp
      }));
    }
    return /*#__PURE__*/_react.default.createElement("g", null);
  }
  renderHandles(timeRange, idx) {
    const {
      timeScale,
      height
    } = this.props;
    if (!timeRange) {
      return /*#__PURE__*/_react.default.createElement("g", null);
    }

    // Style of the handles
    const handleStyle = {
      fill: "white",
      opacity: 0,
      cursor: "ew-resize"
    };
    if (!this.viewport().disjoint(timeRange)) {
      const range = timeRange.intersection(this.viewport());
      const [begin, end] = range.toJSON();
      const [x, y] = [timeScale(begin), 0];
      const endPos = timeScale(end);
      let width = endPos - x;
      if (width < 1) {
        width = 1;
      }
      const handleSize = this.props.handleSize;
      const leftHandleBounds = {
        x: x - 1,
        y,
        width: handleSize,
        height
      };
      const rightHandleBounds = {
        x: x + (width - handleSize),
        y,
        width: handleSize + 1,
        height
      };
      return /*#__PURE__*/_react.default.createElement("g", null, /*#__PURE__*/_react.default.createElement("rect", _extends({}, leftHandleBounds, {
        style: handleStyle,
        pointerEvents: "all",
        onMouseDown: e => this.handleHandleMouseDown(e, "left", idx),
        onMouseUp: this.handleMouseUp
      })), /*#__PURE__*/_react.default.createElement("rect", _extends({}, rightHandleBounds, {
        style: handleStyle,
        pointerEvents: "all",
        onMouseDown: e => this.handleHandleMouseDown(e, "right", idx),
        onMouseUp: this.handleMouseUp
      })));
    }
    return /*#__PURE__*/_react.default.createElement("g", null);
  }
  render() {
    return /*#__PURE__*/_react.default.createElement("g", {
      onMouseMove: this.handleMouseMove
    }, this.renderOverlay(), (this.props.timeRanges || []).map((timeRange, idx) => {
      return /*#__PURE__*/_react.default.createElement("g", {
        key: `multibrush_${idx}`
      }, this.renderBrush(timeRange, idx), this.renderHandles(timeRange, idx));
    }));
  }
}
exports.default = MultiBrush;
MultiBrush.propTypes = {
  /**
   * The timeranges for the brushes. Typically you would maintain this
   * as state on the surrounding page, since it would likely control
   * another page element, such as the range of the main chart. See
   * also `onTimeRangeChanged()` for receiving notification of the
   * brush range being changed by the user.
   *
   * Takes an array of Pond TimeRange object.
   */
  timeRanges: _propTypes.default.arrayOf(_propTypes.default.instanceOf(_pondjs.TimeRange)),
  /**
   * The brush is rendered as an SVG rect. You can specify the style
   * of this rect using this prop. The brush style is a function that you
   * provide. It will be called with the index of the TimeRange, corresponding
   * to those in the `timeRanges` prop.
   */
  style: _propTypes.default.func,
  //eslint-disable-line

  /**
   * The size of the invisible side handles. Defaults to 6 pixels.
   */
  handleSize: _propTypes.default.number,
  /**
   * If this prop is false, you will only be able to draw a new brush if the last position of the timeRanges
   * array is equal to null, otherwise it will allow the free drawing and the index passed to onTimeRangeChanged
   * will the equal to the length of the timeRanges array
   */
  allowFreeDrawing: _propTypes.default.bool,
  /**
   * A callback which will be called if the brush range is changed by
   * the user. It is called with a Pond TimeRange object and the index position of
   * the brush in the timeRanges prop.
   */
  onTimeRangeChanged: _propTypes.default.func,
  /**
   * when user stop drawing or dragging box
   */
  onUserMouseUp: _propTypes.default.func,
  /**
   * When the user clicks one of the TimeRanges
   */
  onTimeRangeClicked: _propTypes.default.func,
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
MultiBrush.defaultProps = {
  handleSize: 6,
  allowFreeDrawing: true
};