import React from "react";
import { ListGroup, ListGroupItem } from "reactstrap";
import { logoutUser } from "../../../actions/user";
import s from "./ListGroup.module.scss";

import settingsIcon from "../../../images/settings.svg";
import logoutIcon from "../../../images/logout.svg";
import accountIcon from "../../../images/account.svg";
import {withRouter} from "react-router";
import {connect} from "react-redux";
import { Cookies } from 'react-cookie';

const cookies = new Cookies();

class MessagesDemo extends React.Component {
  constructor(props) {
    super(props);
    
    this.state={
      name: JSON.parse(localStorage.getItem("userInfo"))?JSON.parse(localStorage.getItem("userInfo")).name:"",
      authority: JSON.parse(localStorage.getItem("userInfo"))?JSON.parse(localStorage.getItem("userInfo")).authority:""
    }
    this.doLogout = this.doLogout.bind(this);
  }
  doLogout() {
    this.props.dispatch(logoutUser());
    cookies.remove("token");
    this.props.history.push("/");
  }
  handleClick(e){
    this.props.history.push("/app/manages");
  }
  goMypage() {
    this.props.history.push("/app/myPage");
  }
  

  render() {
    return (
      <ListGroup className={[s.listGroupAccount, "thin-scroll"].join(" ")}>
        <p className={`${s.listGroupTitleAccount}`}>{this.state.name}</p>
        <ListGroupItem className={`${s.listGroupItemAccount} mt-3`} onClick={() => this.goMypage()}>
          <img src={accountIcon} alt="settings" className={"mr-2"} /> My Page
        </ListGroupItem>
        {this.state.authority === 0 && 
        <ListGroupItem className={`${s.listGroupItemAccount} mt-2`} onClick={() => this.handleClick()}>
          <img src={settingsIcon} alt="settings" className={"mr-2"} /> 관리자
        </ListGroupItem>
        }
        <ListGroupItem className={`${s.listGroupItemAccount} mt-2 mb-3`} onClick={() => this.doLogout()}>
          <img src={logoutIcon} alt="settings" className={"mr-2"} /> Log out
        </ListGroupItem>
      </ListGroup>
    );
  }
}

function mapStateToProps(store) {
    return {
        sidebarOpened: store.navigation.sidebarOpened,
        sidebarStatic: store.navigation.sidebarStatic,
    };
}

export default withRouter(connect(mapStateToProps)(MessagesDemo));