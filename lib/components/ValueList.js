"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _merge = _interopRequireDefault(require("merge"));
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

const defaultBoxStyle = {
  fill: "#FEFEFE",
  stroke: "#DDD",
  opacity: 0.8
};
const defaultTextStyle = {
  fontSize: 11,
  textAnchor: "left",
  fill: "#b0b0b0",
  pointerEvents: "none"
};
const defaultTextStyleCentered = {
  fontSize: 11,
  textAnchor: "middle",
  fill: "#bdbdbd",
  pointerEvents: "none"
};
function mergeStyles(style, isCentered) {
  return {
    boxStyle: (0, _merge.default)(true, defaultBoxStyle, style.box ? style.box : {}),
    labelStyle: (0, _merge.default)(true, isCentered ? defaultTextStyleCentered : defaultTextStyle, style.label ? style.label : {})
  };
}

/**
 * Renders a list of values in svg
 *
 *      +----------------+
 *      | Max 100 Gbps   |
 *      | Avg 26 Gbps    |
 *      +----------------+
 */
const ValueList = props => {
  const {
    align,
    style,
    width,
    height
  } = props;
  const {
    boxStyle,
    labelStyle
  } = mergeStyles(style, align === "center");
  if (!props.values.length) {
    return /*#__PURE__*/_react.default.createElement("g", null);
  }
  const values = props.values.map((item, i) => {
    if (align === "left") {
      return /*#__PURE__*/_react.default.createElement("g", {
        key: i
      }, /*#__PURE__*/_react.default.createElement("text", {
        x: 10,
        y: 5,
        dy: `${(i + 1) * 1.2}em`,
        style: labelStyle
      }, /*#__PURE__*/_react.default.createElement("tspan", {
        style: {
          fontWeight: 700
        }
      }, `${item.label}: `), /*#__PURE__*/_react.default.createElement("tspan", null, `${item.value}`)));
    }
    const posx = parseInt(props.width / 2, 10);
    return /*#__PURE__*/_react.default.createElement("g", {
      key: i
    }, /*#__PURE__*/_react.default.createElement("text", {
      x: posx,
      y: 5,
      dy: `${(i + 1) * 1.2}em`,
      style: labelStyle
    }, /*#__PURE__*/_react.default.createElement("tspan", {
      style: {
        fontWeight: 700
      }
    }, `${item.label}: `), /*#__PURE__*/_react.default.createElement("tspan", null, `${item.value}`)));
  });
  const box = /*#__PURE__*/_react.default.createElement("rect", {
    style: boxStyle,
    x: 0,
    y: 0,
    width: width,
    height: height
  });
  return /*#__PURE__*/_react.default.createElement("g", null, box, values);
};
ValueList.defaultProps = {
  align: "center",
  width: 100,
  height: 100,
  pointerEvents: "none",
  style: {
    fill: "#FEFEFE",
    stroke: "#DDD",
    opacity: 0.8
  }
};
ValueList.propTypes = {
  /**
   * Where to position the label, either "left" or "center" within the box
   */
  align: _propTypes.default.oneOf(["center", "left"]),
  /**
   * An array of label value pairs to render
   */
  values: _propTypes.default.arrayOf(_propTypes.default.shape({
    label: _propTypes.default.string,
    // eslint-disable-line
    value: _propTypes.default.oneOfType([
    // eslint-disable-line
    _propTypes.default.number, _propTypes.default.string])
  })).isRequired,
  /**
   * CSS object to be applied to the ValueList surrounding box and the label (text).
   */
  style: _propTypes.default.object,
  // eslint-disable-line

  /**
   * The width of the rectangle to render into
   */
  width: _propTypes.default.number,
  /**
   * The height of the rectangle to render into
   */
  height: _propTypes.default.number
};
var _default = exports.default = ValueList;