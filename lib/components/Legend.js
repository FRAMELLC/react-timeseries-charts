"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _underscore = _interopRequireDefault(require("underscore"));
var _merge = _interopRequireDefault(require("merge"));
var _react = _interopRequireDefault(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _styler = require("../js/styler");
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
  symbol: {
    normal: {
      stroke: "steelblue",
      fill: "none",
      strokeWidth: 1
    },
    highlighted: {
      stroke: "#5a98cb",
      fill: "none",
      strokeWidth: 1
    },
    selected: {
      stroke: "steelblue",
      fill: "none",
      strokeWidth: 2
    },
    muted: {
      stroke: "steelblue",
      fill: "none",
      opacity: 0.4,
      strokeWidth: 1
    }
  },
  label: {
    normal: {
      fontSize: "normal",
      color: "#333"
    },
    highlighted: {
      fontSize: "normal",
      color: "#222"
    },
    selected: {
      fontSize: "normal",
      color: "#333"
    },
    muted: {
      fontSize: "normal",
      color: "#333",
      opacity: 0.4
    }
  },
  value: {
    normal: {
      fontSize: "normal",
      color: "#333"
    },
    highlighted: {
      fontSize: "normal",
      color: "#222"
    },
    selected: {
      fontSize: "normal",
      color: "#333"
    },
    muted: {
      fontSize: "normal",
      color: "#333",
      opacity: 0.4
    }
  }
};

/**
 * Legends are simple to define.
 *
 * First specify the styles you want each item to have. This is either
 * the CSS that should be appied to rendered symbol. Or you can provide
 * a Styler object. See below for full styling details.
 *
 * ```
 * const style = Styler([
 *     {key: "aud", color: "steelblue", width: 1, dashed: true},
 *     {key: "euro", color: "#F68B24", width: 2}
 * ]);
 * ```
 *
 * Next build a list of categories you want in the legend.
 *
 * ```
 * const categories = [
 *     {key: "aust", label: "AUD", value: "1.52", disabled: true},
 *     {key: "usa", label: "USD", value: "1.43", disabled: false}
 * ];
 * ```
 * For each category to display you must provide a key, a label and
 * if it should be displayed disabled or not.
 *
 * Then render the legend, with type either "line", "swatch" or "dot":
 *
 * ```
 * <Legend type="line" style={style} categories={categories} />
 * ```
 *
 * Optionally you can also display a value below the label. This is
 * useful when hovering over another chart on the page, or to display
 * the current value of live data. You can see this defined in the
 * above categories.
 *
 * The legend can also be supplied with callback functions which will
 * tell you if the user has clicked or hovered over on one of the legend
 * items. You can use this to sync highlighting and selection to a
 * chart.
 *
 * ## Styling
 *
 * There are three methods of styling a legend:
 *  - using a Styler object
 *  - using an object containing inline styles
 *  - using a function which returns an inline style
 *
 * A Styler object can be supplied directly to the `style` prop
 * of the legend. This is the simplest approach, since you can
 * usually just use the same Styler as you use for your chart.
 *
 * Supplying an object to the `style` prop gives you more control
 * than the Styler, since you can provide the actual CSS properties
 * for each element of the legend. The format for the object is:
 *
 * ```
 * {
 *     columnName1: {
      symbol: {
        normal: {...styleSymbol},
        highlighted: {...styleSymbol},
        selected: {...styleSymbol},
        muted: {...styleSymbol}
      },
      label: {
        normal: {...labelStyle},
        highlighted: {...labelStyle},
        selected: {...labelStyle},
        muted: {...labelStyle}
      },
      value: {
        normal: {...valueStyle},
        highlighted: {...valueStyle},
        selected: {...valueStyle},
        muted: {...valueStyle}
      }
 *     },
 *     columnName2 : {
 *         ...
 *     },
 *     ...
 *  }
 *
 *  - symbolStyle is the CSS properties for the symbol, which
 * is either a swatch, dot or line. For a line, you'd want to
 * provide the SVG <line> properties, for a swatch you'd provide
 * the SVG <rect> properties and for a dot the <ellipse> properties.
 *  - labelStyle is the main label for the legend item. It is a
 *  SVG <text> element, so you can control the font properties.
 *  - valueStyle is the optional value. As with the labelStyle you
 *  this is an SVG <text> element.
 *
 * Finally, you can provide a function to the `style` prop. This
 * is similar to providing an object, except your function will
 * be called with the columnName and you should return the map
 * containing symbol, label and value styles.
 */

class LegendItem extends _react.default.Component {
  handleClick(e, key) {
    e.stopPropagation();
    if (this.props.onSelectionChange) {
      this.props.onSelectionChange(key);
    }
  }
  handleHover(e, key) {
    if (this.props.onHighlightChange) {
      this.props.onHighlightChange(key);
    }
  }
  handleHoverLeave() {
    if (this.props.onHighlightChange) {
      this.props.onHighlightChange(null);
    }
  }
  renderLine(style) {
    const {
      symbolWidth,
      symbolHeight
    } = this.props;
    return /*#__PURE__*/_react.default.createElement("svg", {
      style: {
        float: "left"
      },
      width: symbolWidth,
      height: symbolHeight
    }, /*#__PURE__*/_react.default.createElement("line", {
      style: style,
      x1: 0,
      y1: parseInt(symbolWidth / 2, 10),
      x2: symbolWidth,
      y2: parseInt(symbolWidth / 2, 10),
      stroke: "black",
      strokeWidth: "2"
    }));
  }
  renderSwatch(style) {
    const {
      symbolWidth,
      symbolHeight
    } = this.props;
    return /*#__PURE__*/_react.default.createElement("svg", {
      style: {
        float: "left"
      },
      width: symbolWidth,
      height: symbolHeight
    }, /*#__PURE__*/_react.default.createElement("rect", {
      style: style,
      x: 2,
      y: 2,
      width: symbolWidth - 4,
      height: symbolHeight - 4,
      rx: 2,
      ry: 2
    }));
  }
  renderDot(style) {
    const {
      symbolWidth,
      symbolHeight
    } = this.props;
    const w = parseInt(symbolWidth / 2, 10);
    const h = parseInt(symbolHeight / 2, 10);
    const radius = w * 0.75;
    return /*#__PURE__*/_react.default.createElement("svg", {
      style: {
        float: "left"
      },
      width: symbolWidth,
      height: symbolHeight
    }, /*#__PURE__*/_react.default.createElement("circle", {
      style: style,
      cx: w,
      cy: h,
      r: radius
    }));
  }
  render() {
    const {
      symbolStyle,
      labelStyle,
      valueStyle,
      itemKey,
      symbolType
    } = this.props;
    let symbol;
    switch (symbolType) {
      case "swatch":
        symbol = this.renderSwatch(symbolStyle);
        break;
      case "line":
        symbol = this.renderLine(symbolStyle);
        break;
      case "dot":
        symbol = this.renderDot(symbolStyle);
        break;
      default:
      //pass
    }

    // TODO: We shouldn't be adding interactions to a element like this.
    //       The alternative it to put it on a <a> or something?

    return /*#__PURE__*/_react.default.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column"
      },
      key: itemKey,
      onClick: e => this.handleClick(e, itemKey),
      onMouseMove: e => this.handleHover(e, itemKey),
      onMouseLeave: () => this.handleHoverLeave()
    }, /*#__PURE__*/_react.default.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center"
      }
    }, /*#__PURE__*/_react.default.createElement("div", {
      style: {
        width: "20px"
      }
    }, symbol), /*#__PURE__*/_react.default.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column"
      }
    }, /*#__PURE__*/_react.default.createElement("div", {
      style: labelStyle
    }, this.props.label), /*#__PURE__*/_react.default.createElement("div", {
      style: valueStyle
    }, this.props.value))));
  }
}
class Legend extends _react.default.Component {
  handleClick(e, key) {
    e.stopPropagation();
    if (this.props.onSelectionChange) {
      this.props.onSelectionChange(key);
    }
  }
  handleHover(e, key) {
    if (this.props.onHighlightChange) {
      this.props.onHighlightChange(key);
    }
  }
  handleHoverLeave() {
    if (this.props.onHighlightChange) {
      this.props.onHighlightChange(null);
    }
  }

  /**
   * For each category item we get the users stle preference. This
   * can be supplied in a number of ways:
   *  * Typically you would get the legend stle from a Style instance
   *  * Alternatively, you can pass in a style object which has your
   *    category in it and the associated style
   *  * Finally, the provided style can also be a function
   */
  providedStyle(category, type) {
    let style = {};
    if (this.props.style) {
      if (this.props.style instanceof _styler.Styler) {
        style = this.props.style.legendStyle(category.key, type);
      } else if (_underscore.default.isFunction(this.props.style)) {
        style = this.props.style(category.key);
      } else if (_underscore.default.isObject(this.props.style)) {
        style = this.props.style ? this.props.style[category.key] : defaultStyle;
      }
    }
    return style;
  }

  /**
   * For each category this function takes the current
   * selected and highlighted item, along with the disabled
   * state of the item, and returns the mode it should be
   * rendered in: normal, selected, highlighted, or muted
   */
  styleMode(category) {
    const isHighlighted = this.props.highlight && category.key === this.props.highlight;
    const isSelected = this.props.selection && category.key === this.props.selection;
    const isDisabled = category.disabled;
    let mode = "normal";
    if (this.props.selection) {
      if (isSelected) {
        mode = "selected";
      } else if (isHighlighted) {
        mode = "highlighted";
      } else {
        mode = "muted";
      }
    } else if (isHighlighted) {
      mode = "highlighted";
    } else if (isDisabled) {
      mode = "muted";
    }
    return mode;
  }
  symbolStyle(category, type) {
    const styleMap = this.providedStyle(category, type);
    const styleMode = this.styleMode(category);
    return (0, _merge.default)(true, defaultStyle[styleMode], styleMap.symbol ? styleMap.symbol[styleMode] : {});
  }
  labelStyle(category) {
    const styleMap = this.providedStyle(category);
    const styleMode = this.styleMode(category);
    return (0, _merge.default)(true, defaultStyle[styleMode], styleMap.label ? styleMap.label[styleMode] : {});
  }
  valueStyle(category) {
    const styleMap = this.providedStyle(category);
    const styleMode = this.styleMode(category);
    return (0, _merge.default)(true, defaultStyle[styleMode], styleMap.value ? styleMap.value[styleMode] : {});
  }
  render() {
    const {
      type = "swatch",
      symbolWidth,
      symbolHeight
    } = this.props;
    const items = this.props.categories.map(category => {
      const {
        key,
        label,
        value,
        symbolType = type
      } = category;
      const symbolStyle = this.symbolStyle(category, symbolType);
      const labelStyle = this.labelStyle(category);
      const valueStyle = this.valueStyle(category);
      return /*#__PURE__*/_react.default.createElement(LegendItem, {
        key: key,
        type: type,
        itemKey: key,
        label: label,
        value: value,
        symbolType: symbolType,
        symbolWidth: symbolWidth,
        symbolHeight: symbolHeight,
        symbolStyle: symbolStyle,
        labelStyle: labelStyle,
        valueStyle: valueStyle,
        onSelectionChange: this.props.onSelectionChange,
        onHighlightChange: this.props.onHighlightChange
      });
    });
    const align = this.props.align === "left" ? "flex-start" : "flex-end";
    if (this.props.stack) {
      return /*#__PURE__*/_react.default.createElement("div", {
        style: {
          display: "flex",
          justifyContent: align,
          flexDirection: "column",
          marginBottom: this.props.marginBottom
        }
      }, items);
    } else {
      return /*#__PURE__*/_react.default.createElement("div", {
        style: {
          display: "flex",
          justifyContent: align,
          flexWrap: "wrap",
          marginBottom: this.props.marginBottom
        }
      }, items);
    }
  }
}
exports.default = Legend;
Legend.propTypes = {
  /**
   * The overall style of the legend items, either a color "swatch", a
   * colored "line", or a "dot".
   */
  type: _propTypes.default.oneOf(["swatch", "line", "dot"]),
  /**
   * Alignment of the legend within the available space. Either left or right.
   */
  align: _propTypes.default.oneOf(["left", "right"]),
  style: _propTypes.default.oneOfType([_propTypes.default.object, _propTypes.default.func, _propTypes.default.instanceOf(_styler.Styler)]),
  /**
   * The categories array specifies details and style for each item in the legend. For each item:
   *  * "key" - (required) the name by which the legend will be known
   *  * "label" - (required) the displayed label
   *  * "style" - the swatch, dot, or line style. Typically you'd just
   *              specify {backgroundColor: "#1f77b4"}
   *  * "labelStyle" - the label style
   *  * "disabled" - a disabled state
   *
   * ```
   * const categories = [
   *    {key: "aust", label: "AUD", disabled: this.state.disabled["aust"],
   *      style: {backgroundColor: "#1f77b4"}},
   *    {key: "usa", label: "USD", disabled: this.state.disabled["usa"],
   *      style: {backgroundColor: "#aec7e8"}}
   * ];
   * ```
   */
  categories: _propTypes.default.arrayOf(_propTypes.default.shape({
    key: _propTypes.default.string.isRequired,
    // eslint-disable-line
    label: _propTypes.default.string.isRequired,
    // eslint-disable-line
    disabled: _propTypes.default.bool,
    // eslint-disable-line
    style: _propTypes.default.object,
    // eslint-disable-line
    labelStyle: _propTypes.default.object // eslint-disable-line
  })).isRequired,
  /**
   * The width of the legend symbol
   */
  symbolWidth: _propTypes.default.number,
  /**
   * The height of the legend symbol
   */
  symbolHeight: _propTypes.default.number,
  /**
   * Which item, specified by its key, should be rendered as highlighted
   */
  highlight: _propTypes.default.string,
  /**
   * Which item, specified by its key, should be rendered as selected
   */
  selection: _propTypes.default.string,
  /**
   * Callback will be called with a legend item is selected (i.e. it is clicked
   * on by the user)
   */
  onSelectionChange: _propTypes.default.func,
  /**
   * Callback will be called with a legend item is highlighted (i.e. it is hovered
   * over by the user)
   */
  onHighlightChange: _propTypes.default.func,
  /**
   * Defines whether to stack legend items vertically or not
   */
  stack: _propTypes.default.bool,
  /**
   * The margin at the bottom. Default value is 20px
   */
  marginBottom: _propTypes.default.string
};
Legend.defaultProps = {
  style: {},
  labelStyle: {},
  type: "swatch",
  // or "line" or "dot"
  align: "left",
  symbolWidth: 16,
  symbolHeight: 16,
  stack: false,
  marginBottom: "20px"
};