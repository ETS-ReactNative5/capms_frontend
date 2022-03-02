import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Col, Row, Table } from 'reactstrap';
import Widget from '../../components/Widget/Widget';
import { Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import moment from 'moment';

const WbsList = () => {
  const authority = JSON.parse(localStorage.getItem("userInfo")) ? JSON.parse(localStorage.getItem("userInfo")).authority : "";
  const [projects , setProjects] = useState([]);
  const [members , setMembers] = useState([]);
  const [year, setYear] = useState(moment(new Date()).format('YYYY'));
  const [cookies, removeCookie ] = useCookies(['token']);

  const sortList = (e) => {
    let arrayCopy = [...projects];
    switch (e.target.name) {
      case "ascMa":
        arrayCopy.sort((a, b) => a.팀매출.localeCompare(b.팀매출));
        break;
      case "descMa":
        arrayCopy.sort((a, b) => b.팀매출.localeCompare(a.팀매출));
        break;
      case "ascStatus":
        arrayCopy.sort((a, b) => a.상태.localeCompare(b.상태));
        break;
      case "descStatus":
        arrayCopy.sort((a, b) => b.상태.localeCompare(a.상태));
        break;
      default:
        return;
    }
    setProjects(arrayCopy);
  };

  const setClassName = (status) => {
    switch (status) {
      case "1.예산확보":
      case "2.고객의사":
      case "3.제안단계":
        return "project__status_start";
      case "4.업체선정":
      case "5.진행예정":
        return "project__status_ready";
      case "6.진행중":
        return "project__status_progress";
      case "7.종료":
        return "project__status_end";
      case "8.Dropped":
        return "project__status_dropped";
      default:
        return "project__status_progress";
    }
  };

  useEffect(()=> findAllProjects(), []);

  const findAllProjects = () => {
    if(authority === 0 || authority === 1){
      axios.defaults.headers.common['Authorization'] = cookies.token;
      axios
      .all([
      axios.get(`http://${process.env.REACT_APP_API_URL}/projects`),
      axios.get(`http://${process.env.REACT_APP_API_URL}/members`)])
      .then(axios.spread((res1,res2)=>{
        const _projects = res1.data.sort((a,b)=>a.상태.localeCompare(b.상태));
        setProjects(_projects);
        setMembers(res2.data);
      }))
      .catch(err => {
        if (cookies.token) {
          removeCookie('token');
        }
        alert("세션이 만료되었습니다. 다시 로그인 해주세요");
        window.location.href = "/";
      });
    }
 }

  return (
    <>
      <Row>
        <Col>
          {authority === 0 || authority === 1 ?
            <Widget title={
              <div style={{ display: 'flex', flexDirection:'row', justifyContent: 'space-between', marginBottom: 1+'rem'}}>
                <p style={{ fontSize:30, fontWeight: 700 }}>WBS</p>
                <select className="form-control" style={{width: 10+'rem'}} name="year" value={year} onChange={(e)=>setYear(e.target.value)}>
                  {[...Array(moment(new Date()).format('YYYY') - 2018).keys()]
                  .map((i)=>{
                    return <option key={i} value={moment(new Date()).format('YYYY') - i + 1}>{moment(new Date()).format('YYYY') - i + 1}</option>
                  })}
                </select>
              </div>}>
              <Table className="project-list__table table-sm" style={{fontSize: 0.9 + 'rem'}}>
                <thead>
                  <tr>
                    <th className="col-1 project-list__th">
                      <div className="project-list__th_div">
                        <div>
                          팀(매출)
                        </div>
                        <div>
                          <button className="orderBtn glyphicon glyphicon-collapse-top" name="ascMa" onClick={sortList}/>
                          <button className="orderBtn glyphicon glyphicon-collapse" name="descMa" onClick={sortList}/>
                        </div>
                      </div>
                    </th>
                    <th className="col-3 project-list__th">
                      프로젝트 명
                    </th>
                    <th className="col-1 project-list__th">
                      <div className="project-list__th_div">
                        <div>
                          상태
                        </div>
                        <div>
                          <button className="orderBtn glyphicon glyphicon-collapse-top" name="ascStatus" onClick={sortList}/>
                          <button className="orderBtn glyphicon glyphicon-collapse" name="descStatus" onClick={sortList}/>
                        </div>
                      </div>
                    </th>
                    <th className="col-1 project-list__th">PM</th>
                  </tr>
                </thead>
                <tbody>
                  {projects
                  .filter((project)=> Number(project.year) === Number(year))
                  .map((project, index) => {
                    const member = members.find(({id}) => id === project.PM);
                    return(
                    <tr key={index} className={setClassName(project.상태)}>
                      <td className="col-1 project-list__td">{project.팀매출}</td>
                      <td className="col-3 project-list__td" style={{whiteSpace: 'break-spaces'}}>
                        <Link to={{pathname: `/app/projects/wbs/${project.id}/${year}`}}>
                          {project.프로젝트명}
                        </Link>
                      </td>
                      <td className="col-1 project-list__td">{project.상태}</td>
                      <td className="col-1 project-list__td">{member ? member.name : project.PM}</td>
                    </tr>
                  )})}
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

export default WbsList;