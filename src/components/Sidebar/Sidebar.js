import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { dismissAlert } from "../../actions/alerts";
import s from "./Sidebar.module.scss";
import LinksGroup from "./LinksGroup/LinksGroup";
import {
  changeActiveSidebarItem
} from "../../actions/navigation";
import { logoutUser } from "../../actions/user";

import lightTables from "../../images/tables.svg";
import darkTables from "../../images/tables-dark.svg";
import lightUI from "../../images/ui-elements.svg";
import darkUI from "../../images/ui-elements-dark.svg";
import logo from "../../images/logo.svg";
import chartDark from '../../images/icons/Charts_filled.svg'
import chartLight from '../../images/icons/Charts_outlined.svg'
import coreLight from '../../images/icons/Core_outlined.svg'
import coreDark from '../../images/icons/Core_filled.svg'
import documentationLight from '../../images/icons/Documentation_outlined.svg'
import documentationDark from '../../images/icons/Documentation_filled.svg'
import packLight from '../../images/icons/Package_outlined.svg'
import packDark from '../../images/icons/Package_filled.svg'
import formLight from '../../images/icons/Forms_outlined.svg'
import formDark from '../../images/icons/Forms_filled.svg'

class Sidebar extends React.Component {
  static propTypes = {
    sidebarStatic: PropTypes.bool,
    sidebarOpened: PropTypes.bool,
    dispatch: PropTypes.func.isRequired,
    activeItem: PropTypes.string,
    location: PropTypes.shape({
      pathname: PropTypes.string
    }).isRequired
  };

  static defaultProps = {
    sidebarStatic: true,
    sidebarOpened: true,
    activeItem: ""
  };

  constructor(props) {
    super(props);

    this.doLogout = this.doLogout.bind(this);
    this.state = {
      authority: JSON.parse(localStorage.getItem('userInfo')) ? JSON.parse(localStorage.getItem('userInfo')).authority : '',
    }
  }

  dismissAlert(id) {
    this.props.dispatch(dismissAlert(id));
  }

  doLogout() {
    this.props.dispatch(logoutUser());
  }

  goMain() {
    this.props.history.push("/app/main/dashboard");
  }

  render() {
    return (
        <div className={`${(!this.props.sidebarOpened && !this.props.sidebarStatic ) ? s.sidebarClose : ''} ${s.sidebarWrapper}`} id={"sidebar-drawer"}>
        <nav className={s.root} style={{ overflow: "scroll" }}>
          <header className={s.logo}>
            <img src={logo} alt="logo" className={s.logoStyle} />
            <span /*onClick={() => this.goMain()}*/ style={{fontSize: 1.5+'rem'}}>CA&nbsp;pms</span>
          </header>

          <ul className={s.home}>
          </ul>
          <ul className={s.nav}>
          {/* <LinksGroup
              onActiveSidebarItemChange={activeItem =>
                this.props.dispatch(changeActiveSidebarItem(activeItem))
              }
              activeItem={this.props.activeItem}
              header="홈"
              isHeader
              link="/app/schedule"
              index="main"
            >
              {window.location.href.includes("dashboard") ? (
                <img
                src={darkDashboardIcon}
                alt="lightDashboard"
                width={"24px"}
                height={"24px"}
                />
                ) : (
                  <img
                  src={lightDashboardIcon}
                  alt="lightDashboard"
                  width={"24px"}
                  height={"24px"}
                />
                )}
            </LinksGroup> */}
          {/* <h5 className={s.navTitle}>Project manager</h5> */}
          <LinksGroup
              onActiveSidebarItemChange={activeItem =>
                this.props.dispatch(changeActiveSidebarItem(activeItem))
              }
              activeItem={this.props.activeItem}
              header="프로젝트"
              isHeader
              link="/app/ui"
              index="ui"
              exact={false}
              childrenLinks={ this.state.authority === 0 || this.state.authority === 1 ? [
                {
                  header: "프로젝트 목록",
                  link: "/app/projects/list"
                },
                {
                  header: "WBS",
                  link: "/app/projects/wbs"
                },
                {
                  header: "주간보고",
                  link: "/app/projects/reports"
                },
                {
                  header: "회의록",
                  link: "/app/projects/meetings"
                }
              ] :
              [
                {
                  header: "주간보고",
                  link: "/app/projects/reports"
                },
                {
                  header: "회의록",
                  link: "/app/projects/meetings"
                }
              ]
              }
            >
              {window.location.href.includes("projects") ? (
                <img
                  src={darkUI}
                  alt="lightDashboard"
                  width={"24px"}
                  height={"24px"}
                />
              ) : (
                <img
                  src={lightUI}
                  alt="lightDashboard"
                  width={"24px"}
                  height={"24px"}
                />
              )}
            </LinksGroup>
            { this.state.authority === 0 || this.state.authority === 1 ? (
            <LinksGroup
              onActiveSidebarItemChange={activeItem =>
                this.props.dispatch(changeActiveSidebarItem(activeItem))
              }
              activeItem={this.props.activeItem}
              header="수주매출"
              isHeader
              link="/app/orderssales"
              index="main"
            >
              {window.location.href.includes("orderssales") ? (
                <img
                  src={chartDark}
                  alt="lightDashboard"
                  width={"24px"}
                  height={"24px"}
                />
              ) : (
                <img
                  src={chartLight}
                  alt="lightDashboard"
                  width={"24px"}
                  height={"24px"}
                />
              )}
            </LinksGroup>)
            : null}
            <LinksGroup
              onActiveSidebarItemChange={activeItem =>
                this.props.dispatch(changeActiveSidebarItem(activeItem))
              }
              activeItem={this.props.activeItem}
              header="교육관리"
              isHeader
              link="/app/education"
              index="main"
            >
              {window.location.href.includes("education") ? (
                <img
                  src={documentationDark}
                  alt="lightDashboard"
                  width={"24px"}
                  height={"24px"}
                />
              ) : (
                <img
                  src={documentationLight}
                  alt="lightDashboard"
                  width={"24px"}
                  height={"24px"}
                />
              )}
            </LinksGroup>
            <LinksGroup
              onActiveSidebarItemChange={activeItem =>
                this.props.dispatch(changeActiveSidebarItem(activeItem))
              }
              activeItem={this.props.activeItem}
              header="자산관리"
              isHeader
              link="/app/equipments"
              index="main"
            >
              {window.location.href.includes("equipments") ? (
                <img
                  src={packDark}
                  alt="lightDashboard"
                  width={"24px"}
                  height={"24px"}
                />
              ) : (
                <img
                  src={packLight}
                  alt="lightDashboard"
                  width={"24px"}
                  height={"24px"}
                />
              )}
            </LinksGroup>
            { this.state.authority === 0 || this.state.authority === 1 ? (
            <LinksGroup
              onActiveSidebarItemChange={activeItem =>
                this.props.dispatch(changeActiveSidebarItem(activeItem))
              }
              activeItem={this.props.activeItem}
              header="프로젝트룸"
              isHeader
              link="/app/reservation"
              index="main"
            >
              {window.location.href.includes("reservation") ? (
                <img
                  src={formDark}
                  alt="lightDashboard"
                  width={"24px"}
                  height={"24px"}
                />
              ) : (
                <img
                  src={formLight}
                  alt="lightDashboard"
                  width={"24px"}
                  height={"24px"}
                />
              )}
            </LinksGroup>
            ) : null }
          </ul>
          <ul className={s.nav}>
            { this.state.authority === 0 || this.state.authority === 1 ? (
            <LinksGroup
              onActiveSidebarItemChange={activeItem =>
                this.props.dispatch(changeActiveSidebarItem(activeItem))
              }
              activeItem={this.props.activeItem}
              header="관리자스케줄"
              isHeader
              link="/app/schedule"
              index="main"
            >
              {window.location.href.includes("schedule") ? (
                <img
                  src={darkTables}
                  alt="darkTables"
                  width={"24px"}
                  height={"24px"}
                />
              ) : (
                <img
                  src={lightTables}
                  alt="lightTables"
                  width={"24px"}
                  height={"24px"}
                />
              )}
            </LinksGroup>)
            : null}
            <LinksGroup
              onActiveSidebarItemChange={activeItem =>
                this.props.dispatch(changeActiveSidebarItem(activeItem))
              }
              activeItem={this.props.activeItem}
              header="조직도"
              isHeader
              link="/app/organization"
              index="main"
            >
              {window.location.href.includes("organization") ? (
                <img
                  src={coreDark}
                  alt="lightDashboard"
                  width={"24px"}
                  height={"24px"}
                />
              ) : (
                <img
                  src={coreLight}
                  alt="lightDashboard"
                  width={"24px"}
                  height={"24px"}
                />
              )}
            </LinksGroup>
          </ul>
          <ul className={s.downNav}>
          </ul>
        </nav>
      </div>
    );
  }
}

function mapStateToProps(store) {
  return {
    sidebarOpened: store.navigation.sidebarOpened,
    sidebarStatic: store.navigation.sidebarStatic,
    alertsList: store.alerts.alertsList,
    activeItem: store.navigation.activeItem,
    navbarType: store.navigation.navbarType,
  };
}

export default withRouter(connect(mapStateToProps)(Sidebar));
