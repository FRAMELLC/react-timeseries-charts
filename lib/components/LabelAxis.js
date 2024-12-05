"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _d3Format = require("d3-format");
var _merge = _interopRequireDefault(require("merge"));
var _ValueList = _interopRequireDefault(require("./ValueList"));
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
  axis: {
    fontSize: 11,
    textAnchor: "left",
    fill: "#bdbdbd"
  },
  label: {
    fontSize: 12,
    textAnchor: "middle",
    fill: "#838383"
  },
  values: {
    fill: "none",
    stroke: "none"
  }
};

/**
 * Renders an 'axis' that displays a label for a data channel along with a
 * max and average value:
 * ```
 *      +----------------+-----+------- ...
 *      | Traffic        | 120 |
 *      | Max 100 Gbps   |     | Chart  ...
 *      | Avg 26 Gbps    | 0   |
 *      +----------------+-----+------- ...
 * ```
 *
 * This can be used for data channel style displays where the user will see many
 * rows of data stacked on top of each other and will need to interact with the
 * data to see actual values. You can combine this with the `ValueAxis` to help
 * do that. See the Cycling example for exactly how to arrange that.
 *
 */
class LabelAxis extends _react.default.Component {
  mergeStyles(style) {
    return {
      axisStyle: (0, _merge.default)(true, defaultStyle.axis, this.props.style.axis ? this.props.style.axis : {}),
      labelStyle: (0, _merge.default)(true, defaultStyle.label, this.props.style.label ? this.props.style.label : {}),
      valueStyle: (0, _merge.default)(true, defaultStyle.values, this.props.style.values ? this.props.style.values : {})
    };
  }
  renderAxis(axisStyle) {
    const valueWidth = this.props.valWidth;
    const rectWidth = this.props.width - valueWidth;
    if (this.props.hideScale) {
      return /*#__PURE__*/_react.default.createElement("g", null);
    }
    const valXPos = rectWidth + 3; // padding
    const fmt = this.props.format;
    const maxStr = (0, _d3Format.format)(fmt)(this.props.max);
    const minStr = (0, _d3Format.format)(fmt)(this.props.min);
    return /*#__PURE__*/_react.default.createElement("g", null, /*#__PURE__*/_react.default.createElement("text", {
      x: valXPos,
      y: 0,
      dy: "1.2em",
      style: axisStyle
    }, maxStr), /*#__PURE__*/_react.default.createElement("text", {
      x: valXPos,
      y: this.props.height,
      style: axisStyle
    }, minStr));
  }
  render() {
    const valueWidth = this.props.valWidth;
    const rectWidth = this.props.width - valueWidth;
    const style = this.mergeStyles(this.props.style);
    const {
      axisStyle,
      labelStyle,
      valueStyle
    } = style;
    let valueList = null;
    let labelYPos;
    if (this.props.values) {
      labelYPos = Math.max(parseInt(this.props.height / 4, 10), 10);
      valueList = /*#__PURE__*/_react.default.createElement(_ValueList.default, {
        style: valueStyle,
        values: this.props.values,
        width: rectWidth
      });
    } else {
      labelYPos = parseInt(this.props.height / 2, 10);
    }
    return /*#__PURE__*/_react.default.createElement("g", null, /*#__PURE__*/_react.default.createElement("rect", {
      x: "0",
      y: "0",
      width: rectWidth,
      height: this.props.height,
      style: {
        fill: "none",
        stroke: "none"
      }
    }), /*#__PURE__*/_react.default.createElement("text", {
      x: parseInt(rectWidth / 2, 10),
      y: labelYPos,
      style: labelStyle
    }, this.props.label), /*#__PURE__*/_react.default.createElement("g", {
      transform: `translate(0,${labelYPos + 2})`
    }, valueList), this.renderAxis(axisStyle));
  }
}
exports.default = LabelAxis;
LabelAxis.propTypes = {
  /**
   * The label to show as the axis.
   */
  label: _propTypes.default.string.isRequired,
  /**
   * Show or hide the max/min values that appear alongside the label
   */
  hideScale: _propTypes.default.bool,
  /**
   * Supply a list of label value pairs to render within the LabelAxis.
   * This expects an array of objects. Each object is of the form:
   *     {label: "Speed", value: "26.2 mph"}.
   */
  values: _propTypes.default.arrayOf(_propTypes.default.shape({
    label: _propTypes.default.string,
    // eslint-disable-line
    value: _propTypes.default.oneOfType([
    // eslint-disable-line
    _propTypes.default.number, _propTypes.default.string])
  })).isRequired,
  /**
   * Width to provide the values
   */
  valWidth: _propTypes.default.number,
  /**
   * Max value of the axis scale
   */
  max: _propTypes.default.number.isRequired,
  /**
   * Min value of the axis scale
   */
  min: _propTypes.default.number.isRequired,
  /**
   * If values are numbers, use this format string
   */
  format: _propTypes.default.string,
  /**
   * The width of the axis
   */
  width: _propTypes.default.number,
  /**
   * The height of the axis
   */
  height: _propTypes.default.number,
  /**
   * Object specifying the CSS by which the label axis can be styled. The object can contain:
   * "label", "values" and "axis". Each of these is an inline CSS style applied
   * to the axis label, axis values and axis line respectively.
   *
   */
  style: _propTypes.default.shape({
    axis: _propTypes.default.object,
    // eslint-disable-line
    label: _propTypes.default.object,
    // eslint-disable-line
    values: _propTypes.default.object // esline-disable-line
  })
};
LabelAxis.defaultProps = {
  hideScale: false,
  values: [],
  valWidth: 40,
  format: ".2f",
  style: defaultStyle
};