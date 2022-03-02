import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Switch, Route, withRouter, Redirect } from "react-router";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import Hammer from "rc-hammerjs";

import Header from "../Header";
import Sidebar from "../Sidebar";
import {
  openSidebar,
  closeSidebar,
  toggleSidebar,
} from "../../actions/navigation";
import s from "./Layout.module.scss";

// pages
import Dashboard from "../../pages/Dashboard/Dashboard";
import Icons from "../../pages/Icons/Icons";

// 마이페이지, 관리자페이지
import MyPage from "../../pages/MyPage/MyPage";
import Manages from "../../pages/Management/Manages";
// 프로젝트 - 목록
import ProjectList from "../../pages/ProjectList/ProjectList"
import NewProject from "../../pages/ProjectList/NewProject";
import DetailProject from "../../pages/ProjectList/DetailProject";
// 프로젝트 - WBS
import WbsList from "../../pages/WBS/WbsList";
import Wbs from "../../pages/WBS/Wbs";
// 프로젝트 - 주간보고
import ReportList from "../../pages/Report/ReportList";
import NewReport from "../../pages/Report/NewReport";
import DetailReport from "../../pages/Report/DetailReport";
// 프로젝트 - 회의록
import Meeting from "../../pages/Meeting/Meeting";
import NewMeeting from "../../pages/Meeting/NewMeeting";
import DetailMeeting from "../../pages/Meeting/DetailMeeting";
// 수주매출
import OrdersSales from "../../pages/OrdersSales/OrdersSales";
// 교육관리
import Education from "../../pages/Education/Education";
import EducationDetail from "../../pages/Education/EducationDetail"
// 자산관리
import Equips from "../../pages/Equipment/Equips";
// 프로젝트룸 예약
import Reservation from "../../pages/Reservation/Reservation";
// 관리자스케줄
import ManagerSchedule from "../../pages/ManagerSchedule/ManagerSchedule";
import NewSchedule from "../../pages/ManagerSchedule/NewSchedule";
import NewScheduleWeek from "../../pages/ManagerSchedule/NewScheduleWeek";
import DetailSchedule from "../../pages/ManagerSchedule/DetailSchedule";
// 조직도
import Organization from "../../pages/Organization/Organization";


class Layout extends React.Component {
  static propTypes = {
    sidebarStatic: PropTypes.bool,
    sidebarOpened: PropTypes.bool,
    dispatch: PropTypes.func.isRequired,
  };

  static defaultProps = {
    sidebarStatic: true,
    sidebarOpened: true,
  };

  constructor(props) {
    super(props);

    this.handleSwipe = this.handleSwipe.bind(this);
    this.handleCloseSidebar = this.handleCloseSidebar.bind(this);
  }

  componentDidMount() {
    this.handleResize();
    window.addEventListener("resize", this.handleResize.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize.bind(this));
  }

  handleResize() {
    if (window.innerWidth <= 768) {
      this.props.dispatch(toggleSidebar());
    } else if (window.innerWidth >= 768) {
      this.props.dispatch(openSidebar());
    }
  }

  handleCloseSidebar(e) {
    if (e.target.closest("#sidebar-drawer") == null && this.props.sidebarOpened && window.innerWidth <= 768) {
      this.props.dispatch(toggleSidebar());
    }
  }

  handleSwipe(e) {
    if ("ontouchstart" in window) {
      if (e.direction === 4) {
        this.props.dispatch(openSidebar());
        return;
      }

      if (e.direction === 2 && this.props.sidebarOpened) {
        this.props.dispatch(closeSidebar());
        return;
      }
    }
  }

  render() {
    return (
      <div
        className={[
          s.root,
          !this.props.sidebarOpened ? s.sidebarClose : "",
          "flatlogic-one",
          "dashboard-light",
        ].join(" ")}
        onClick={e => this.handleCloseSidebar(e)}
      >
        <Sidebar />
        <div className={s.wrap}>
          <Header />

          <Hammer onSwipe={this.handleSwipe}>
            <main className={s.content}>
              <TransitionGroup>
                <CSSTransition
                  key={this.props.location.key}
                  classNames="fade"
                  timeout={200}
                >
                  <Switch>
                    {/* 메인 페이지 -> 대시보드로 리다이렉트 */}
                    {/* <Route
                      path="/app/main"
                      exact
                      render={() => <Redirect to="/app/schedule" />}
                    /> */}

                    {/* -------샘플 페이지들------- */}
                    {/* 대시보드 페이지 -> 메인 */}
                    <Route
                      path="/app/main/dashboard"
                      exact
                      component={Dashboard}
                    />
                    <Route path={"/app/ui/icons"} component={Icons} />

                    {/* 마이페이지, 관리자페이지 */}
                    <Route path={"/app/myPage"} component={MyPage} />
                    <Route path={"/app/manages"} component={Manages} />

                    {/* 프로젝트 - 목록 */}
                    <Route path={"/app/projects/list"} exact component={ProjectList} />
                    <Route path={"/app/projects/list/new"} component={NewProject}/>
                    <Route path={"/app/projects/list/:id/:year"} component={DetailProject} />

                    {/* 프로젝트 - WBS */}
                    <Route path={"/app/projects/wbs"} exact component={WbsList}/>
                    <Route path={"/app/projects/wbs/:id/:year"} exact component={Wbs}/>

                    {/* 프로젝트 - 주간보고 */}
                    <Route path={"/app/projects/reports"} exact component={ReportList}/>
                    <Route path={"/app/projects/reports/new"} component={NewReport}/>
                    <Route path={"/app/projects/reports/:pid/:id/:year"} component={DetailReport}/>

                    {/* 프로젝트 - 회의록 */}
                    <Route path={"/app/projects/meetings"} exact component={Meeting}/>
                    <Route path={"/app/projects/meetings/new"} component={NewMeeting}/>
                    <Route path={"/app/projects/meetings/detail/:id"} component={DetailMeeting}/>

                    {/* 수주매출 */}
                    <Route path={"/app/orderssales"} component={OrdersSales} />

                    {/* 교육관리 */}
                    <Route exact path={"/app/education"} component={Education} />
                    <Route path={"/app/education/:team_name+"} component={EducationDetail} />

                    {/* 자산관리 */}
                    <Route path={"/app/equipments"} component={Equips} />

                    {/* 프로젝트룸 예약 */}
                    <Route path={"/app/reservation"} component={Reservation} />

                    {/* 관리자스케줄 */}
                    <Route path={"/app/schedule"} exact component={ManagerSchedule} />
                    <Route path={"/app/schedule/add"} exact component={NewSchedule} />
                    <Route path={"/app/schedule/add/week"} component={NewScheduleWeek} />
                    <Route path={"/app/schedule/:id"} component={DetailSchedule} />

                    {/* 조직도 */}
                    <Route path={"/app/organization"} component={Organization} />
                  </Switch>
                </CSSTransition>
              </TransitionGroup>
            </main>
          </Hammer>
        </div>
      </div>
    );
  }
}

function mapStateToProps(store) {
  return {
    sidebarOpened: store.navigation.sidebarOpened,
    sidebarStatic: store.navigation.sidebarStatic,
  };
}

export default withRouter(connect(mapStateToProps)(Layout));
