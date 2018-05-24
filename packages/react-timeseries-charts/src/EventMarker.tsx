/**
 *  Copyright (c) 2016, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import * as _ from "lodash";
import * as React from "react";

import { index, Event, Index, TimeRange, Time, Key } from "pondjs";
import { timeFormat } from "d3-time-format";

import { ChartProps } from "./Charts";
import { InfoBox, InfoBoxProps } from "./info";
import { EventMarkerStyle, defaultEventMarkerStyle as defaultStyle } from "./style";
import { LabelValueList } from "./types";

// import "@types/d3-time-format";

const textStyle: React.CSSProperties = {
    fontSize: 11,
    textAnchor: "start",
    fill: "#bdbdbd",
    pointerEvents: "none"
};

type EventTimeProps = {
    time?: Date;
    format?: ((date: Date) => string) | string;
};

type EventTimeRangeProps = {
    timerange?: TimeRange;
    format?: ((date: Date) => string) | string;
};

type EventIndexProps = {
    index?: Index;
    format?: ((date: Date) => string) | string;
};

/**
 * Helper component to render a `time` in the `format` provided
 */
const EventTime: React.SFC<EventTimeProps> = ({ time, format = "%m/%d/%y %X" }) => {
    let text;
    if (_.isFunction(format)) {
        text = format(time);
    } else {
        const fmt = timeFormat(format);
        text = fmt(time);
    }
    return (
        <text x={0} y={0} dy="1.2em" style={textStyle}>
            {text}
        </text>
    );
};

/**
 * Helper component to render a `timerange` in the `format` provided
 */
const EventTimeRange: React.SFC<EventTimeRangeProps> = ({ timerange, format = "%m/%d/%y %X" }) => {
    const d1 = timerange.begin();
    const d2 = timerange.end();
    let beginText;
    let endText;
    if (_.isFunction(format)) {
        beginText = format(d1);
        endText = format(d2);
    } else {
        const fmt = timeFormat(format);
        beginText = fmt(d1);
        endText = fmt(d2);
    }
    return (
        <text x={0} y={0} dy="1.2em" style={textStyle}>
            {`${beginText} to ${endText}`}
        </text>
    );
};

/**
 * Helper component to render a `index`'s begin time in the `format` provided
 */
const EventIndex: React.SFC<EventIndexProps> = ({ index, format = "%m/%d/%y %X" }) => {
    console.log("index format is ", index, format);
    const textStyle: React.CSSProperties = {
        fontSize: 11,
        textAnchor: "start",
        fill: "#bdbdbd",
        pointerEvents: "none"
    };
    let text;
    if (_.isFunction(format)) {
        text = format(index.begin());
    } else if (_.isString(format)) {
        const fmt = timeFormat(format);
        text = fmt(index.begin());
    } else {
        text = index.toString();
    }
    return (
        <text x={0} y={0} dy="1.2em" style={textStyle}>
            {text}
        </text>
    );
};

export type EventMarkerProps = ChartProps & {
    event: Event<Key>;
    column?: string;
    type?: "point" | "flag";
    info?: LabelValueList | string;
    style?: EventMarkerStyle;
    infoWidth?: number;
    infoHeight?: number;
    infoTimeFormat?: ((date: Date) => string) | string;
    markerLabel?: string;
    markerLabelAlign?: "left" | "right" | "top" | "bottom";
    markerRadius?: number;
    yValueFunc?: (...args: any[]) => any;
    offsetX?: number;
    offsetY?: number;
};

/**
 * Renders a marker at a specific event on the chart.
 *
 * `EventMarker`s are made out of several structural components:
 *
 *  * the "marker" itself which appears at the time and value of the event.
 *    This is a dot whose radius is defined by `markerRadius`, and
 *    whose style is set with `style.marker`
 *  * the "marker label" which is a string that will be rendered next to
 *    the marker. The label can be aligned with `markerAlign` and also
 *    styled with `style.text`
 *  * the "info box" which is a box containing values that hovers at the
 *    top of the chart. Optionally it can show the time above the box.
 *    The values themselves are supplied as either array of label value
 *    pairs (a `LabelValueList`) or a simple label (a string) using the
 *    `info` prop. The info box can be styled with `style.box` and
 *    `style.text`, sized with `infoWidth` and `infoHeight`, and the time
 *    formatted with `infoTimeFormat`
 *  * the "stem" which is a connector between the marker and the
 *    info box to visually link the two, can be styled with `style.stem`.
 *
 * Combining these attributes, Event markers fall into two flavors, either
 * you want to omit the infoBox and mark the event with a dot and optionally
 * a label, or you want to omit the label (and perhaps marker dot) and show
 * a flag style marker with the info box connected to the Event with the stem.
 *
 * If the `Event` spans a time range, the marker will appear at
 * the center of the timerange represented by that event. You can, however,
 * override either the x or y position by a number of pixels.
 */
export class EventMarker extends React.Component<EventMarkerProps> {
    static defaultProps: Partial<EventMarkerProps> = {
        type: "flag",
        column: "value",
        style: defaultStyle,
        markerRadius: 2,
        markerLabelAlign: "left",
        offsetX: 0,
        offsetY: 0
    };

    renderTime(event: Event<Key>) {
        console.log("renderTime ", event.keyType(), this.props.infoTimeFormat);
        if (event.keyType() === "time") {
            return <EventTime time={event.timestamp()} format={this.props.infoTimeFormat} />;
        } else if (event.keyType() === "index") {
            return (
                <EventIndex
                    index={index(event.indexAsString())}
                    format={this.props.infoTimeFormat}
                />
            );
        } else if (event.keyType() === "timerange") {
            return (
                <EventTimeRange timerange={event.timerange()} format={this.props.infoTimeFormat} />
            );
        }
        return <g />;
    }

    renderMarker(event: Event<Key>, column: string, info: string | LabelValueList) {
        let t;
        console.log(event, column, info);
        if (event.keyType() === "time") {
            t = event.timestamp();
        } else {
            t = new Date(
                event.begin().getTime() + (event.end().getTime() - event.begin().getTime()) / 2
            );
        }
        let value;
        if (this.props.yValueFunc) {
            value = this.props.yValueFunc(event, column);
        } else {
            value = event.get(column);
        }

        // Allow overrides on the x and y position. This is useful for the `BarChart`
        // tracker because bars maybe offset from their actual event position in
        // order to display them side by side.
        const posx = this.props.timeScale(t) + this.props.offsetX;
        const posy = this.props.yScale(value) - this.props.offsetY;

        const { style } = this.props;

        const align: "left" | "center" = "left";
        const infoBoxProps = {
            align,
            style: {
                text: style.text,
                box: style.box
            },
            width: this.props.infoWidth,
            height: this.props.infoHeight
        };

        const w = this.props.infoWidth;
        const lineBottom = posy - 10;
        let verticalStem;
        let horizontalStem;
        let dot;
        let infoBox;
        let transform;
        let label;

        if (info) {
            infoBox = <InfoBox {...infoBoxProps} info={info} />;
        }

        if (this.props.type === "point") {
            let dx = 0;
            let dy = 0;

            let textDefaultStyle: any = {
                fontSize: 11,
                pointerEvents: "none",
                paintOrder: "stroke",
                fill: "#b0b0b0",
                strokeWidth: 2,
                strokeLinecap: "butt",
                strokeLinejoin: "miter",
                fontWeight: 800
            };

            switch (this.props.markerLabelAlign) {
                case "left":
                    dx = 5;
                    textDefaultStyle.textAnchor = "start";
                    textDefaultStyle.alignmentBaseline = "central";
                    break;
                case "right":
                    dx = -5;
                    textDefaultStyle.textAnchor = "end";
                    textDefaultStyle.alignmentBaseline = "central";
                    break;
                case "top":
                    dy = -5;
                    textDefaultStyle.textAnchor = "middle";
                    textDefaultStyle.alignmentBaseline = "bottom";
                    break;
                case "bottom":
                    dy = 5;
                    textDefaultStyle.textAnchor = "middle";
                    textDefaultStyle.alignmentBaseline = "hanging";
                    break;
                default:
            }

            const tstyle = _.merge(textDefaultStyle, this.props.style.text);

            dot = (
                <circle
                    cx={posx}
                    cy={posy}
                    r={this.props.markerRadius}
                    pointerEvents="none"
                    style={this.props.style.marker}
                />
            );
            label = (
                <text x={posx} y={posy} dx={dx} dy={dy} style={tstyle}>
                    {this.props.markerLabel}
                </text>
            );
            return (
                <g>
                    {dot}
                    {label}
                </g>
            );
        } else {
            if (posx + 10 + w < this.props.width * 3 / 4) {
                if (info) {
                    verticalStem = (
                        <line
                            pointerEvents="none"
                            style={this.props.style.stem}
                            x1={-10}
                            y1={lineBottom}
                            x2={-10}
                            y2={20}
                        />
                    );
                    horizontalStem = (
                        <line
                            pointerEvents="none"
                            style={this.props.style.stem}
                            x1={-10}
                            y1={20}
                            x2={-2}
                            y2={20}
                        />
                    );
                }
                dot = (
                    <circle
                        cx={-10}
                        cy={lineBottom}
                        r={this.props.markerRadius}
                        pointerEvents="none"
                        style={this.props.style.marker}
                    />
                );
                transform = `translate(${posx + 10},${10})`;
            } else {
                if (info) {
                    verticalStem = (
                        <line
                            pointerEvents="none"
                            style={this.props.style.stem}
                            x1={w + 10}
                            y1={lineBottom}
                            x2={w + 10}
                            y2={20}
                        />
                    );
                    horizontalStem = (
                        <line
                            pointerEvents="none"
                            style={this.props.style.stem}
                            x1={w + 10}
                            y1={20}
                            x2={w + 2}
                            y2={20}
                        />
                    );
                }
                dot = (
                    <circle
                        cx={w + 10}
                        cy={lineBottom}
                        r={this.props.markerRadius}
                        pointerEvents="none"
                        style={this.props.style.marker}
                    />
                );
                transform = `translate(${posx - w - 10},${10})`;
            }
            return (
                <g transform={transform}>
                    {verticalStem}
                    {horizontalStem}
                    {dot}
                    {this.renderTime(event)}
                    <g transform={`translate(0,${20})`}>{infoBox}</g>
                </g>
            );
        }
    }
    render() {
        const { event, column, info } = this.props;
        console.log("eventMarker this.props ", this.props);
        if (!event) {
            return <g />;
        }
        return <g>{this.renderMarker(event, column, info)}</g>;
    }
}