import React, { useState } from "react";
import { withRouter, Redirect, Link } from "react-router-dom";
import { connect } from "react-redux";
import { Alert, Button, Label } from "reactstrap";
import Widget from "../../components/Widget/Widget";
import axios from "axios";
import { useCookies } from 'react-cookie';

const Login = (props) => {
  const [cookies, setCookie] = useCookies(['token']);
  const [loginInfo, setLoginInfo] = useState({
    id: "",
    password: ""
  });

  const changeId = (event) => {
    setLoginInfo({
      ...loginInfo,
      id: event.target.value
    });
  }

  const changePassword = (event) => {
    setLoginInfo({
      ...loginInfo,
      password: event.target.value
    });
  }

  const doLogin = (e) => {
    e.preventDefault();// 새로고침 안됨
    axios.post(`http://${process.env.REACT_APP_API_URL}/login`, //DB연동
    {loginInfo}).then((response)=>{
      if(response.data.result === "success"){
        setCookie('token', response.data.token, { path: '/', maxAge: 21600 });
        const {id, name, authority} = response.data;
        localStorage.setItem('userInfo', JSON.stringify({id, name, authority}));
        props.history.push("/app");
      }else{
        alert(response.data.message);
      }
    });
  }
  const { from } = props.location.state || { from: { pathname: '/app' } }; // eslint-disable-line

  // cant access login page while logged in
  if (cookies.token) {
    return (
        <Redirect to={from} />
    );
  }

  return (
    
    <div className="auth-page">
      <Widget
        className="widget-auth my-auto"
        title={
          <h3 className="mt-0 mb-2" style={{ fontSize: 40 }}>
            로그인
          </h3>
        }
      >
        <p className="widget-auth-info">
          Welcome Back!
        </p>
        <form className="mt" onSubmit={doLogin}>
          {props.errorMessage && (
            <Alert className="alert-sm" color="danger">
              {props.errorMessage}
            </Alert>
          )}
          <div className="form-group">
            <Label for="search-input1">ID</Label>
            <input
              className="form-control"
              onChange={changeId}
              required
              name="id"
              placeholder="ID를 입력하세요"
            />
          </div>
          <div className="form-group mb-2">
            <Label for="search-input1">비밀번호</Label>
            <input
              className="form-control"
              onChange={changePassword}
              type="password"
              required
              name="password"
              placeholder="비밀번호를 입력하세요"
            />
          </div>
          <Button
            type="submit"
            color="warning"
            className="auth-btn mb-3"
            size="sm"
            onClick={(e) => doLogin(e)}
          >
            {props.isFetching ? "Loading..." : "Login"}
          </Button>
          <div className={"d-flex align-items-center"}>
            계정이 없으신가요?{" "}
            <Link to="register" className={"ml-1"}>
              회원가입
            </Link>
          </div>
        </form>
      </Widget>
      {/* <img src={signinImg} alt="signin" className={"backImg"}/> */}
    </div>
  );
}

function mapStateToProps(state) {
  return {
    isFetching: state.auth.isFetching,
    isAuthenticated: state.auth.isAuthenticated,
    errorMessage: state.auth.errorMessage,
  };
}

export default withRouter(connect(mapStateToProps)(Login));
