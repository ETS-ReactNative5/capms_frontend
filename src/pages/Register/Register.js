import React from "react";
import PropTypes from "prop-types";
import { withRouter, Redirect, Link } from "react-router-dom";
import { connect } from "react-redux";
import { Alert, Button, Label } from "reactstrap";
import Widget from "../../components/Widget/Widget";
import { registerUser, registerError } from "../../actions/register";
import axios from 'axios';
import { Cookies } from 'react-cookie';

const cookies = new Cookies();

class Register extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      id: "", 
      password: "",
      confirmPassword: "",
      name: "",
    };

    this.doRegister = this.doRegister.bind(this);
    this.changeId = this.changeId.bind(this);
    this.changePassword = this.changePassword.bind(this);
    this.changeConfirmPassword = this.changeConfirmPassword.bind(this);
    this.changeName = this.changeName.bind(this);
    this.checkPassword = this.checkPassword.bind(this);
    this.isPasswordValid = this.isPasswordValid.bind(this);
  }

  changeId(event) { // 이메일 값을 construcor state에 넣음
    this.setState({ id: event.target.value });
  }

  changePassword(event) { // 암호 값을 construcor state에 넣음
    this.setState({ password: event.target.value });
  }

  changeConfirmPassword(event) { // 재입력 값을 construcor state에 넣음
    this.setState({ confirmPassword: event.target.value });
  }
  changeName(event) { // 이름 값을 construcor state에 넣음
    this.setState({ name: event.target.value });
  }

  checkPassword() { // Password 값이 없을땐 if문 둘이 같지않을때는 else문 출력
    if (!this.isPasswordValid()) {
      if (!this.state.password) {
        this.props.dispatch(registerError("Password field is empty"));
      } else {
        this.props.dispatch(registerError("Passwords are not equal"));
      }
      setTimeout(() => {
        this.props.dispatch(registerError());
      }, 3 * 1000);
    }
  }

  isPasswordValid() { // 암호가 존재하고 그 암호와 재입력 암호가 같으면 1 아니면 0 반환
    return (
      this.state.password && this.state.password === this.state.confirmPassword
    );
  }

  confirmPasswordClassName() {
    const { confirmPassword } = this.state;
  
    if (confirmPassword) {
      return this.isPasswordValid() ? 'is-valid' : 'is-invalid';
    }
  }
  renderFeedbackMessage() {
    const { confirmPassword } = this.state;
  
    if (confirmPassword) {
      if (!this.isPasswordValid()) {
        return (
          <div className="invalid-feedback">패스워드가 일치하지 않습니다</div>
        );
      }
    }
  }

  doRegister(e) {
    e.preventDefault();// 새로고침 안됨
    const id = this.state.id;
    const password = this.state.password;
    const name = this.state.name;
    if (password !== this.state.confirmPassword)
      return alert("비밀번호가 일치하지 않습니다.");
    if (!id || !password || !name)
      return alert("모든 항목을 입력해주세요.");
    axios.post(`http://${process.env.REACT_APP_API_URL}/register`, //DB연동
    {id: id, password: password, name: name}).then((response)=>{
      if(response.data.success){
        this.props.dispatch(registerUser(response.data.success));
        this.props.history.push("/login");
      }
      else{
        alert(response.data.message);
        this.props.history.push("/register");
      }
    });
  }
 
  

  render() {
    const { from } = this.props.location.state || {
      from: { pathname: "/app" },
    }; // eslint-disable-line

    // cant access login page while logged in
    if (cookies.get('token')) {
      return <Redirect to={from} />;
    }

    return (
      <div className="auth-page">
        <Widget
          className="widget-auth my-auto"
          title={
            <h3 className="mt-0 mb-2" style={{ fontSize: 40 }}>
              회원가입
            </h3>
          }
        >
          <p className="widget-auth-info">
            Welcome!
          </p>
          <form className="mt" onSubmit={this.doLogin}>
            {this.props.errorMessage && (
              <Alert className="alert-sm" color="danger">
                {this.props.errorMessage}
              </Alert>
            )}
            <div className="form-group">
              <Label for="search-input1">ID</Label>
              <input
                className="form-control"
                defaultValue={""}
                onChange={this.changeId}
                required
                name="id"
                placeholder="ID를 입력하세요"
              />
            </div>
            <div className="form-group mb-2">
              <Label for="search-input1">비밀번호</Label>
              <input
                className="form-control"
                defaultValue={""}
                onChange={this.changePassword}
                type="password"
                required
                name="password"
                placeholder="비밀번호를 입력하세요"
              />
            </div>
             <div className="form-group mb-3">
              <Label for="search-input1">비밀번호 확인</Label>
              <input
                className={`form-control ${this.confirmPasswordClassName()}`}
                defaultValue={""}
                onChange={this.changeConfirmPassword}
                type="password"
                required
                name="password"
                placeholder="비밀번호를 재입력하세요"
              />
              {this.renderFeedbackMessage()}
            </div> 
            
            <div className="form-group mb-4">
              <Label for="search-input1">이름</Label>
              <input
                className="form-control"
                defaultValue={""}
                onChange={this.changeName}
                required
                name="name"
                placeholder="이름을 입력하세요"
              />
            </div> 
            <Button
              type="submit"
              color="warning"
              className="auth-btn mb-3"
              size="sm"
              onClick={(e) => this.doRegister(e)}
            >
              {this.props.isFetching ? "Loading..." : "회원가입"}
            </Button>
            <div className={"d-flex align-items-center"}>
              계정이 있으신가요?{" "}
              <Link to="login" className={"ml-1"}>
                로그인
              </Link>
            </div>
          </form>
        </Widget>
        {/* <img
          src={signupImg}
          alt="signin"
          className={"backImg"}
        /> */}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    isFetching: state.register.isFetching,
    errorMessage: state.register.errorMessage,
  };
}

export default withRouter(connect(mapStateToProps)(Register));
