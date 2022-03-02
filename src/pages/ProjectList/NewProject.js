import React, { useState, useEffect } from 'react';
import { Col, Row, Table, Button } from 'reactstrap';
import Flatpickr from "react-flatpickr";
import Widget from '../../components/Widget/Widget';
import moment from 'moment';
import { statusData, characterData, countryData } from './DetailProject';
import axios from 'axios';
import './NewProject.scss';
import { useCookies } from 'react-cookie';
import { syncWithGoogle } from './ProjectList';

const NewProject = () => {
  const [cookies, removeCookie ] = useCookies(['token']);
  const [tools , setTools] = useState([]);
  const [teams , setTeams] = useState([]);
  const [pmTeam , setPmTeam] = useState('');
  const [members , setMembers] = useState([]);
  const [inputMember , setInputMember] = useState('');
  const [inputTeam , setInputTeam] = useState('');
  const [places, setPlaces] = useState([]);
  const [projects, setProjects] = useState([]);
  const [project, setProject] = useState({
    팀수주: "",
    팀매출: "",
    프로젝트코드: "",
    프로젝트명: "",
    상태: "1.예산확보",
    실: "VT",
    고객사:"",
    고객부서:"",
    ManMonth:0,
    프로젝트계약금액_백만:0,
    상반기예상수주:0,
    상반기수주:0,
    상반기예상매출:0,
    상반기매출:0,
    하반기예상수주:0,
    하반기수주:0,
    하반기예상매출:0,
    하반기매출:0,
    장비비:0,
    컨설팅비:0,
    도구비:0,
    착수: moment(new Date()).format("YYYY-MM-DD"),
    종료: moment(new Date()).format("YYYY-MM-DD"),
    고객담당자:"",
    근무지:"",
    업무:"",
    도구:"",
    과제성격:"전략과제",
    사업지역:"국내",
    PM:"",
    투입명단:"",
    주간보고서: "1",
    실적보고: "1",
    year: moment(new Date()).format("YYYY"),
  });

  useEffect(()=> findAllProjects(), []);

  const findAllProjects = () => {
    axios.defaults.headers.common['Authorization'] = cookies.token;
    axios
    .all([
      axios.get(`http://${process.env.REACT_APP_API_URL}/teams`),
      axios.get(`http://${process.env.REACT_APP_API_URL}/tools`),
      axios.get(`http://${process.env.REACT_APP_API_URL}/members`),
      axios.get(`http://${process.env.REACT_APP_API_URL}/places`),
      axios.get(`http://${process.env.REACT_APP_API_URL}/projects`)
    ])
    .then(axios.spread((res1, res2, res3, res4, res5)=>{
      const _teams = res1.data.filter(d => d.year === new Date().getFullYear());
      setTeams(_teams);
      setTools(res2.data);
      setMembers(res3.data.sort((a, b) => a.name.localeCompare(b.name)).sort((a,b)=>  a.소속 ? b.소속 ? a.소속.localeCompare(b.소속) : -1 : 1));
      setPlaces(res4.data.sort((a,b) => a.num - b.num));
      setProjects(res5.data);
    }))
    .catch(err => {
      if (cookies.token) {
        removeCookie('token');
      }
      alert("세션이 만료되었습니다. 다시 로그인 해주세요");
      window.location.href = "/";
    });
  }
  
  const onChangeInput = (e) => {
    setProject({
      ...project,
      [e.target.id]: e.target.value
    });
  };

  const onClickSubmit = () => {
    if (project.프로젝트명 === "") {
      alert("프로젝트명을 입력해주세요.");
      return;
    }
    const result = window.confirm("등록하시겠습니까?");
    if (result) {
      const _projects = projects.filter(_project => Number(_project.year) === Number(project.year));
      _projects.push(project);
      syncWithGoogle(
        _projects,
        members,
        Number(project.year) === new Date().getFullYear() ? "동기화시트" : "동기화시트_" + project.year);
      axios.post(`http://${process.env.REACT_APP_API_URL}/projects/add`, {project: project})
      .then(res => {
        alert("등록되었습니다.");
      })
      .catch(err => {
        if (cookies.token) {
          removeCookie('token');
        }
        alert("세션이 만료되었습니다. 다시 로그인 해주세요");
        window.location.href = "/";
      });
      window.location.href = "#/app/projects/list";
    }
  };

  return (
    <div>
      <Row>
        <Col>
          <Widget title={<p style={{ fontSize:30, fontWeight: 700 }}>프로젝트 등록</p>}>
            <Table className="new-project__table">
              <tbody>
                <tr className="new-project__table_head">
                  <td colSpan='2' className="col-1">팀(수주)</td>
                  <td colSpan='2' className="col-1">팀(매출)</td>
                </tr>
                <tr>
                  <td colSpan='2'>
                    <select className="form-control" id="팀수주" value={project.팀수주} onChange={onChangeInput}>
                      <option value="" disabled hidden></option>
                      {teams.map(team => <option key={team.num} value={team.teamname}>{team.teamname}</option>)}
                    </select>
                  </td>
                  <td colSpan='2'>
                    <select className="form-control" id="팀매출" value={project.팀매출} onChange={onChangeInput}>
                      <option value="" disabled hidden></option>
                      {teams.map(team => <option key={team.num} value={team.teamname}>{team.teamname}</option>)}
                    </select>  
                  </td>
                </tr>
                <tr className="new-project__table_head">
                  <td colSpan='4'>프로젝트코드</td>
                </tr>
                <tr>
                  <td colSpan='4'>
                    <input className="form-control" id="프로젝트코드" value={project.프로젝트코드} onChange={onChangeInput}/>  
                  </td>
                </tr>
                <tr className="new-project__table_head">
                  <td colSpan='4'>프로젝트명</td>
                </tr>
                <tr>
                  <td colSpan='4'>
                    <input type="text" className="form-control" id="프로젝트명" value={project.프로젝트명} onChange={onChangeInput}/>
                  </td>
                </tr>
                <tr className="new-project__table_head">
                  <td colSpan='4'>상태</td>
                </tr>
                <tr>
                  <td colSpan='4'>
                    <select className="form-control" id="상태" value={project.상태} onChange={onChangeInput}>
                      {statusData.map(status => <option key={status.id} value={status.name}>{status.name}</option>)}
                    </select>
                  </td>
                </tr>
                <tr className="new-project__table_head">
                  <td colSpan='2'>고객사</td>
                  <td>고객부서</td>
                  <td>고객담당자</td>
                </tr>
                <tr>
                  <td colSpan='2'><input className="form-control" id="고객사" value={project.고객사} onChange={onChangeInput}/></td>
                  <td><input className="form-control" id="고객부서" value={project.고객부서} onChange={onChangeInput}/></td>
                  <td><input className="form-control" id="고객담당자" value={project.고객담당자} onChange={onChangeInput}/></td>
                </tr>
                <tr className="new-project__table_head">
                  <td colSpan='4'>ManMonth</td>
                </tr>
                <tr>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
                  <td colSpan='4'><input type="number" className="form-control" id="ManMonth" value={project.ManMonth} onChange={onChangeInput}/></td>
                </tr>
                <tr className="new-project__table_head">
                  <td colSpan='4'>프로젝트계약금액_백만</td>
                </tr>
                <tr>
                  <td colSpan='4'><input type="number" className="form-control" id="프로젝트계약금액_백만" value={project.프로젝트계약금액_백만} onChange={onChangeInput}/></td>
                </tr>
                <tr className="new-project__table_head">
                  <td>상반기예상수주</td>
                  <td>상반기수주</td>
                  <td>상반기예상매출</td>
                  <td>상반기매출</td>
                </tr>
                <tr>
                  <td><input type="number" className="form-control" id="상반기예상수주" value={project.상반기예상수주} onChange={onChangeInput}/></td>
                  <td><input type="number" className="form-control" id="상반기수주" value={project.상반기수주} onChange={onChangeInput}/></td>
                  <td><input type="number" className="form-control" id="상반기예상매출" value={project.상반기예상매출} onChange={onChangeInput}/></td>
                  <td><input type="number" className="form-control" id="상반기매출" value={project.상반기매출} onChange={onChangeInput}/></td>
                </tr>
                <tr className="new-project__table_head">
                  <td>하반기예상수주</td>
                  <td>하반기수주</td>
                  <td>하반기예상매출</td>
                  <td>하반기매출</td>
                </tr>
                <tr>
                  <td><input type="number" className="form-control" id="하반기예상수주" value={project.하반기예상수주} onChange={onChangeInput}/></td>
                  <td><input type="number" className="form-control" id="하반기수주" value={project.하반기수주} onChange={onChangeInput}/></td>
                  <td><input type="number" className="form-control" id="하반기예상매출" value={project.하반기예상매출} onChange={onChangeInput}/></td>
                  <td><input type="number" className="form-control" id="하반기매출" value={project.하반기매출} onChange={onChangeInput}/></td>
                </tr>
                <tr className="new-project__table_head">
                  <td colSpan='4'>비용</td>
                </tr>
                <tr>
                  <td colSpan='4'>
                    <div  style={{display: 'flex', alignItems:'center'}}>
                      장비비 : <input className="form-control" style={{ marginLeft: 7, marginRight: 15, width: 100 }} type="number"  id="장비비" value={project.장비비} onChange={onChangeInput}/>
                      컨설팅비 : <input className="form-control" style={{ marginLeft: 7, marginRight: 15, width: 100 }} type="number"  id="컨설팅비" value={project.컨설팅비} onChange={onChangeInput}/>
                      도구비 : <input className="form-control" style={{ marginLeft: 7, marginRight: 15, width: 100 }} type="number"  id="도구비" value={project.도구비} onChange={onChangeInput}/>
                    </div>
                  </td>
                </tr>
                <tr className="new-project__table_head">
                  <td colSpan='2'>착수</td>
                  <td colSpan='2'>종료</td>
                </tr>
                <tr>
                  <td colSpan='2'>
                  <Flatpickr
                    className="form-control"
                    value={project.착수}
                    options={
                      {dateFormat: "Y-m-d"}
                    }
                    onChange={착수 => {
                      setProject({...project, 착수: moment(new Date(착수[0])).format("YYYY-MM-DD")});
                    }}
                  />
                  </td>
                  <td colSpan='2'>
                  <Flatpickr
                    className="form-control"
                    value={project.종료}
                    options={
                      {dateFormat: "Y-m-d"}
                    }
                    onChange={종료 => {
                      setProject({...project, 종료: moment(new Date(종료[0])).format("YYYY-MM-DD")});
                    }}
                  />
                  </td>
                </tr>
                <tr className="new-project__table_head">
                  <td>Year</td>
                  <td>근무지</td>
                  <td>업무</td>
                  <td>도구</td>
                </tr>
                <tr>
                  <td><input className="form-control" type="number" id="year" value={project.year} onChange={onChangeInput}/></td>
                  <td>
                    <select className="form-control" id="근무지" value={project.근무지} onChange={onChangeInput}>
                      <option value="" disabled hidden></option>
                      {places.filter(place => Number(place.year) === Number(project.year)).map((place, index) => (
                        <option key={index} value={place.name}>{place.name}</option>
                      ))}
                    </select>
                  </td>
                  <td><input className="form-control" id="업무" value={project.업무} onChange={onChangeInput}/></td>
                  <td>
                    <select className="form-control" id="도구" value={project.도구} onChange={onChangeInput}>
                      <option value="" disabled hidden></option>
                      {tools.map(tool => <option key={tool.num} value={tool.toolname}>{tool.toolname}</option>)}
                    </select>  
                  </td>
                </tr>
                <tr className="new-project__table_head">
                  <td colSpan='2'>과제성격</td>
                  <td colSpan='2'>사업지역</td>
                </tr>
                <tr>
                  <td colSpan='2'>
                    <select className="form-control" id="과제성격" value={project.과제성격} onChange={onChangeInput}>
                      {characterData.map(character => <option key={character.id} value={character.name}>{character.name}</option>)}
                    </select>
                  </td>
                  <td colSpan='2'>
                    <select className="form-control" id="사업지역" value={project.사업지역} onChange={onChangeInput}>
                      {countryData.map(country => <option key={country.id} value={country.name}>{country.name}</option>)}
                    </select>
                  </td>
                </tr>
                <tr className="new-project__table_head">
                  <td colSpan='4'>PM</td>
                </tr>
                <tr>
                  <td colSpan='4'>
                    <div style={{display:'flex', flexDirection:'row', justifyContent:'space-around'}}>
                      <select style={{width:45+'%'}} className="form-control" id="PM" value={pmTeam} onChange={(e) => {setPmTeam(e.target.value); setProject({...project, PM: ''});}}>
                        <option value="" disabled hidden></option>
                        {teams.map(team => <option key={team.num} value={team.teamname}>{team.teamname}</option>)}
                      </select>
                      <select style={{width:45+'%'}} className="form-control" id="PM" value={project.PM} onChange={onChangeInput}>
                        <option value="" disabled hidden></option>
                        {members
                          .filter(member => member.team === pmTeam)
                          .map(member => <option key={member.num} value={member.id}>{member.소속+"-"+member.name+"("+member.직급+")"}</option>)
                        }
                      </select>
                    </div>
                  </td>
                </tr>
                <tr className="new-project__table_head">
                  <td colSpan='4'>투입명단</td>
                </tr>
                <tr>
                  <td colSpan='4'>
                    <div style={{display:'flex', flexDirection:'row', justifyContent:'space-around', marginBottom:0.5+'rem'}}>
                      <select style={{width:45+'%'}} className="form-control" id="PM" value={inputTeam} onChange={(e) => {setInputTeam(e.target.value); setInputMember("");}}>
                        <option value=""></option>
                        {teams.map(team => <option key={team.num} value={team.teamname}>{team.teamname}</option>)}
                      </select>
                      <select style={{width:45+'%'}} className="form-control" id="투입명단" value={inputMember} onChange={(e) =>{setInputMember(e.target.value); setProject({...project, 투입명단: project.투입명단 + " " + e.target.value});}}>
                        <option value="" disabled hidden></option>
                        {members
                          .filter(member => member.team === inputTeam)
                          .map(member => <option key={member.num} value={member.id}>{member.소속+"-"+member.name+"("+member.직급+")"}</option>)
                        }
                      </select>
                    </div>
                    <Table className="new-project-input-member__table">
                      <thead>
                        <tr>
                          <th className="col-2">소속</th>
                          <th className="col-2">팀</th>
                          <th className="col-1">직급</th>
                          <th className="col-1">이름</th>
                          <th className="col-1">삭제</th>
                        </tr>
                      </thead>
                      <tbody>
                        {project.투입명단.split(' ').map(input => {
                          const memberInfo = members.find(member => member.id === input);
                          if (memberInfo) {
                            return (
                              <tr key={memberInfo.num}>
                                <td>{memberInfo.소속}</td>
                                <td>{memberInfo.team}</td>
                                <td>{memberInfo.직급}</td>
                                <td>{memberInfo.name}</td>
                                <td><button className="btn btn-danger" onClick={() => {
                                  setProject({...project, 투입명단: project.투입명단.replace(input, "")});
                                }}>삭제</button></td>
                              </tr>
                            )
                          }
                        })}
                      </tbody>
                    </Table>
                  </td>
                </tr>
                <tr className="new-project__table_head">
                  <td colSpan='2'>주간보고서</td>
                  <td colSpan='2'>실적보고</td>
                </tr>
                <tr>
                  <td colSpan='2'>
                    <label style={{marginRight: 10}}>
                      <input type="radio" id="주간보고서" value="1" checked={Number(project.주간보고서) === 1} onChange={onChangeInput}/>
                      사용
                    </label>
                    <label>
                      <input type="radio" id="주간보고서" value="0" checked={Number(project.주간보고서) === 0} onChange={onChangeInput}/>
                      미사용
                    </label>
                  </td>
                  <td colSpan='2'>
                    <label style={{marginRight: 10}}>
                      <input type="radio" id="실적보고" value="1" checked={Number(project.실적보고) === 1} onChange={onChangeInput}/>
                      사용
                    </label>
                    <label>
                      <input type="radio" id="실적보고" value="0" checked={Number(project.실적보고) === 0} onChange={onChangeInput}/>
                      미사용
                    </label>
                  </td>
                </tr>
              </tbody>
            </Table>
            <Button color="primary" style={{marginRight: 10}} onClick={onClickSubmit}>등록</Button>
          </Widget>
        </Col>
      </Row>
    </div>
  );
}

export default NewProject;