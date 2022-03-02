import React, { Component } from "react";
import css from "./Links.module.css";

export default class Links extends Component {
  render() {
    const { links, width, height } = this.props;

    return (
      <svg className={css.links} style={{ width, height }}>
        {links.map((link) => (
          <polyline key={link.id} className={css.line} points={link.$p} />
        ))}
      </svg>
    );
  }
}
