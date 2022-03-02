import moment from "moment";
import React, { useState, useEffect } from "react";
import { Table } from "reactstrap";
import Button from "reactstrap/lib/Button";
import Widget from "../../components/Widget/Widget";
import axios from 'axios';
import { Link } from "react-router-dom";
import './ManagerSchedule.scss';
import { useCookies } from 'react-cookie';

const Schedule = () => {
  const authority = JSON.parse(localStorage.getItem("userInfo")) ? JSON.parse(localStorage.getItem("userInfo")).authority : "";
  const [schedule, setSchedule] = useState([]);
  const [today, setToday] = useState(new Date());
  const [days, setDays] = useState([]);
  const [members, setMembers] = useState([]);
  const [cookies] = useCookies(['token']);
  const [teams, setTeams] = useState([]);
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    let days = [];
    let daynum = today.getDay();
    let _today = today;
    if (daynum === 0) {
      _today = new Date(today).setDate(today.getDate() + 1);
      daynum = 1;
    }
    if (daynum === 6) {
      _today = new Date(today).setDate(today.getDate() + 2);
      daynum = 1;
    }
    for (let i = 1; i < daynum; i++) {
      days.push(moment(new Date(_today).setDate(new Date(_today).getDate() - daynum + i)).format("YYYY-MM-DD"));
    }
    for (let i = 0; i < 6 - daynum; i++) {
      days.push(moment(new Date(_today).setDate(new Date(_today).getDate() + i)).format("YYYY-MM-DD"));
    }
    setDays(days);
  }, [today]);

  const onClickBefore = () => {
    setToday(new Date(new Date(today).setDate(today.getDate() - 7)));
  };

  const onClickNext = () => {
    setToday(new Date(new Date(today).setDate(today.getDate() + 7)));
  };

  const onClickToday = () => {
    setToday(new Date());
  };

  useEffect(()=> findAllInfos(), []);

  const findAllInfos = () => {
    axios.defaults.headers.common['Authorization'] = cookies.token;
    axios
    .all([
      axios.get(`http://${process.env.REACT_APP_API_URL}/schedule`),
      axios.get(`http://${process.env.REACT_APP_API_URL}/members`),
      axios.get(`http://${process.env.REACT_APP_API_URL}/places`),
      axios.get(`http://${process.env.REACT_APP_API_URL}/teams`)
    ])
    .then(axios.spread((res1,res2,res3,res4)=>{
      setSchedule(res1.data);
      setMembers(res2.data);
      setPlaces(res3.data);
      setTeams(res4.data.sort((a,b)=>a.num - b.num));
    }))
    .catch(err => {
      console.log(err);
    });
  }

  const getColor = (date, _place) => {
    const place = places.find(place => Number(place.year) === new Date(date).getFullYear() && place.name === _place);
    return place ? place.color : '#fff';
  }

  return (
    <>
      {authority === 0 || authority === 1 ?
        <Widget title={
          <div style={{width: 100+'%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
            <p style={{ fontSize:30, fontWeight: 700 }}>관리자 스케줄</p>
            <div>
              <Link to={{pathname: "/app/schedule/add/week", state: {date: days[0]}}}>
                <Button color="success">일주일추가</Button>
              </Link>
              <Button color="success" onClick={() => window.location.reload()}>새로고침</Button>
            </div>
          </div>}>
          <div style={{width: 100+'%', textAlign: 'center', fontWeight: 700, fontSize: 20}}>
            {days[0]} ~ {days[4]}
            <div>
              <Button color="info" onClick={onClickBefore}>{'<'}</Button>
              <Button color="primary" onClick={onClickToday}>Today</Button>
              <Button color="info" onClick={onClickNext}>{'>'}</Button>
            </div>
          </div>
          <Table>
            <thead>
              <tr className="manager-schedule__tr" style={{textAlign:'center'}}>
                {days.map((day, index) => (
                  <th className="manager-schedule__th" key={index}>{moment(new Date(day)).format("ddd MM/DD")}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {days.map((day, index) => (
                  <td key={index} style={{height: 'max-content', width:20+ '%'}} className={day === moment(new Date()).format("YYYY-MM-DD") ? 'manager-schedule__td today' : 'manager-schedule__td'}>
                    <Link to={{pathname: `/app/schedule/add`, state: {date: day}}}>
                      <div style={{minHeight: 27+'rem', height: 100 + '%'}}>
                        {schedule
                        .filter(schedule => schedule.날짜 === day && members.find(member => member.id === schedule.이름))
                        .sort((a,b)=> (members.find(member => member.id === a.이름).team
                        && members.find(member => member.id === b.이름).team
                        && teams.find(({teamname, year}) => members.find(member => member.id === a.이름).team === teamname && year === new Date(day).getFullYear())
                        && teams.find(({teamname, year}) => members.find(member => member.id === b.이름).team === teamname && year === new Date(day).getFullYear()) ?
                        teams.find(({teamname, year}) => members.find(member => member.id === a.이름).team === teamname && year === new Date(day).getFullYear()).num
                        - teams.find(({teamname, year}) => members.find(member => member.id === b.이름).team === teamname && year === new Date(day).getFullYear()).num
                        : members.find(member => member.id === a.이름).team ? -1 : members.find(member => member.id === b.이름).team ? 1 : 0))
                        .sort((a,b)=> members.find(member => member.id === a.이름).직책 === "실장" ? -1 : 1)
                        .map((d, i) => {
                          if (d.날짜 === day) {
                            const member = members.find(({id}) => id === d.이름);
                            return (
                              <Link to={{pathname: `schedule/${d.id}`}} key={i}>
                                <div className={"manager-schedule__div "+ d.이름}>
                                  <div>{member ? member.name : ""}</div>
                                  <div>오전 : <span style={{backgroundColor: getColor(d.날짜, d.오전)}}>{d.오전}</span></div>
                                  <div>오후 : <span style={{backgroundColor: getColor(d.날짜, d.오후)}}>{d.오후}</span></div>
                                </div>
                              </Link>
                            );
                          }
                        }
                        )}
                      </div>
                    </Link>
                  </td>
                ))}
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
    </>
  );
}

export default Schedule;