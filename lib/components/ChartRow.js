"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _underscore = _interopRequireDefault(require("underscore"));
var _react = _interopRequireDefault(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _d3Ease = require("d3-ease");
var _d3Scale = require("d3-scale");
var _reactHotLoader = require("react-hot-loader");
var _Brush = _interopRequireDefault(require("./Brush"));
var _YAxis = _interopRequireDefault(require("./YAxis"));
var _Charts = _interopRequireDefault(require("./Charts"));
var _MultiBrush = _interopRequireDefault(require("./MultiBrush"));
var _TimeMarker = _interopRequireDefault(require("./TimeMarker"));
var _interpolators = _interopRequireDefault(require("../js/interpolators"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 *  Copyright (c) 2015-present, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */
function createScale(yaxis, type, min, max, y0, y1) {
  let scale;
  if (_underscore.default.isUndefined(min) || _underscore.default.isUndefined(max)) {
    scale = null;
  } else if (type === "linear") {
    scale = (0, _d3Scale.scaleLinear)().domain([min, max]).range([y0, y1]).nice();
  } else if (type === "log") {
    const base = yaxis.props.logBase || 10;
    scale = (0, _d3Scale.scaleLog)().base(base).domain([min, max]).range([y0, y1]);
  } else if (type === "power") {
    const power = yaxis.props.powerExponent || 2;
    scale = (0, _d3Scale.scalePow)().exponent(power).domain([min, max]).range([y0, y1]);
  }
  return scale;
}

/**
 * A ChartRow is a container for a set of YAxis and multiple charts
 * which are overlaid on each other in a central canvas.
 *
 * Here is an example where a single `<ChartRow>` is defined within
 * the `<ChartContainer>`. Of course you can have any number of rows.
 *
 * For this row we specify the one prop `height` as 200 pixels high.
 *
 * Within the `<ChartRow>` we add:
 *
 * * `<YAxis>` elements for axes to the left of the chart
 * * `<Chart>` block containing our central chart area
 * * `<YAxis>` elements for our axes to the right of the charts
 *
 * ```
 * <ChartContainer timeRange={audSeries.timerange()}>
 *     <ChartRow height="200">
 *         <YAxis />
 *         <YAxis />
 *         <Charts>
 *             charts...
 *        </Charts>
 *         <YAxis />
 *     </ChartRow>
 * </ChartContainer>
 * ```
 */
class ChartRow extends _react.default.Component {
  constructor(props) {
    super(props);

    // id of clipping rectangle we will generate and use for each child
    // chart. Lives in state to ensure just one clipping rectangle and
    // id per chart row instance; we don't want a fresh id generated on
    // each render.
    _defineProperty(this, "isChildYAxis", child => (0, _reactHotLoader.areComponentsEqual)(child.type, _YAxis.default) || _underscore.default.has(child.props, "min") && _underscore.default.has(child.props, "max"));
    const clipId = _underscore.default.uniqueId("clip_");
    const clipPathURL = `url(#${clipId})`;
    this.state = {
      clipId,
      clipPathURL
    };
    this.mounted = true;
  }
  updateScales(props) {
    const axisMargin = props.axisMargin;
    const innerHeight = +props.height - axisMargin * 2;
    const rangeTop = axisMargin;
    const rangeBottom = innerHeight - axisMargin;
    _react.default.Children.forEach(props.children, child => {
      if (child === null) return;
      if (this.isChildYAxis(child)) {
        const {
          id,
          max,
          min,
          transition = 0,
          type = "linear"
        } = child.props;
        if (!_underscore.default.has(this.scaleMap, id)) {
          // If necessary, initialize a ScaleInterpolator for this y-axis.
          // When the yScale changes, we will update this interpolator.
          this.scaleMap[id] = new _interpolators.default(transition, _d3Ease.easeSinOut, s => {
            const yAxisScalerMap = this.state.yAxisScalerMap;
            yAxisScalerMap[id] = s;
            if (this.mounted) this.setState(yAxisScalerMap);
          });
        }
        // Get the vertical scale for this y-axis.
        let scale;
        if (_underscore.default.has(child.props, "yScale")) {
          // If the yScale prop is passed explicitly, use that.
          scale = child.props.yScale;
        } else {
          // Otherwise, compute the scale based on the max and min props.
          scale = createScale(child, type, min, max, rangeBottom, rangeTop);
        }

        // Update the scale on the interpolator for this y-axis.
        const cacheKey = `${type}-${min}-${max}-${rangeBottom}-${rangeTop}`;
        this.scaleMap[id].setScale(cacheKey, scale);
      }
    });

    // Update the state with the newly interpolated scaler for each y-axis.
    const scalerMap = {};
    _underscore.default.forEach(this.scaleMap, (interpolator, id) => {
      scalerMap[id] = interpolator.scaler();
    });
    if (this.mounted) this.setState({
      yAxisScalerMap: scalerMap
    });
  }
  componentWillMount() {
    // Our chart scales are driven off a mapping between id of the axis
    // and the scale that axis represents. Depending on the transition time,
    // this scale will animate over time. The controller of this animation is
    // the ScaleInterpolator. We create new Scale Interpolators here for each
    // axis id.
    this.scaleMap = {};
    this.updateScales(this.props);
  }

  /**
   * When we get changes to the row's props we update our map of
   * axis scales.
   */
  componentWillReceiveProps(nextProps) {
    this.updateScales(nextProps);
  }
  componentWillUnmount() {
    this.mounted = false;
  }
  render() {
    const {
      paddingLeft,
      paddingRight
    } = this.props;
    const axes = []; // Contains all the yAxis elements used in the render
    const chartList = []; // Contains all the Chart elements used in the render
    // Dimensions
    const innerHeight = +this.props.height - this.props.axisMargin * 2;

    //
    // Build a map of elements that occupy left or right slots next to the
    // chart.
    //
    // If an element has both and id and a min/max range, then we consider
    // it to be a y axis. For those we calculate a d3 scale that can be
    // reference by a chart. That scale will also be available to the axis
    // when it renders.
    //
    // For this row, we will need to know how many axis slots we are using.
    //

    const yAxisMap = {}; // Maps axis id -> axis element
    const leftAxisList = []; // Ordered list of left axes ids
    const rightAxisList = []; // Ordered list of right axes ids
    let alignLeft = true;
    _react.default.Children.forEach(this.props.children, child => {
      if (child === null) return;
      if ((0, _reactHotLoader.areComponentsEqual)(child.type, _Charts.default)) {
        alignLeft = false;
      } else {
        const id = child.props.id;
        // Check to see if we think this 'axis' is actually an axis
        if (this.isChildYAxis(child)) {
          const yaxis = child;
          if (yaxis.props.id && yaxis.props.visible !== false) {
            // Relate id to the axis
            yAxisMap[yaxis.props.id] = yaxis;
          }

          // Columns counts
          if (alignLeft) {
            leftAxisList.push(id);
          } else {
            rightAxisList.push(id);
          }
        }
      }
    });

    // Since we'll be building the left axis items from the inside to the outside
    leftAxisList.reverse();

    //
    // Push each axis onto the axes, transforming each into its
    // column location
    //

    let transform;
    let id;
    let props;
    let axis;
    let posx = 0;

    // Space used by columns on left and right of charts
    const leftWidth = _underscore.default.reduce(this.props.leftAxisWidths, (a, b) => a + b, 0);
    const rightWidth = _underscore.default.reduce(this.props.rightAxisWidths, (a, b) => a + b, 0);
    const chartWidth = this.props.width - leftWidth - rightWidth - paddingLeft - paddingRight;
    posx = leftWidth;
    for (let leftColumnIndex = 0; leftColumnIndex < this.props.leftAxisWidths.length; leftColumnIndex += 1) {
      const colWidth = this.props.leftAxisWidths[leftColumnIndex];
      posx -= colWidth;
      if (colWidth > 0 && leftColumnIndex < leftAxisList.length) {
        id = leftAxisList[leftColumnIndex];
        if (_underscore.default.has(yAxisMap, id)) {
          transform = `translate(${posx + paddingLeft},0)`;

          // Additional props for left aligned axes
          props = {
            width: colWidth,
            height: innerHeight,
            chartExtent: chartWidth,
            isInnerAxis: leftColumnIndex === 0,
            align: "left",
            scale: this.scaleMap[id].latestScale()
          };

          // Cloned left axis
          axis = /*#__PURE__*/_react.default.cloneElement(yAxisMap[id], props);
          axes.push(/*#__PURE__*/_react.default.createElement("g", {
            key: `y-axis-left-${leftColumnIndex}`,
            transform: transform
          }, axis));
        }
      }
    }
    posx = this.props.width - rightWidth - paddingRight;
    for (let rightColumnIndex = 0; rightColumnIndex < this.props.rightAxisWidths.length; rightColumnIndex += 1) {
      const colWidth = this.props.rightAxisWidths[rightColumnIndex];
      if (colWidth > 0 && rightColumnIndex < rightAxisList.length) {
        id = rightAxisList[rightColumnIndex];
        if (_underscore.default.has(yAxisMap, id)) {
          transform = `translate(${posx + paddingLeft},0)`;

          // Additional props for right aligned axes
          props = {
            width: colWidth,
            height: innerHeight,
            chartExtent: chartWidth,
            //showGrid: this.props.showGrid,
            isInnerAxis: rightColumnIndex === 0,
            align: "right",
            scale: this.scaleMap[id].latestScale()
          };

          // Cloned right axis
          axis = /*#__PURE__*/_react.default.cloneElement(yAxisMap[id], props);
          axes.push(/*#__PURE__*/_react.default.createElement("g", {
            key: `y-axis-right-${rightColumnIndex}`,
            transform: transform
          }, axis));
        }
      }
      posx += colWidth;
    }

    //
    // Push each chart onto the chartList, transforming each to the right
    // of the left axis slots and specifying its width. Each chart is passed
    // its time and y-scale. The y-scale is looked up in scaleMap, whose
    // current value is stored in the component state.
    //

    const chartTransform = `translate(${leftWidth + paddingLeft},0)`;
    let keyCount = 0;
    _react.default.Children.forEach(this.props.children, child => {
      if (child === null) return;
      if ((0, _reactHotLoader.areComponentsEqual)(child.type, _Charts.default)) {
        const charts = child;
        _react.default.Children.forEach(charts.props.children, chart => {
          if (!_underscore.default.has(chart.props, "visible") || chart.props.visible) {
            let scale = null;
            if (_underscore.default.has(this.state.yAxisScalerMap, chart.props.axis)) {
              scale = this.state.yAxisScalerMap[chart.props.axis];
            }
            let ytransition = null;
            if (_underscore.default.has(this.scaleMap, chart.props.axis)) {
              ytransition = this.scaleMap[chart.props.axis];
            }
            const chartProps = {
              key: keyCount,
              width: chartWidth,
              height: innerHeight,
              timeScale: this.props.timeScale,
              timeFormat: this.props.timeFormat
            };
            if (scale) {
              chartProps.yScale = scale;
            }
            if (ytransition) {
              chartProps.transition = ytransition;
            }
            chartList.push(/*#__PURE__*/_react.default.cloneElement(chart, chartProps));
            keyCount += 1;
          }
        });
      }
    });

    //
    // Push each child Brush on to the brush list.  We need brushed to be
    // rendered last (on top) of everything else in the Z order, both for
    // visual correctness and to ensure that the brush gets mouse events
    // before anything underneath
    //

    const brushList = [];
    const multiBrushList = [];
    keyCount = 0;
    _react.default.Children.forEach(this.props.children, child => {
      if (child === null) return;
      if ((0, _reactHotLoader.areComponentsEqual)(child.type, _Brush.default) || (0, _reactHotLoader.areComponentsEqual)(child.type, _MultiBrush.default)) {
        const brushProps = {
          key: `brush-${keyCount}`,
          width: chartWidth,
          height: innerHeight,
          timeScale: this.props.timeScale
        };
        if ((0, _reactHotLoader.areComponentsEqual)(child.type, _Brush.default)) {
          brushList.push(/*#__PURE__*/_react.default.cloneElement(child, brushProps));
        } else {
          multiBrushList.push(/*#__PURE__*/_react.default.cloneElement(child, brushProps));
        }
      }
      keyCount += 1;
    });
    const charts = /*#__PURE__*/_react.default.createElement("g", {
      transform: chartTransform,
      key: "event-rect-group"
    }, /*#__PURE__*/_react.default.createElement("g", {
      key: "charts",
      clipPath: this.state.clipPathURL
    }, chartList));

    //
    // Clipping
    //
    const clipper = /*#__PURE__*/_react.default.createElement("defs", null, /*#__PURE__*/_react.default.createElement("clipPath", {
      id: this.state.clipId
    }, /*#__PURE__*/_react.default.createElement("rect", {
      x: "0",
      y: "0",
      style: {
        strokeOpacity: 0.0
      },
      width: chartWidth,
      height: innerHeight
    })));

    //
    // Brush
    //
    const brushes = /*#__PURE__*/_react.default.createElement("g", {
      transform: chartTransform,
      key: "brush-group"
    }, brushList);

    //
    // Multi Brush
    //
    const multiBrushes = /*#__PURE__*/_react.default.createElement("g", {
      transform: chartTransform,
      key: "multi-brush-group"
    }, multiBrushList);

    //
    // TimeMarker used as a tracker
    //
    let tracker;
    if (this.props.trackerTime) {
      const timeFormat = this.props.trackerTimeFormat || this.props.timeFormat;
      const timeMarkerProps = {
        timeFormat,
        showLine: false,
        showTime: this.props.trackerShowTime,
        time: this.props.trackerTime,
        timeScale: this.props.timeScale,
        width: chartWidth,
        infoStyle: this.props.trackerStyle
      };
      if (this.props.trackerInfoValues) {
        timeMarkerProps.infoWidth = this.props.trackerInfoWidth;
        timeMarkerProps.infoHeight = this.props.trackerInfoHeight;
        timeMarkerProps.infoValues = this.props.trackerInfoValues;
        timeMarkerProps.timeFormat = this.props.trackerTimeFormat;
      }
      const trackerStyle = {
        pointerEvents: "none"
      };
      const trackerTransform = `translate(${leftWidth + paddingLeft},0)`;
      tracker = /*#__PURE__*/_react.default.createElement("g", {
        key: "tracker-group",
        style: trackerStyle,
        transform: trackerTransform
      }, /*#__PURE__*/_react.default.createElement(_TimeMarker.default, timeMarkerProps));
    }
    return /*#__PURE__*/_react.default.createElement("g", null, clipper, axes, charts, brushes, multiBrushes, tracker);
  }
}
exports.default = ChartRow;
ChartRow.defaultProps = {
  trackerTimeFormat: "%b %d %Y %X",
  enablePanZoom: false,
  height: 100,
  axisMargin: 5,
  visible: true
};
ChartRow.propTypes = {
  /**
   * The height of the row.
   */
  height: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.number]),
  /**
   * The vertical margin between the top and bottom of the row
   * height and the top and bottom of the range of the chart.
   */
  axisMargin: _propTypes.default.number,
  /**
   * Show or hide this row
   */
  visible: _propTypes.default.bool,
  /**
   * Should the time be shown on top of the tracker info box
   */
  trackerShowTime: _propTypes.default.bool,
  /**
   * The width of the tracker info box
   */
  trackerInfoWidth: _propTypes.default.number,
  /**
   * The height of the tracker info box
   */
  trackerInfoHeight: _propTypes.default.number,
  /**
   * Info box value or values to place next to the tracker line.
   * This is either an array of objects, with each object
   * specifying the label (a string) and value (also a string)
   * to be shown in the info box, or a simple string label.
   */
  trackerInfoValues: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.arrayOf(_propTypes.default.shape({
    label: _propTypes.default.string,
    // eslint-disable-line
    value: _propTypes.default.string // eslint-disable-line
  }))]),
  /**
   * Specify the title for the chart row
   */
  title: _propTypes.default.string,
  /**
   * Specify the height of the title
   * Default value is 28 pixels
   */
  titleHeight: _propTypes.default.number,
  /**
   * Specify the styling of the chart row's title
   */
  titleStyle: _propTypes.default.object,
  /**
   * Specify the styling of the box behind chart row's title
   */
  titleBoxStyle: _propTypes.default.object,
  children: _propTypes.default.oneOfType([_propTypes.default.arrayOf(_propTypes.default.node), _propTypes.default.node]),
  leftAxisWidths: _propTypes.default.arrayOf(_propTypes.default.number),
  rightAxisWidths: _propTypes.default.arrayOf(_propTypes.default.number),
  width: _propTypes.default.number,
  timeScale: _propTypes.default.func,
  trackerTimeFormat: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.func]),
  timeFormat: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.func]),
  trackerTime: _propTypes.default.instanceOf(Date)
};