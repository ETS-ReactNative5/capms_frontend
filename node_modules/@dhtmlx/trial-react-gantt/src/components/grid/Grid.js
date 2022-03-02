import React, { Component } from "react";
import Header from "./Header";
import Body from "./Body";
import css from "./Grid.module.css";

class Grid extends Component {
  constructor() {
    super();

    this.state = {
      showFull: false,
    };
  }

  componentDidUpdate(prev) {
    if (this.props.compactMode != prev.compactMode && !this.props.compactMode)
      this.setState({ showFull: false });
  }

  action(ev) {
    const { action } = ev;

    switch (action) {
      case "toggle-grid":
        this.setState({ showFull: !this.state.showFull });
        break;

      default:
        this.props.action(ev);
        break;
    }
  }

  render() {
    const {
      compactMode,
      width,
      tasks,
      columns,
      scales,
      scrollTop,
      scrollDelta,
      cellHeight,
      selected,
    } = this.props;

    const { showFull } = this.state;

    const cols = compactMode
      ? [columns[columns.length - 1], ...columns.slice(0, columns.length - 1)]
      : columns;

    const basis = showFull ? "100%" : `${width}px`;

    return (
      <div className={css.grid} style={{ flex: `0 0 ${basis}` }}>
        <Header
          compactMode={compactMode}
          columns={cols}
          height={scales.height}
          action={(ev) => this.action(ev)}
        />

        <Body
          tasks={tasks}
          columns={cols}
          cellHeight={cellHeight}
          scrollTop={scrollTop}
          scrollDelta={scrollDelta}
          selected={selected}
          action={(ev) => this.action(ev)}
        />
      </div>
    );
  }
}

export default Grid;
