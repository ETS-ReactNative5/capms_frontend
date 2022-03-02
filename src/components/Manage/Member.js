import React, { useEffect, useState } from 'react';
import {
    Table,
    Button,
    Input,
    Modal,
    ModalHeader,
    ModalBody,
} from "reactstrap";
import axios from "axios";
import { useCookies } from 'react-cookie';

const ranks = ['인턴', '전임', '선임', '책임', '수석(부장)'];

const Member = () => {
  const [cookies, removeCookie ] = useCookies(['token']);
  const [name, setName] = useState();
  const [search, setSearch] = useState([]);
  const [isOpen, setIsOpen] = useState(false)
  const [teams, setTeams] = useState([]);
  const [members, setMembers] = useState([]);
  const [member, setMember] = useState({
    num: "",
    id: "",
    password: "",
    name: "",
    team: "",
    소속: "",
    직급: "",
    직책: "",
    authority: "",
  });

  const onChangeInput = (e) => {
    setMember({
      ...member,
      [e.target.id]: e.target.value,
    });
  };

  useEffect(() => findAllInfo(), []);

  const findAllInfo = () => {
    axios.defaults.headers.common['Authorization'] = cookies.token;
    axios
    .all([
      axios.get(`http://${process.env.REACT_APP_API_URL}/members`),
      axios.get(`http://${process.env.REACT_APP_API_URL}/teams`),
    ])
    .then(axios.spread((res1, res2) => {
      setMembers(res1.data
        .sort((a, b) => a.name.localeCompare(b.name))
        .sort((a, b) => ranks.indexOf(b.직급) - ranks.indexOf(a.직급))
        .sort((a, b) => a.소속 && b.소속 ? a.소속.localeCompare(b.소속) : 1)
        .sort((a, b) => a.authority - b.authority));
      setTeams(res2.data);
    }))
    .catch(err => {
      if (cookies.token) {
        removeCookie('token');
      }
      alert("세션이 만료되었습니다. 다시 로그인 해주세요");
      window.location.href = "/";
    });
  };

  const onSave = () => {
    if (member.id && member.name && member.authority >= 0 && member.authority <= 3) {
      if (member.num) {
        axios
          .post(`http://${process.env.REACT_APP_API_URL}/members/update`, {
            member: member
          })
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
      } else {
        axios
          .post(`http://${process.env.REACT_APP_API_URL}/members/add`, {
            member: member
          })
          .then((response) => {
            if (!response.data.success)
              alert(response.data.message);
          })
          .catch(err => {
            if (cookies.token) {
              removeCookie('token');
            }
            alert("세션이 만료되었습니다. 다시 로그인 해주세요");
            window.location.href = "/";
          });
        }
      window.location.reload();
    }
    else {
      alert("모든 항목을 입력해주세요.");
    }
  };

  const onDelete = (num) => {
    const confirm = window.confirm("삭제하시겠습니까?");
    if (confirm) {
      axios
        .post(`http://${process.env.REACT_APP_API_URL}/members/delete`, {num})
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
  };

  const pswdReset = (num) => {
    const confirm = window.confirm("비밀번호를 초기화 하시겠습니까?");
    if (confirm) {
      axios.post(`http://${process.env.REACT_APP_API_URL}/members/password`, {password:'1234', num})
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

  const getSearch = () => {
    const _search = members.filter(member => member.name === name);
    if(_search){
      setSearch(_search);
    }
  }

  const sortList = (e) => {
    let arrayCopy = [...members];
    switch (e.target.name) {
      case "ascId":
        arrayCopy.sort((a, b) => a.id.localeCompare(b.id));
        break;
      case "descId":
        arrayCopy.sort((a, b) => b.id.localeCompare(a.id));
        break;
      case "ascName":
        arrayCopy.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "descName":
        arrayCopy.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "ascDiv":
        arrayCopy.sort((a, b) => a.소속.localeCompare(b.소속));
        break;
      case "descDiv":
        arrayCopy.sort((a, b) => b.소속.localeCompare(a.소속));
        break;
      case "ascTeam":
        arrayCopy.sort((a, b) => a.team.localeCompare(b.team));
        break;
      case "descTeam":
        arrayCopy.sort((a, b) => b.team.localeCompare(a.team));
        break;
      case "ascRank":
        arrayCopy.sort((a, b) => a.직급.localeCompare(b.직급));
        break;
      case "descRank":
        arrayCopy.sort((a, b) => b.직급.localeCompare(a.직급));
        break;
      case "ascPos":
        arrayCopy.sort((a, b) => a.직책.localeCompare(b.직책));
        break;
      case "descPos":
        arrayCopy.sort((a, b) => b.직책.localeCompare(a.직책));
        break;
      case "ascAuth":
        arrayCopy.sort((a, b) => a.authority - b.authority);
        break;
      case "descAuth":
        arrayCopy.sort((a, b) => b.authority - a.authority);
        break;
      default:
        break;
    }
    setMembers(arrayCopy);
  };

  return (
    <>
      <div className="member">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <p style={{ fontWeight: 700, fontSize: 1.5+'rem'}}>커넥티드자율주행시스템실 직원 목록</p>
          <Button color="danger" size="sm" onClick={() => setIsOpen(!isOpen)}>
            비밀번호 초기화
          </Button>
        </div>
        <Modal isOpen={isOpen} toggle={() => setIsOpen(!isOpen)} id="news-close-modal" className="modal-content">
          <ModalHeader toggle={() => setIsOpen(!isOpen)} id="news-close-modal-label" className="modal-header">
            비밀번호 초기화
          </ModalHeader>
          <ModalBody className="bg-white modal-body" style={{textAlign:'center'}}>
            <strong>1234로 초기화됩니다</strong>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 0.5 + 'rem', marginBottom: 0.5 + 'rem'}}>
              <Input type='text' maxLength='20' value={name} onChange={(e) => setName(e.target.value)} style={{width: 85+'%'}} placeholder='이름을 입력해주세요.'/>
              <Button color="info" size="sm" onClick={() => {getSearch()}} style={{width: 12+'%', fontSize: 0.8+'rem'}}>검색</Button>
            </div>
            <div>
              {search ? 
              <Table className="manage__table table-sm">
                <thead>
                  <tr>
                    <th className="col-2">ID</th>
                    <th className="col-2">이름</th>
                    <th className="col-4">팀</th>
                    <th className="col-3">비밀번호 초기화</th>
                  </tr>
                </thead>
                <tbody>
                  {search.map((member, index) => (
                    <tr key={index}>
                      <td>{member.id}</td>
                      <td>{member.name}</td>
                      <td>{member.team}</td>
                      <td><Button color="danger" size="sm" onClick={() => pswdReset(member.num)}>초기화</Button></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              : null}
            </div>
          </ModalBody>
        </Modal>
        <div style={{width:100+'%'}}>
          <Table className="manage__table table-sm">
            <thead>
              <tr>
                <th>
                  ID
                  <button className="orderBtn glyphicon glyphicon-collapse-top" name="ascId" onClick={sortList}/>
                  <button className="orderBtn glyphicon glyphicon-collapse" name="descId" onClick={sortList}/>
                  <br /><Input type="text" id="id" value={member.id} onChange={onChangeInput}/></th>
                <th>
                  이름
                  <button className="orderBtn glyphicon glyphicon-collapse-top" name="ascName" onClick={sortList}/>
                  <button className="orderBtn glyphicon glyphicon-collapse" name="descName" onClick={sortList}/>
                  <br /><Input type="text" id="name" value={member.name} onChange={onChangeInput}/></th>
                <th>
                  소속
                  <button className="orderBtn glyphicon glyphicon-collapse-top" name="ascDiv" onClick={sortList}/>
                  <button className="orderBtn glyphicon glyphicon-collapse" name="descDiv" onClick={sortList}/>
                  <br /><Input type="text" id="소속" value={member.소속} onChange={onChangeInput}/></th>
                <th>
                  팀
                  <button className="orderBtn glyphicon glyphicon-collapse-top" name="ascTeam" onClick={sortList}/>
                  <button className="orderBtn glyphicon glyphicon-collapse" name="descTeam" onClick={sortList}/>
                  <br />
                  <Input type="select" id="team" value={member.team} onChange={onChangeInput}>
                    <option value=""> </option>
                    {teams ? 
                    teams
                    .filter(({year}) => Number(year) === new Date().getFullYear())
                    .map((team, index) => {
                    return( 
                      <option key={index} value={team.teamname}>{team.teamname}</option>     
                        );
                    })  :""}
                  </Input>
                </th>
                <th>
                  직급
                  <button className="orderBtn glyphicon glyphicon-collapse-top" name="ascRank" onClick={sortList}/>
                  <button className="orderBtn glyphicon glyphicon-collapse" name="descRank" onClick={sortList}/>
                  <br /><Input type="text" id="직급" value={member.직급} onChange={onChangeInput}/></th>
                <th>
                  직책
                  <button className="orderBtn glyphicon glyphicon-collapse-top" name="ascPos" onClick={sortList}/>
                  <button className="orderBtn glyphicon glyphicon-collapse" name="descPos" onClick={sortList}/>
                  <br /><Input type="text" id="직책" value={member.직책} onChange={onChangeInput}/></th>
                <th>
                  권한
                  <button className="orderBtn glyphicon glyphicon-collapse-top" name="ascAuth" onClick={sortList}/>
                  <button className="orderBtn glyphicon glyphicon-collapse" name="descAuth" onClick={sortList}/>
                  <br /><Input type="text" id="authority" value={member.authority} onChange={onChangeInput}/></th>
                <th>Action<br /><br /><Button size="sm" color="info" onClick={onSave}>{member.num ? "변경" : "추가"}</Button></th>
              </tr>
            </thead>
            <tbody>
              {members ? members.map(c => {
                  return( <tr key={c.num}>
                    <td style={{ textAlign: "center" }}>{c.id}</td> 
                    <td style={{ textAlign: "center" }}>{c.name}</td>
                    <td style={{ textAlign: "center" }}>{c.소속}</td>
                    <td style={{ textAlign: "center" }}>{c.team}</td>
                    <td style={{ textAlign: "center" }}>{c.직급}</td>
                    <td style={{ textAlign: "center" }}>{c.직책}</td>
                    <td style={{ textAlign: "center" }}>{c.authority}</td>
                    <td>
                    <Button color={"warning"} className="UpdateBtn" size="sm" variant="primary" onClick={()=>setMember(c)}>수정</Button>
                    &nbsp;
                    <Button color={"default"} className="UpdateBtn" size="sm" variant="danger"onClick={() => onDelete(c.num)}>삭제</Button></td>
                  </tr>
                    );
                })  :""}
            </tbody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default Member;