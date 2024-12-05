"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
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
 * Renders a 'axis' that display a label for a current tracker value:
 * ```
 *      ----+----------------+
 *          |     56.2G      |
 *          |      bps       |
 *          |                |
 *      ----+----------------+
 * ```
 * This would be used when you have many rows of data and the user is required
 * to interact with the data to see actual values. You would use this at the
 * end of the row and supply it with the current value. See the cycling example
 * for how that would all work.
 */
const ValueAxis = _ref => {
  let {
    width,
    height,
    value,
    detail
  } = _ref;
  const labelStyle = {
    fill: "#666",
    fontSize: 20,
    textAnchor: "middle"
  };
  const detailStyle = {
    fontSize: 12,
    textAnchor: "middle",
    fill: "#9a9a9a"
  };
  return /*#__PURE__*/_react.default.createElement("g", null, /*#__PURE__*/_react.default.createElement("rect", {
    key: "background",
    x: "0",
    y: "0",
    width: width,
    height: height,
    style: {
      fill: "none",
      stroke: "none"
    }
  }), /*#__PURE__*/_react.default.createElement("text", {
    key: "value",
    x: parseInt(width / 2, 10),
    y: height / 2,
    style: labelStyle
  }, value), /*#__PURE__*/_react.default.createElement("text", {
    key: "detail",
    x: parseInt(width / 2, 10),
    y: height / 2,
    dy: "1.2em",
    style: detailStyle
  }, detail));
};
ValueAxis.propTypes = {
  /**
   * Show or hide this
   */
  visible: _propTypes.default.bool,
  /**
   * If values are numbers, use this format string
   */
  value: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.number]),
  /**
   * Use this to show what units are being used. It will appear below
   * the value.
   */
  detail: _propTypes.default.string,
  /**
   * The width of the axis
   */
  width: _propTypes.default.number,
  /**
   * [Internal] The height of the axis
   */
  height: _propTypes.default.number
};
ValueAxis.defaultProps = {
  visible: true
};
var _default = exports.default = ValueAxis;