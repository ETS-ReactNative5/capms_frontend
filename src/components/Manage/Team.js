import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Input,
} from "reactstrap";
import moment from 'moment';
import axios from "axios";
import { useCookies } from 'react-cookie';

const Team = () => {
  const [cookies, removeCookie ] = useCookies(['token']);
  const [teams, setTeams] = useState([]);
  const [team, setTeam] = useState({
    teamname: '',
    firstorder: '',
    firstsale: '',
    lastorder: '',
    lastsale: '',
    num: '',
    year: moment(new Date()).format('YYYY'),
  });
  const [year, setYear] = useState(moment(new Date()).format('YYYY'));

  const onChangeInput = (e) => {
    setTeam({
      ...team,
      [e.target.id]: e.target.value,
    });
  };

  const onSave = () => {
    if (team.teamname && team.firstorder && team.firstsale && team.lastorder && team.lastsale && team.year) {
      if (team.num) {
        axios
          .post(`http://${process.env.REACT_APP_API_URL}/teams/update`, {
            team: team
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
        const newTeam = {
          teamname: team.teamname,
          firstorder: team.firstorder,
          firstsale: team.firstsale,
          lastorder: team.lastorder,
          lastsale: team.lastsale,
          num: teams.filter(t => Number(t.year) === Number(year)).length + 1,
          year: team.year,
        };
        axios
          .post(`http://${process.env.REACT_APP_API_URL}/teams/add`, {
            team: newTeam
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
        }
      window.location.reload();
    }
    else {
      alert("모든 항목을 입력해주세요.");
    }
  };

  const onDelete = (teamname, year) => {
    const confirm = window.confirm(`${teamname}를 삭제하시겠습니까?`);
    if (confirm) {
      axios
        .post(`http://${process.env.REACT_APP_API_URL}/teams/delete`, {teamname, year})
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

  useEffect(() => findAllInfo(), []);

  const findAllInfo = () => {
    axios.defaults.headers.common['Authorization'] = cookies.token;
    axios.get(`http://${process.env.REACT_APP_API_URL}/teams`)
    .then((res) => {
      res.data.sort((a, b) => a.num - b.num);
      setTeams(res.data);
    })
    .catch(err => {
      if (cookies.token) {
        removeCookie('token');
      }
      alert("세션이 만료되었습니다. 다시 로그인 해주세요");
      window.location.href = "/";
    });
  };

  const onChangeOrder = (e) => {
    axios
    .post(`http://${process.env.REACT_APP_API_URL}/teams/order`, {teams})
    .then((response) => {})
    .catch(err => {
      if (cookies.token) {
        removeCookie('token');
      }
      alert("세션이 만료되었습니다. 다시 로그인 해주세요");
      window.location.href = "/";
    });
    window.location.reload();
  };

  const updatePlaceOrder = (moving, target) => { //2번을 1번한테 갖다댐
    if (moving === target)
      return;
    const _year = year;
    const newTeams = teams
    .map(({teamname, firstorder, firstsale, lastorder, lastsale, num, year}) => {
      if (Number(year) === Number(_year)) {
        if (num === moving)
          return {teamname, firstorder, firstsale, lastorder, lastsale, num: target, year};
        else if (moving > target && num >= target && num < moving)
          return {teamname, firstorder, firstsale, lastorder, lastsale, num: num + 1, year};
        else if (moving < target && num > moving && num <= target)
          return {teamname, firstorder, firstsale, lastorder, lastsale, num: num - 1, year};
      }
      return {teamname, firstorder, firstsale, lastorder, lastsale, num, year};
    });
    newTeams.sort((a, b) => a.num - b.num);
    setTeams(newTeams);
  };

  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', e.target.id);
  };

  const handleDrop = (e) => {
    const movingTarget = e.dataTransfer.getData('text/plain');
    updatePlaceOrder(Number(movingTarget), Number(e.target.id));
  }; 

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <>
      <div className="team">
        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 0.5+'rem'}}>
          <p style={{ fontWeight: 700, fontSize: 1.5+'rem' }}>팀관리</p>
          <select className="form-control" style={{width: 8+'rem'}} id="year" value={year} onChange={(e) => {setYear(e.target.value); setTeam({...team, year: e.target.value})}}>
            {[...Array(moment(new Date()).format('YYYY') - 2018).keys()].map((i) => (
              <option key={i} value={moment(new Date()).format('YYYY') - i + 1}>{moment(new Date()).format('YYYY') - i + 1}</option>
            ))}
          </select>
        </div>
        <Table className="manage__table table-sm">
          <thead>
            <tr>
              <th className="col-1">우선순위<br /><br /><Button color="info" size="sm" onClick={onChangeOrder}>저장</Button></th>
              <th className="col-3">팀명<br /><br /><Input type="text" id="teamname" value={team.teamname} onChange={onChangeInput}/></th>
              <th className="col-2">상반기 목표수주<br /><br /><Input type="text" id="firstorder" value={team.firstorder} onChange={onChangeInput}/></th>
              <th className="col-2">상반기 목표매출<br /><br /><Input type="text" id="firstsale" value={team.firstsale} onChange={onChangeInput}/></th>
              <th className="col-2">하반기 목표수주<br /><br /><Input type="text" id="lastorder" value={team.lastorder} onChange={onChangeInput}/></th>
              <th className="col-2">하반기 목표매출<br /><br /><Input type="text" id="lastsale" value={team.lastsale} onChange={onChangeInput}/></th>
              <th className="col-2">Action<br /><br /><Button size="sm" color="info" onClick={onSave}>{team.num ? "변경" : "추가"}</Button></th>
            </tr>
          </thead>
          <tbody>  
            {teams ? teams
            .filter((team) => Number(team.year) === Number(year))
            .map((c, index) => {
              return( 
              <tr key={index}>
                <td style={{ textAlign: "center", cursor: 'move'}}
                  id={c.num}
                  draggable
                  onDragStart={handleDragStart}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  >
                    {c.num}
                </td> 
                <td style={{ textAlign: "center" }}>{c.teamname}</td> 
                <td style={{ textAlign: "center" }}>{c.firstorder}</td> 
                <td style={{ textAlign: "center" }}>{c.firstsale}</td>
                <td style={{ textAlign: "center" }}>{c.lastorder}</td>
                <td style={{ textAlign: "center" }}>{c.lastsale}</td>
                <td>
                  <Button color={"warning"} className="UpdateBtn" size="sm" variant="primary" onClick={()=>setTeam(c)}>수정</Button>
                  &nbsp;
                  <Button color={"default"} className="UpdateBtn" size="sm" variant="danger"onClick={() => onDelete(c.teamname, c.year)}>삭제</Button></td>
              </tr> 
              );
            })  :<tr><td colSpan="7">데이터가 없습니다.</td></tr>}
          </tbody>
        </Table>
      </div>
    </>
  );
}

export default Team;