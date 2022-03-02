import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Col, Row, Table } from 'reactstrap';
import Widget from '../../components/Widget/Widget';
import moment from 'moment';
import { useCookies } from 'react-cookie';

const ProjectList = () => {
  const authority = JSON.parse(localStorage.getItem("userInfo")) ? JSON.parse(localStorage.getItem("userInfo")).authority : "";
  const [cookies, removeCookie ] = useCookies(['token']);
  const [saveDate , setSaveDate] = useState(moment(new Date()).format("YYYY"));
  const [projects , setProjects] = useState([]);
  const [teams , setTeams] = useState([]);

  useEffect(()=> findAllorders(), []);

  const findAllorders = () => {
    if(authority === 0 || authority === 1){
      axios.defaults.headers.common['Authorization'] = cookies.token;
      axios
      .all([axios.get(`http://${process.env.REACT_APP_API_URL}/projects`),axios.get(`http://${process.env.REACT_APP_API_URL}/teams`) ])
      .then(axios.spread((res1,res2)=>{
        setProjects(res1.data);
        res2.data.sort((a,b)=>a.num - b.num);
        setTeams(res2.data);
        })
      )
      .catch(err => {
        if (cookies.token) {
          removeCookie('token');
        }
        alert("세션이 만료되었습니다. 다시 로그인 해주세요");
        window.location.href = "/";
      });
    }
  }

  const getGoals = (term, type) => {
    const _teams = teams.filter(team => Number(team.year) === Number(saveDate))
    let data = [];
    let sum = 0;
    if(term){
      _teams.map((team, idx) => {
        sum += team["first" + type];
        if(team.teamname !== "커넥티드자율주행시스템실")
          data.push(<td key={idx}>{team["first" + type].toFixed(2)}</td>);
      })
    }else{
      _teams.map((team, idx) => {
        sum = sum + team["first" + type] + team["last" + type]
        if(team.teamname !== "커넥티드자율주행시스템실")
          data.push(<td key={idx}>{(team["first" + type] + team["last" + type]).toFixed(2)}</td>);
      })
    }
    data.unshift(<td style={{fontWeight: 'bold'}}>{sum.toFixed(2)}</td>)
    return data;
  };

  const getResult = (term, expect, type) => {
    const _teams = teams.filter(team => Number(team.year) === Number(saveDate))
    let data = [];
    let totalsum = 0;
    if(term){
      _teams.map((team, idx) => {
        const teamsum = projects.filter(project => team.teamname === project["팀"+type] && Number(saveDate) === Number(project.year))
        .reduce((acc, cur) => acc + cur["상반기"+expect+type], 0)
        totalsum += teamsum;
        if(team.teamname !== "커넥티드자율주행시스템실")
          data.push(<td key={idx}>{teamsum.toFixed(2)}</td>);
      })
    }else{
      _teams.map((team, idx) => {
        const teamsum = projects.filter(project => team.teamname === project["팀"+type] && Number(saveDate) === Number(project.year))
        .reduce((acc, cur) => acc + cur["상반기"+expect+type] + cur["하반기"+expect+type], 0)
        totalsum += teamsum;
        if(team.teamname !== "커넥티드자율주행시스템실")
          data.push(<td key={idx}>{teamsum.toFixed(2)}</td>);
      })
    }
    data.unshift(<td style={{fontWeight: 'bold'}}>{totalsum.toFixed(2)}</td>)
    return data;
  };

  return (
    <>
      <Row>
        <Col>
          {authority === 0 || authority === 1 ?
            <Widget title={<p style={{ fontSize:30, fontWeight: 700 }}>수주매출</p>}>
            <select className="form-control"  id="Year" value={saveDate} onChange={(e) => setSaveDate(e.target.value)}>
              {[...Array(moment(new Date()).format('YYYY') - 2018).keys()].map((i) => (
                <option key={i} value={moment(new Date()).format('YYYY') - i + 1}>{moment(new Date()).format('YYYY') - i + 1}</option>
              ))}
            </select>
            <br />
              <Table striped hover>
                <thead>
                  <tr>
                    <th colSpan={teams.filter(team => Number(team.year) === Number(saveDate)).length+4}>상세내역단위 (백만)</th>
                  </tr>
                  <tr>
                    <th>구분</th>
                    <th>항목</th>
                    <th>TOTAL</th>
                    {teams.filter(team => team.teamname !== "커넥티드자율주행시스템실").map((team, idx) => {
                      if(Number(team.year) === Number(saveDate)){
                        return(
                          <th key={idx}>{team.teamname}</th> 
                    )}})}
                  </tr>
                </thead>
                <tbody>
                  {/* 상반기 부분 */}
                  <tr>
                    <td rowSpan='6' style={{ color: "orange" , fontWeight:"bold", textAlign: "center" }} > 상반기 </td>
                    <td>목표수주</td>
                    {getGoals(true, "order")}
                  </tr>
                  <tr>
                    <td>예상수주</td>
                    {getResult(true, "예상", "수주")}
                  </tr>
                  <tr>
                    <td>수주달성</td>
                    {getResult(true, "", "수주")}
                  </tr>
                  <tr>
                    <td>목표매출</td>
                    {getGoals(true, "sale")}
                  </tr>
                  <tr>
                    <td>예상매출</td>
                    {getResult(true, "예상", "매출")}
                  </tr>
                  <tr style={{ color: "red" , fontWeight:"bold" }}>
                    <td>매출달성</td>
                    {getResult(true, "", "매출")}
                  </tr>
                  {/* 하반기 부분 */}
                  <tr>
                    <td rowSpan='6' style={{ color: "orange" , fontWeight:"bold", textAlign: "center" }}> 연간 </td>
                    <td>목표수주</td>
                    {getGoals(false, "order")}
                  </tr>
                  <tr>
                    <td>예상수주</td>
                    {getResult(false, "예상", "수주")}
                  </tr>
                  <tr>
                    <td>수주달성</td>
                    {getResult(false, "", "수주")}
                  </tr>
                  <tr>
                    <td>목표매출</td>
                    {getGoals(false, "sale")}
                  </tr>
                  <tr>
                    <td>예상매출</td>
                    {getResult(false, "예상", "매출")}
                  </tr>
                  <tr style={{ color: "red" , fontWeight:"bold" }}>
                    <td>매출달성</td>
                    {getResult(false, "", "매출")}
                  </tr>
                </tbody>
              </Table>
            </Widget>
          :
            <Widget title={
              <p style={{ fontSize:30, fontWeight: 700 }}>권한이 없습니다</p>
            }>
            </Widget>
          }
        </Col>
      </Row>
    </>
  );
}

export default ProjectList;