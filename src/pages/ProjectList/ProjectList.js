import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Col, Row, Table } from 'reactstrap';
import Widget from '../../components/Widget/Widget';
import { Link } from 'react-router-dom';
import './ProjectList.scss';
import moment from 'moment';
import { useCookies } from 'react-cookie';

// 구글 시트 동기화
const {GoogleSpreadsheet} = require("google-spreadsheet");
// local
/*const gs_creds = require("./vompms-9980f1daef68.json"); // 키 생성 후 다운된 json파일을 지정합니다.
const doc = new GoogleSpreadsheet("1K_EaybcMYnvv0XhJY17Gh4UPAMqn2N98RqTmxq1jStM");*/

// cafe24
const gs_creds = require("./capms-337805-8f1b9ebffcbd.json"); // 키 생성 후 다운된 json파일을 지정합니다.
const doc = new GoogleSpreadsheet("1vI-Zh29gvNdZ66-Jebdjd-EdlPXeEREsXzYjm5mYGSg");

async function authGoogleSheet(){
	try{
		await doc.useServiceAccountAuth(gs_creds);
		await doc.loadInfo()
	}catch(err){
		console.log( "AUTH ERROR ", err)
	}
}

// id, 팀수주, 팀매출, 프로젝트코드, 프로젝트명, 상태, 실, 고객사, 고객부서, ManMonth, 프로젝트계약금액_백만, 상반기예상수주, 상반기수주, 상반기예상매출, 상반기매출, 하반기예상수주, 하반기수주, 하반기예상매출, 하반기매출, 장비비, 컨설팅비, 도구비, 착수, 종료, 고객담당자, 근무지, 업무, 도구, 과제성격, 사업지역, PM, 투입명단, year, 주간보고서, 실적보고
export async function syncWithGoogle(projects, members, title){
  authGoogleSheet(); // 처음 시작할 때 문서 접속에 대한 인증을 처리하고 해당 문서를 로드합니다.
  try{
    await doc.loadInfo();
    let sheet = doc.sheetsByTitle[title];
    if (!sheet){
      sheet = await doc.addSheet({title: title});
    }

    await sheet.clear();
    await sheet.setHeaderRow([
      "팀(수주)", "팀(매출)", "프로젝트코드", "프로젝트명",
      "상태", "실", "고객사", "고객부서", "ManMonth", "프로젝트계약금액_백만",
      "상반기예상수주", "상반기수주", "상반기예상매출", "상반기매출",
      "하반기예상수주", "하반기수주", "하반기예상매출", "하반기매출",
      "착수", "종료", "고객담당자", "근무지", "업무", "PM", "투입명단"]);
    let data = [];
    projects.map((project) => {
      if (Number(project.실적보고) === 0)
        return;
      const PM = members.find(member => member.id === project.PM);
      const input = project.투입명단.split(' ').map(input => {const member = members.find(member => member.id === input); return(member ? member.name : input)}).join(' ')
      data.push([project.팀수주, project.팀매출, project.프로젝트코드, project.프로젝트명,
      project.상태, project.실, project.고객사, project.고객부서, project.ManMonth, project.프로젝트계약금액_백만,
      project.상반기예상수주, Number(project.상반기수주) === 0 ? project.상반기예상수주 : project.상반기수주, project.상반기예상매출, project.상반기매출,
      project.하반기예상수주, Number(project.하반기수주) === 0 ? project.하반기예상수주 : project.하반기수주, project.하반기예상매출, project.하반기매출,
      project.착수, project.종료, project.고객담당자, project.근무지, project.업무, PM ? PM.name: project.PM, input
      ]);
    });
    await sheet.addRows(data, {insert: false});
  }catch(err){
    alert( "동기화 실패: ", err)
    console.log( "SYNC ERROR ", err)
  }
}

const ProjectList = () => {
  const authority = JSON.parse(localStorage.getItem("userInfo")) ? JSON.parse(localStorage.getItem("userInfo")).authority : "";
  const [projects , setProjects] = useState([]);
  const [members , setMembers] = useState([]);
  const [year, setYear] = useState(moment(new Date()).format('YYYY'));
  const [cookies, removeCookie ] = useCookies(['token']);

  const sortList = (e) => {
    let arrayCopy = [...projects];
    switch (e.target.name) {
      case "ascSu":
        arrayCopy.sort((a, b) => a.팀수주.localeCompare(b.팀수주));
        break;
      case "descSu":
        arrayCopy.sort((a, b) => b.팀수주.localeCompare(a.팀수주));
        break;
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
        const _projects = res1.data.sort((a,b)=>b.종료.localeCompare(a.종료)).sort((a,b)=>a.상태.localeCompare(b.상태));
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
            <Widget title={<p style={{ fontSize:30, fontWeight: 700 }}>프로젝트목록</p>}>
              <div style={{display: 'flex', flexDirection:'row', justifyContent: 'space-between', marginBottom: 1+'rem'}}>
                <div style={{display: 'flex', flexDirection:'row'}}>
                  <select className="form-control" style={{width: 10+'rem'}} name="year" value={year} onChange={(e)=>setYear(e.target.value)}>
                    {[...Array(moment(new Date()).format('YYYY') - 2018).keys()]
                    .map((i)=>{
                      return <option key={i} value={moment(new Date()).format('YYYY') - i + 1}>{moment(new Date()).format('YYYY') - i + 1}</option>
                    })}
                  </select>
                </div>
                <div>
                  <Link to="/app/projects/list/new"><button className="btn btn-primary">새로운 프로젝트</button></Link>
                </div>
              </div>
              <Table className="project-list__table table-sm">
                <thead>
                  <tr>
                    <th className="project-list__th">
                      <div className="project-list__th_div">
                        <div>
                          팀(수주)
                        </div>
                        <div>
                          <button className="orderBtn glyphicon glyphicon-collapse-top" name="ascSu" onClick={sortList}/>
                          <button className="orderBtn glyphicon glyphicon-collapse" name="descSu" onClick={sortList}/>
                        </div>
                      </div>
                    </th>
                    <th className="project-list__th">
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
                    <th className="project-list__th">
                      프로젝트 명
                    </th>
                    <th className="project-list__th">
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
                      <th className="project-list__th">상반기<br/>예상수주</th>
                      <th className="project-list__th">상반기<br/>수주</th>
                      <th className="project-list__th">상반기<br/>예상매출</th>
                      <th className="project-list__th">상반기<br/>매출</th>
                      <th className="project-list__th">하반기<br/>예상수주</th>
                      <th className="project-list__th">하반기<br/>수주</th>
                      <th className="project-list__th">하반기<br/>예상매출</th>
                      <th className="project-list__th">하반기<br/>매출</th>
                    <th className="project-list__th">PM</th>
                  </tr>
                </thead>
                <tbody>
                  {projects
                  .filter((project)=> Number(project.year) === Number(year))
                  .map((project, index) => {
                    const member = members.find(({id}) => id === project.PM);
                    return(
                    <tr key={index} className={setClassName(project.상태)}>
                      <td className="project-list__td">{project.팀수주}</td>
                      <td className="project-list__td">{project.팀매출}</td>
                      <td className="project-list__td" style={{whiteSpace: 'break-spaces'}}>
                        <Link to={{pathname: `/app/projects/list/${project.id}/${year}`}}>
                          {project.프로젝트명}
                        </Link>
                      </td>
                      <td className="project-list__td">{project.상태}</td>
                        <td className="project-list__td project-list__td_cost">{project.상반기예상수주}</td>
                        <td className="project-list__td project-list__td_cost">{project.상반기수주}</td>
                        <td className="project-list__td project-list__td_cost">{project.상반기예상매출}</td>
                        <td className="project-list__td project-list__td_cost">{project.상반기매출}</td>
                        <td className="project-list__td project-list__td_cost">{project.하반기예상수주}</td>
                        <td className="project-list__td project-list__td_cost">{project.하반기수주}</td>
                        <td className="project-list__td project-list__td_cost">{project.하반기예상매출}</td>
                        <td className="project-list__td project-list__td_cost">{project.하반기매출}</td>
                      <td className="project-list__td">{member ? member.name : project.PM}</td>
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

export default ProjectList;