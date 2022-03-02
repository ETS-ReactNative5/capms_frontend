import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Table,
  Button,
} from "reactstrap";
import "./MyPage.scss"
import Widget from "../../components/Widget/Widget";
import axios from "axios";
import { useCookies } from 'react-cookie';

const MyPage = () => {
  const [cookies, removeCookie ] = useCookies(['token']);
  const [password, setPassword] = useState({
    change: "",
    confirm: ""
  });
  const [user, setUser] = useState({
    num: "",
    id: "",
    name: "",
    소속: "",
    team: "",
    직급: "",
    직책: "",
  });

  const onChangeInput = (e) => {
    setPassword({
      ...password,
      [e.target.id]: e.target.value
    });
  };

  useEffect(() => findAllInfo(), []);

  const findAllInfo = () => {
    const id = JSON.parse(localStorage.getItem("userInfo")) ? JSON.parse(localStorage.getItem("userInfo")).id : '';
    axios.defaults.headers.common['Authorization'] = cookies.token;
    axios.get(`http://${process.env.REACT_APP_API_URL}/members/search?id=${id}`)
    .then((res) => {
      setUser(res.data[0]);
    })
    .catch(err => {
      if (cookies.token) {
        removeCookie('token');
      }
      alert("세션이 만료되었습니다. 다시 로그인 해주세요");
      window.location.href = "/";
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (password.change !== password.confirm) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    } else if (password.change.length === 0) {
      alert("비밀번호를 입력해주세요");
      return;
    } else {
      const confirm = window.confirm("비밀번호를 바꾸시겠습니까?");
      if (confirm) {
        axios.post(`http://${process.env.REACT_APP_API_URL}/members/password`, {password: password.change, num: user.num})
        .then((response) => {
          console.log(response);
        })
        .catch(err => {
          if (cookies.token) {
            removeCookie('token');
          }
          alert("세션이 만료되었습니다. 다시 로그인 해주세요");
          window.location.href = "/";
        });
        window.location.reload();
      }
    }
  };
    

  return (
    <>
      <Row>
        <Col>
          <Widget title={<p style={{ fontSize:30, fontWeight: 700 }}>My Page</p>}>
            <div className="mypage__sub_wrap">
              <div style={{ fontWeight: 700, fontSize: 1.5+'rem'}}>내 정보</div>
              <Table>
                <thead>
                  <tr>
                    <th>아이디</th>
                    <th>이름</th>
                    <th>소속</th>
                    <th>팀</th>
                    <th>직급</th>
                    <th>직책</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.소속}</td>
                    <td>{user.team}</td>
                    <td>{user.직급}</td>
                    <td>{user.직책}</td>
                  </tr>
                </tbody>
              </Table>
            </div>
            <div className="mypage__sub_wrap">
              <div style={{ fontWeight: 700, fontSize: 1.5+'rem'}}>비밀번호 변경</div>
              <div className="mypage__pw_wrap">
                <div className="mypage__pw_title">새 비밀번호</div>
                <input className="form-control" type="password" value={password.change} id="change" onChange={onChangeInput}/>
              </div>
              <div className="mypage__pw_wrap">
                <div className="mypage__pw_title">새 비밀번호 확인</div>
                <input className="form-control" type="password" value={password.confirm} id="confirm" onChange={onChangeInput}/>
              </div>
            </div>
            <Button color="primary" style={{marginTop: 0.5+'rem'}} onClick={onSubmit}>변경</Button>
          </Widget>
        </Col>
      </Row>
    </>
  );
};

export default MyPage;
