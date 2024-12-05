"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
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
/**
 * This takes a single child and inserts a prop 'width' on it that is the
 * current width of the this container. This is handy if you want to surround
 * a chart or other svg diagram and have this drive the chart width.
 */
class Resizable extends _react.default.Component {
  constructor(props) {
    super(props);
    this.state = {
      width: 0
    };
    this.handleResize = this.handleResize.bind(this);
  }
  componentDidMount() {
    window.addEventListener("resize", this.handleResize);
    this.handleResize();
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
  }
  handleResize() {
    if (this.container) {
      this.setState({
        width: this.container.offsetWidth
      });
    }
  }
  render() {
    const child = _react.default.Children.only(this.props.children);
    const childElement = this.state.width ? /*#__PURE__*/_react.default.cloneElement(child, {
      width: this.state.width
    }) : null;
    return /*#__PURE__*/_react.default.createElement("div", _extends({
      ref: c => {
        this.container = c;
      }
    }, this.props), childElement);
  }
}
exports.default = Resizable;
Resizable.propTypes = {
  children: _propTypes.default.node
};