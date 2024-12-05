"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _underscore = _interopRequireDefault(require("underscore"));
var _merge = _interopRequireDefault(require("merge"));
var _react = _interopRequireDefault(require("react"));
var _d3Shape = require("d3-shape");
var _propTypes = _interopRequireDefault(require("prop-types"));
var _pondjs = require("pondjs");
var _curve = _interopRequireDefault(require("../js/curve"));
var _styler = require("../js/styler");
var _util = require("../js/util");
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

const defaultFillStyle = {
  fill: "steelblue",
  stroke: "none"
};
const defaultMutedStyle = {
  fill: "grey",
  stroke: "none"
};
const defaultStyle = [{
  normal: {
    ...defaultFillStyle,
    opacity: 0.2
  },
  highlighted: {
    ...defaultFillStyle,
    opacity: 0.3
  },
  selected: {
    ...defaultFillStyle,
    opacity: 0.3
  },
  muted: {
    ...defaultMutedStyle,
    opacity: 0.1
  }
}, {
  normal: {
    ...defaultFillStyle,
    opacity: 0.5
  },
  highlighted: {
    ...defaultFillStyle,
    opacity: 0.6
  },
  selected: {
    ...defaultFillStyle,
    opacity: 0.6
  },
  muted: {
    ...defaultMutedStyle,
    opacity: 0.2
  }
}, {
  normal: {
    ...defaultFillStyle,
    opacity: 0.9
  },
  highlighted: {
    ...defaultFillStyle,
    opacity: 1.0
  },
  selected: {
    ...defaultFillStyle,
    opacity: 1.0
  },
  muted: {
    ...defaultMutedStyle,
    opacity: 0.2
  }
}];
const defaultAggregation = {
  size: "5m",
  reducers: {
    outer: [(0, _pondjs.min)(), (0, _pondjs.max)()],
    inner: [(0, _pondjs.percentile)(25), (0, _pondjs.percentile)(75)],
    center: (0, _pondjs.median)()
  }
};
function getSeries(series, column) {
  return series.map(e => {
    const v = e.get(column);
    const d = {};
    switch (v.length) {
      case 1:
        d.center = v[0];
        break;
      case 2:
        d.innerMin = v[0];
        d.innerMax = v[1];
        break;
      case 3:
        d.innerMin = v[0];
        d.center = v[1];
        d.innerMax = v[2];
        break;
      case 4:
        d.outerMin = v[0];
        d.innerMin = v[1];
        d.innerMax = v[2];
        d.outerMax = v[3];
        break;
      case 5:
        d.outerMin = v[0];
        d.innerMin = v[1];
        d.center = v[2];
        d.innerMax = v[3];
        d.outerMax = v[4];
        break;
      default:
        console.error("Tried to make boxchart from invalid array");
    }
    const ee = new _pondjs.IndexedEvent(e.index(), d);
    return ee;
  });
}
function getAggregatedSeries(series, column) {
  let aggregation = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : defaultAggregation;
  const {
    size,
    reducers
  } = aggregation;
  const {
    inner,
    outer,
    center
  } = reducers;
  function mapColumn(c, r) {
    const obj = {};
    obj[c] = r;
    return obj;
  }
  const fixedWindowAggregation = {};
  if (inner) {
    fixedWindowAggregation.innerMin = mapColumn(column, inner[0]);
    fixedWindowAggregation.innerMax = mapColumn(column, inner[1]);
  }
  if (outer) {
    fixedWindowAggregation.outerMin = mapColumn(column, outer[0]);
    fixedWindowAggregation.outerMax = mapColumn(column, outer[1]);
  }
  if (center) {
    fixedWindowAggregation.center = mapColumn(column, center);
  }
  return series.fixedWindowRollup({
    windowSize: size,
    aggregation: fixedWindowAggregation
  });
}

/**
 * Renders a band chart.
 *
 * The TimeSeries supplied to the band chart, as the `series` prop can be one of two types:
 *
 *  1) It can be a TimeSeries containing IndexedEvents or TimeRangeEvents.
 *     In this case a `column` prop should be supplied to specify the
 *     data column containing the dimensions of the boxes. This props
 *     should be an array of size 1 to 5 elements. e.g. [12, 18, 22, 28]. The
 *     numbers should be ordered, lowest to greatest.
 *
 *  2) A TimeSeries containing timestamp based Events. In this case the
 *     band chart will be aggregated for you. To control the aggregation you can supply
 *     an `aggregation` prop: a structure to specify the window size and
 *     reducers used to determine the boxes.
 *
 * In both cases you are generating up to two ranges and a center marker. In the
 * first case you are defining this based on the array of numbers. The outer numbers
 * specify the outerRange, the inner numbers specify the innerRange and the middle
 * number specifies the center marker. In the second case you are building those ranges
 * from denser data, specifying a window and aggregation functions to build each
 * of the ranges and center maker.
 *
 * In both cases you do not need to supply all the values. For example if you
 * provide an array of 2 elements, that would define a single range, with no outer range
 * and no center marker. The Band Chart is pretty flexible in that way, so you
 * can use it in many situations.
 *
 * Here is an example of using it to display temperature ranges. The series
 * passed to this code would be a TimeSeries containing IndexedEvents. For
 * each event, the column `temp` contains an array of values used for the
 * box plot ranges:
 *
 * ```
 *     <BandChart
 *       axis="temperatureAxis"
 *       style={style}
 *       column="temp"
 *       series={series} />
 * ```
 *
 * While here is an example with a dense TimeSeries of Events supplied,
 * along with an aggregation specification. This code would produce an
 * outer range from the 5th percentile to the 95th, along with an inner
 * range for the interquantile, and a center marker at the median:
 *
 * ```
 *    <BandChart
 *      axis="speedaxis"
 *      series={speed}
 *      column="speed"
 *      style={style}
 *      aggregation={{
 *        size: this.state.rollup,
 *        reducers: {
 *          outer: [percentile(5), percentile(95)],
 *          inner: [percentile(25), percentile(75)],
 *          center: median(),
 *        },
 *      }}
 *    />
 * ```
 */
class BandChart extends _react.default.Component {
  constructor(props) {
    super(props);
    if (props.series._collection._type === _pondjs.TimeEvent // eslint-disable-line
    ) {
      this.series = getAggregatedSeries(props.series, props.column, props.aggregation);
    } else {
      this.series = getSeries(props.series, props.column);
    }
  }
  componentWillReceiveProps(nextProps) {
    const aggregation = nextProps.aggregation;
    let aggregationChanged = false;
    if (_underscore.default.isUndefined(aggregation) !== _underscore.default.isUndefined(this.props.aggregation)) {
      aggregationChanged = true;
    }
    if (aggregation && this.props.aggregation) {
      if (aggregation.size !== this.props.aggregation.size) {
        aggregationChanged = true;
      }
    }
    if (aggregationChanged) {
      this.series = getAggregatedSeries(nextProps.series, nextProps.column, nextProps.aggregation);
    }
  }
  shouldComponentUpdate(nextProps) {
    const newSeries = nextProps.series;
    const oldSeries = this.props.series;
    const width = nextProps.width;
    const timeScale = nextProps.timeScale;
    const yScale = nextProps.yScale;
    const column = nextProps.column;
    const style = nextProps.style;
    const aggregation = nextProps.aggregation;
    const highlighted = nextProps.highlighted;
    const selected = nextProps.selected;
    const widthChanged = this.props.width !== width;
    const timeScaleChanged = (0, _util.scaleAsString)(this.props.timeScale) !== (0, _util.scaleAsString)(timeScale);
    const yAxisScaleChanged = this.props.yScale !== yScale;
    const columnChanged = this.props.column !== column;
    const styleChanged = JSON.stringify(this.props.style) !== JSON.stringify(style);
    const highlightedChanged = this.props.highlighted !== highlighted;
    const selectedChanged = this.props.selected !== selected;
    let aggregationChanged = false;
    if (_underscore.default.isUndefined(aggregation) !== _underscore.default.isUndefined(this.props.aggregation)) {
      aggregationChanged = true;
    }
    if (aggregation && this.props.aggregation) {
      if (aggregation.size !== this.props.aggregation.size) {
        aggregationChanged = true;
      }
    }
    let seriesChanged = false;
    if (oldSeries.size() !== newSeries.size()) {
      seriesChanged = true;
    } else {
      seriesChanged = !_pondjs.TimeSeries.is(oldSeries, newSeries);
    }

    // If the series changes we need to rebuild this.series with
    // the incoming props
    if (seriesChanged) {
      if (nextProps.series._collection._type === _pondjs.TimeEvent // eslint-disable-line
      ) {
        this.series = getAggregatedSeries(nextProps.series, nextProps.column, nextProps.aggregation);
      } else {
        this.series = getSeries(nextProps.series, nextProps.column);
      }
    }
    return seriesChanged || timeScaleChanged || widthChanged || columnChanged || styleChanged || yAxisScaleChanged || aggregationChanged || highlightedChanged || selectedChanged;
  }
  handleHover(e, event) {
    if (this.props.onHighlightChange) {
      this.props.onHighlightChange(event);
    }
  }
  handleHoverLeave() {
    if (this.props.onHighlightChange) {
      this.props.onHighlightChange(null);
    }
  }
  handleClick(e, event) {
    if (this.props.onSelectionChange) {
      this.props.onSelectionChange(event);
    }
    e.stopPropagation();
  }
  providedStyleArray(column) {
    let style = {};
    if (this.props.style) {
      if (this.props.style instanceof _styler.Styler) {
        style = this.props.style.boxChartStyle()[column];
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
  style(column, event, level) {
    let style;
    if (!this.providedStyle) {
      this.providedStyle = this.providedStyleArray(this.props.column);
    }
    if (!_underscore.default.isNull(this.providedStyle) && (!_underscore.default.isArray(this.providedStyle) || this.providedStyle.length !== 3)) {
      console.warn("Provided style to BandChart should be an array of 3 objects");
      return defaultStyle;
    }
    const isHighlighted = this.props.highlighted && _pondjs.Event.is(this.props.highlighted, event);
    const isSelected = this.props.selected && _pondjs.Event.is(this.props.selected, event);
    if (this.props.selected) {
      if (isSelected) {
        if (!this.selectedStyle || !this.selectedStyle[level]) {
          if (!this.selectedStyle) {
            this.selectedStyle = [];
          }
          this.selectedStyle[level] = (0, _merge.default)(true, defaultStyle[level].selected, this.providedStyle[level].selected ? this.providedStyle[level].selected : {});
        }
        style = this.selectedStyle[level];
      } else if (isHighlighted) {
        if (!this.highlightedStyle || !this.highlightedStyle[level]) {
          if (!this.highlightedStyle) {
            this.highlightedStyle = [];
          }
          this.highlightedStyle[level] = (0, _merge.default)(true, defaultStyle[level].highlighted, this.providedStyle[level].highlighted ? this.providedStyle[level].highlighted : {});
        }
        style = this.highlightedStyle[level];
      } else {
        if (!this.mutedStyle) {
          this.mutedStyle = [];
        }
        if (!this.mutedStyle[level]) {
          this.mutedStyle[level] = (0, _merge.default)(true, defaultStyle[level].muted, this.providedStyle[level].muted ? this.providedStyle[level].muted : {});
        }
        style = this.mutedStyle[level];
      }
    } else if (isHighlighted) {
      style = (0, _merge.default)(true, defaultStyle[level].highlighted, this.providedStyle[level].highlighted ? this.providedStyle[level].highlighted : {});
    } else {
      if (!this.normalStyle) {
        this.normalStyle = [];
      }
      if (!this.normalStyle[level]) {
        this.normalStyle[level] = (0, _merge.default)(true, defaultStyle[level].normal, this.providedStyle[level].normal ? this.providedStyle[level].normal : {});
      }
      style = this.normalStyle[level];
    }
    return style;
  }
  renderAreas() {
    const {
      column
    } = this.props;
    const areas = [];
    const styles = [];
    styles[0] = this.style(column, event, 0); // eslint-disable-line
    styles[1] = this.style(column, event, 1); // eslint-disable-line
    styles[2] = this.style(column, event, 2); // eslint-disable-line

    // Use D3 to build an area generation function
    const areaGenerator = (0, _d3Shape.area)().curve(_curve.default[this.props.interpolation]).x(d => d.x0).y0(d => d.y0).y1(d => d.y1);
    const columns = this.series.columns();

    // How many areas are we drawing
    let hasInner = true;
    let hasOuter = true;
    if (_underscore.default.has(columns, "innerMin") || _underscore.default.has(columns, "innerMax")) {
      hasInner = false;
    }
    if (_underscore.default.has(columns, "outerMin") || _underscore.default.has(columns, "outerMax")) {
      hasOuter = false;
    }

    // Build the outer area if we have one
    if (hasOuter) {
      let level = 0;
      if (!hasInner) {
        level += 1;
      }
      const outerData = [];
      for (let j = 0; j < this.series.size(); j += 1) {
        const e = this.series.at(j);
        const timestamp = new Date(e.begin().getTime() + (e.end().getTime() - e.begin().getTime()) / 2);
        outerData.push({
          x0: this.props.timeScale(timestamp),
          y0: this.props.yScale(e.get("outerMin")),
          y1: this.props.yScale(e.get("outerMax"))
        });
      }
      const outerAreaPath = areaGenerator(outerData);
      areas.push(/*#__PURE__*/_react.default.createElement("g", {
        key: `area-outer`
      }, /*#__PURE__*/_react.default.createElement("path", {
        d: outerAreaPath,
        style: styles[level],
        onClick: e => this.handleClick(e, column),
        onMouseLeave: () => this.handleHoverLeave(),
        onMouseMove: e => this.handleHover(e, column)
      })));
    }
    if (hasInner) {
      let level = 0;
      if (!hasInner) {
        level += 1;
      }
      const innerData = [];
      for (let j = 0; j < this.series.size(); j += 1) {
        const e = this.series.at(j);
        const timestamp = new Date(e.begin().getTime() + (e.end().getTime() - e.begin().getTime()) / 2);
        innerData.push({
          x0: this.props.timeScale(timestamp),
          y0: this.props.yScale(e.get("innerMin")),
          y1: this.props.yScale(e.get("innerMax"))
        });
      }
      const innerAreaPath = areaGenerator(innerData);
      areas.push(/*#__PURE__*/_react.default.createElement("g", {
        key: `area-inner`
      }, /*#__PURE__*/_react.default.createElement("path", {
        d: innerAreaPath,
        style: styles[level],
        onClick: e => this.handleClick(e, column),
        onMouseLeave: () => this.handleHoverLeave(),
        onMouseMove: e => this.handleHover(e, column)
      })));
    }
    return /*#__PURE__*/_react.default.createElement("g", null, areas);
  }
  render() {
    return /*#__PURE__*/_react.default.createElement("g", null, this.renderAreas());
  }
}
exports.default = BandChart;
BandChart.propTypes = {
  /**
   * What [Pond TimeSeries](http://software.es.net/pond#timeseries)
   * data to visualize. See general notes on the BandChart.
   */
  series: _propTypes.default.instanceOf(_pondjs.TimeSeries).isRequired,
  /*
  series: (props, propName, componentName) => {
      const value = props[propName];
      if (!(value instanceof TimeSeries)) {
      return new Error(
          `A TimeSeries needs to be passed to ${componentName} as the 'series' prop.`
      );
      }
       // TODO: Better detection of errors
       // everything ok
      return null;
  },
  */

  /**
   * The column within the TimeSeries to plot. Unlike other charts, the BandChart
   * works on just a single column.
   * 
   * NOTE : Columns can't have periods because periods 
   * represent a path to deep data in the underlying events 
   * (i.e. reference into nested data structures)
   */
  column: _propTypes.default.string,
  /**
   * The aggregation specification. This object should contain:
   *   - innerMax
   *   - innerMin
   *   - outerMax
   *   - outerMin
   *   - center
   * Though each of the pairs, and center, is optional.
   * For each of these keys you should supply the function you
   * want to use to calculate these. You can import common functions
   * from Pond, e.g. min(), avg(), percentile(95), etc.
   *
   * For example:
   * ```
   *     {
   *       size: this.state.rollup,
   *       reducers: {
   *         outer: [min(), max()],
   *         inner: [percentile(25), percentile(75)],
   *         center: median(),
   *       },
   *     }
   * ```
   */
  aggregation: _propTypes.default.shape({
    size: _propTypes.default.string,
    reducers: _propTypes.default.shape({
      inner: _propTypes.default.arrayOf(_propTypes.default.func),
      // eslint-disable-line
      outer: _propTypes.default.arrayOf(_propTypes.default.func),
      // eslint-disable-line
      center: _propTypes.default.func // eslint-disable-line
    })
  }),
  // eslint-disable-line

  /**
   * The style of the box chart drawing (using SVG CSS properties) or
   * a styler object. It is recommended to user the styler unless you need
   * detailed customization.
   */
  style: _propTypes.default.oneOfType([_propTypes.default.object, _propTypes.default.func, _propTypes.default.instanceOf(_styler.Styler)]),
  /**
   * The style of the info box and connecting lines
   */
  infoStyle: _propTypes.default.object,
  //eslint-disable-line

  /**
   * The width of the hover info box
   */
  infoWidth: _propTypes.default.number,
  //eslint-disable-line

  /**
   * The height of the hover info box
   */
  infoHeight: _propTypes.default.number,
  //eslint-disable-line

  /**
   * The values to show in the info box. This is an array of
   * objects, with each object specifying the label and value
   * to be shown in the info box.
   */
  info: _propTypes.default.arrayOf(_propTypes.default.shape({
    //eslint-disable-line
    label: _propTypes.default.string,
    //eslint-disable-line
    value: _propTypes.default.string //eslint-disable-line
  })),
  /**
   * If spacing is specified, then the boxes will be separated from the
   * timerange boundary by this number of pixels. Use this to space out
   * the boxes from each other. Inner and outer boxes are controlled
   * separately.
   */
  innerSpacing: _propTypes.default.number,
  /**
   * If spacing is specified, then the boxes will be separated from the
   * timerange boundary by this number of pixels. Use this to space out
   * the boxes from each other. Inner and outer boxes are controlled
   * separately.
   */
  outerSpacing: _propTypes.default.number,
  /**
   * If size is specified, then the innerBox will be this number of pixels wide. This
   * prop takes priority over "spacing".
   */
  innerSize: _propTypes.default.number,
  /**
   * If size is specified, then the outer box will be this number of pixels wide. This
   * prop takes priority over "spacing".
   */
  outerSize: _propTypes.default.number,
  /**
   * The selected item, which will be rendered in the "selected" style.
   * If a bar is selected, all other bars will be rendered in the "muted" style.
   *
   * See also `onSelectionChange`
   */
  selected: _propTypes.default.instanceOf(_pondjs.IndexedEvent),
  /**
   * The highlighted item, which will be rendered in the "highlighted" style.
   *
   * See also `onHighlightChange`
   */
  highlighted: _propTypes.default.instanceOf(_pondjs.IndexedEvent),
  /**
   * A callback that will be called when the selection changes. It will be called
   * with the event corresponding to the box clicked as its only arg.
   */
  onSelectionChange: _propTypes.default.func,
  /**
   * A callback that will be called when the hovered over box changes.
   * It will be called with the event corresponding to the box hovered over.
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
BandChart.defaultProps = {
  column: "value",
  innerSpacing: 1.0,
  outerSpacing: 2.0,
  infoStyle: {
    stroke: "#999",
    fill: "white",
    opacity: 0.9,
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
  infoWidth: 90,
  infoHeight: 30
};