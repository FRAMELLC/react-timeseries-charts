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
 *  Copyright (c) 2016, The Regents of the University of California,
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
 * Renders a simple label surrounded by a box within in svg
 *
 *      +----------------+
 *      | My label       |
 *      |                |
 *      +----------------+
 */

const Label = _ref => {
  let {
    label,
    style,
    align,
    width,
    height
  } = _ref;
  const {
    boxStyle,
    labelStyle
  } = mergeStyles(style, align === "center");
  const posx = align === "center" ? parseInt(width / 2, 10) : 10;
  const text = /*#__PURE__*/_react.default.createElement("text", {
    x: posx,
    y: 5,
    dy: "1.2em",
    style: labelStyle
  }, label);
  const box = /*#__PURE__*/_react.default.createElement("rect", {
    x: 0,
    y: 0,
    style: boxStyle,
    width: width,
    height: height
  });
  return /*#__PURE__*/_react.default.createElement("g", null, box, text);
};
Label.defaultProps = {
  align: "center",
  width: 100,
  height: 100,
  pointerEvents: "none"
};
Label.propTypes = {
  /**
   * Where to position the label, either "left" or "center" within the box
   */
  align: _propTypes.default.oneOf(["center", "left"]),
  /**
   * The label to render
   */
  label: _propTypes.default.string.isRequired,
  /**
   * The style of the label. This is the inline CSS applied directly
   * to the label box
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
var _default = exports.default = Label;