import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Table, UncontrolledButtonDropdown, DropdownMenu, DropdownToggle, DropdownItem} from 'reactstrap';
import Button from 'reactstrap/lib/Button';
import Widget from '../../components/Widget/Widget';
import './ReportList.scss';
import moment from 'moment';
import { useCookies } from 'react-cookie';

// weeknum 구하는 메서드 정의
Date.prototype.getWeek = function (dowOffset) {
  /*getWeek() was developed by Nick Baicoianu at MeanFreePath: http://www.meanfreepath.com */

  dowOffset = typeof(dowOffset) == 'number' ? dowOffset : 0; // dowOffset이 숫자면 넣고 아니면 0
  const newYear = new Date(this.getFullYear(),0,1);
  let day = newYear.getDay() - dowOffset; //the day of week the year begins on
  day = (day >= 0 ? day : day + 7);
  const daynum = Math.floor((this.getTime() - newYear.getTime() -
    (this.getTimezoneOffset()-newYear.getTimezoneOffset())*60000)/86400000) + 1;
  let weeknum;
  //if the year starts before the middle of a week
  if(day < 4) {
    weeknum = Math.floor((daynum+day-1)/7) + 1;
    if(weeknum > 52) {
      let nYear = new Date(this.getFullYear() + 1,0,1);
      let nday = nYear.getDay() - dowOffset;
      nday = nday >= 0 ? nday : nday + 7;
      /*if the next year starts before the middle of
        the week, it is week #1 of that year*/
      weeknum = nday < 4 ? 1 : 53;
    }
  }
  else {
    weeknum = Math.floor((daynum+day-1)/7);
  }
  if (weeknum === 0) {
    let tempWeeknum = new Date(this.setDate(new Date(this).getDate() - 7)).getWeek(3);
    weeknum = tempWeeknum + 1;
  }
  return weeknum;
};

// 년도별 주차 정보 리스트
const weekNumInfo =  [
  ...Array(moment(new Date()).format('YYYY') - 2019).keys()
].map(i => {
  return {
    year: 2020 + i,
    date: new Date(new Date(2020, 0, 1).setDate(new Date(2020, 0, 1).getDate() + i * (7 * new Date(2019 + i, 11, 28).getWeek(3)))),
    weekNum: new Date(2020 + i, 11, 28).getWeek(3),
  }
});

const ReportList = () => {
  const [cookies, removeCookie ] = useCookies(['token']);
  const [termYear, setTermYear] = useState(new Date().getFullYear());
  const [termWeek, setTermWeek] = useState(new Date().getWeek(3));
  const [projects, setProjects] = useState([]);
  const [reports, setReports] = useState([]);
  const [thisReport, setThisReport] = useState([]);
  const [thisProjects, setThisProjects] = useState([]);
  const [members, setMembers] = useState([]);


  const onChangeTerm = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case "termYear":
        return (setTermYear(value));
      case "termWeek":
        return (setTermWeek(value));
      default:
        return;
    }
  };

  const weekNumOptions = () => { // 주차 옵션
    let weekNum = [];
    const targetYear = weekNumInfo.find(info => Number(info.year) === Number(termYear));
    const maxWeekNum = targetYear.weekNum;
    let startDate = new Date(targetYear.date);
    let endDate = new Date(targetYear.date);
    endDate.setDate(endDate.getDate() + 6);
    for (let i = 1; i <= maxWeekNum; i++) {
      weekNum.push(<option key={i} value={i}>{i}주차 ({startDate.toLocaleDateString()}~{endDate.toLocaleDateString()})</option>);
      startDate.setDate(startDate.getDate() + 7);
      endDate.setDate(endDate.getDate() + 7);
    }
    return weekNum;
  }

  useEffect(()=> findAllInfos(), []);

  const findAllInfos = () => {
    axios.defaults.headers.common['Authorization'] = cookies.token;
    axios
    .all([
      axios.get(`http://${process.env.REACT_APP_API_URL}/projects`),
      axios.get(`http://${process.env.REACT_APP_API_URL}/reports`),
      axios.get(`http://${process.env.REACT_APP_API_URL}/members`)])
    .then(axios.spread((res1,res2, res3) => {
      const _projects = res1.data.filter((project) => Number(project.주간보고서) === 1 && Number(project.year) === Number(termYear) && project.상태 !== "8.Dropped")
      setProjects(res1.data);
      setThisProjects(_projects);
      setReports(res2.data);
      const thisReport = res2.data.filter(report =>
        (new Date(report.최종수정시간).getFullYear() === Number(termYear) && new Date(report.최종수정시간).getWeek(3) === Number(termWeek))
        || (new Date(report.최종수정시간.substring(0,10)).getFullYear() === Number(termYear) && new Date(report.최종수정시간.substring(0,10)).getWeek(3) === Number(termWeek)));
      setThisReport(thisReport);
      setMembers(res3.data);
    }))
    .catch(err => {
      if (cookies.token) {
        removeCookie('token');
      }
      alert("세션이 만료되었습니다. 다시 로그인 해주세요");
      window.location.href = "/";
    });
  };

  return (
    <>
      <Row>
        <Col>
          <Widget title={
            <div style={{width: 100+'%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
              <p style={{ fontSize:30, fontWeight: 700 }}>주간보고</p>
              <div style={{display: 'flex', flexDirection: 'row'}}>
                <select className="form-control" value={termYear} name="termYear" onChange={onChangeTerm} style={{width: 'auto', marginRight: 1 + 'rem'}}>
                  {[...Array(moment(new Date()).format('YYYY') - 2019).keys()]
                  .map((i)=>{
                    return <option key={i} value={moment(new Date()).format('YYYY') - i}>{moment(new Date()).format('YYYY') - i}</option>
                  })}
                </select>
                <select className="form-control" value={termWeek} name="termWeek" onChange={onChangeTerm} style={{width: 'auto', marginRight: 1 + 'rem'}}>
                  {weekNumOptions()}
                </select>
                <Button color="primary" onClick={() => setTermWeek(new Date().getWeek(3)) && setTermYear(new Date().getFullYear())}>이번주보기</Button>
              </div>
            </div>}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 1+'rem'}}>
              <UncontrolledButtonDropdown>
                <DropdownToggle color={"info"} style={{borderRadius: 0}} >
                미등록 프로젝트{' '}
                {thisProjects
                .filter(project => !thisReport.find(report => Number(report.project_id) === Number(project.id))).length}/{thisProjects.length}
                </DropdownToggle>
                <DropdownMenu>
                  {thisProjects
                  .filter(project => !thisReport.find(report => Number(report.project_id) === Number(project.id)))
                  .map((data, index) => {
                    return (
                      <DropdownItem key={index}>
                        {data.프로젝트명}
                      </DropdownItem>
                    );
                  })}
                </DropdownMenu>
              </UncontrolledButtonDropdown>
              <div>
                <Link to="/app/projects/reports/new">
                    <button className="btn btn-primary">주간 보고서 작성</button>
                </Link>
              </div>
            </div>
            <Table>
              <thead>
                <tr className="report-list__tr">
                  <th className="col-4 report-list__th">프로젝트</th>
                  <th className="col-2 report-list__th">고객사</th>
                  <th className="col-2 report-list__th">PM</th>
                  <th className="col-2 report-list__th">최종수정시간</th>
                </tr>
              </thead>
              <tbody>
                {reports
                .filter(report => (new Date(report.최종수정시간).getFullYear() === Number(termYear) && new Date(report.최종수정시간).getWeek(3) === Number(termWeek)) 
                || (new Date(report.최종수정시간.substring(0,10)).getFullYear() === Number(termYear) && new Date(report.최종수정시간.substring(0,10)).getWeek(3) === Number(termWeek)))
                .map(report => {
                  const _project = projects.find(project => project.id === report.project_id && Number(project.year) === Number(termYear))
                  const member = members.find(({id}) => id === _project.PM);
                  return (
                    <tr key={report.id}>
                      <td className="col-4">
                        <Link to={{pathname: `reports/${_project.id}/${report.id}/${_project.year}`}}>
                          {_project.프로젝트명}
                        </Link>
                      </td>
                      <td className="col-2 report-list__td">{_project ? _project.고객사: ""}</td>
                      <td className="col-2 report-list__td">{member ? member.name : ""}</td>
                      <td className="col-2 report-list__td">{new Date(report.최종수정시간) == 'Invalid Date' ? report.최종수정시간 : new Date(report.최종수정시간).toLocaleString()}</td>
                    </tr>
                )}
                )}
              </tbody>
            </Table>
          </Widget>
        </Col>
      </Row>
    </>
  );
}

export default ReportList;