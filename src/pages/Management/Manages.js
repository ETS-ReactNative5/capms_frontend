import React, {useState} from "react";
import Member from "../../components/Manage/Member";
import Team from "../../components/Manage/Team";
import Tool from "../../components/Manage/Tool";
import Place from "../../components/Manage/Place";
import {
  Row,
  Col,
  Button
} from "reactstrap";
import s from "./Manages.modules.scss";
import Widget from "../../components/Widget/Widget";

const Manages = () => {
  const [menu, setMenu] = useState("member");
  const authority = JSON.parse(localStorage.getItem("userInfo")) ? JSON.parse(localStorage.getItem("userInfo")).authority : "";

  return (
    <>
      {authority === 0 ?
        <Widget title={
          <div style={{display: 'flex', flexDirection:'row', width: 100+'%', justifyContent: 'space-between'}}>
            <p style={{ fontSize:30, fontWeight: 700 }}>관리자페이지</p>
            <div className="manage__buttons">
              <Button color="danger" size="sm" className={menu === "member" ? s.active : ""} onClick={() => setMenu("member")}>
                회원관리
              </Button>
              <Button color="danger" size="sm" className={menu === "team" ? s.active : ""} onClick={() => setMenu("team")}>
                팀관리
              </Button>
              <Button color="danger" size="sm" className={menu === "tool" ? s.active : ""} onClick={() => setMenu("tool")}>
                도구관리
              </Button>
              <Button color="danger" size="sm" className={menu === "place" ? s.active : ""} onClick={() => setMenu("place")}>
                근무지관리
              </Button>
            </div>
          </div>
        }>
          <Row>
            <Col md="12">
              {menu === "member" && <Member />}
              {menu === "team" && <Team />}
              {menu === "tool" && <Tool />}
              {menu === "place" && <Place />}
            </Col>
          </Row>
        </Widget>
      : <Widget title={
        <p style={{ fontSize:30, fontWeight: 700 }}>권한이 없습니다</p>
      }>
        </Widget>}
    </>
  );
}

export default Manages;
