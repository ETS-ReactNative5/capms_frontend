import React, { Component } from "react";
import { placeLink } from "@dhtmlx/trial-lib-gantt";
import css from "./NewLink.module.css";

export default class NewLink extends Component {
  render() {
    const { layer, start, end } = this.props;
    const box = layer.getBoundingClientRect();
    const link = placeLink(box, start, end);
    const { left, top } = link;
    return (
      <>
        {link && (
          <svg
            className={css.new}
            width={link.width}
            height={link.height}
            style={{ left, top }}
          >
            <polyline className={css.line} points={link.p} />
          </svg>
        )}
      </>
    );
  }
}
