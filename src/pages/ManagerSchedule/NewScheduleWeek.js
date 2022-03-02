import React, { useState, useEffect } from 'react';
import Widget from '../../components/Widget/Widget';
import moment from "moment";
import axios from 'axios';
import Button from 'reactstrap/lib/Button';
import './NewScheduleWeek.scss';
import { useCookies } from 'react-cookie';

const NewScheduleWeek = (props) => {
  const [cookies, removeCookie ] = useCookies(['token']);
  const [places, setPlaces] = useState([]);
  const days = ['월요일', '화요일', '수요일', '목요일', '금요일'];
  let dates = [];
  let defaultDate = props.location.state ? moment(new Date(props.location.state.date)).format("YYYY-MM-DD") : moment(new Date()).format('YYYY-MM-DD');
  let daynum = props.location.state ? new Date(props.location.state.date).getDay() : new Date().getDay();
  console.log(props.location.state);
  if (daynum === 0) {
    defaultDate = moment(new Date(defaultDate).setDate(new Date(defaultDate).getDate() + 1)).format('YYYY-MM-DD');
    daynum = 1;
  }
  if (daynum === 6) {
    defaultDate = moment(new Date(defaultDate).setDate(new Date(defaultDate).getDate() + 2)).format('YYYY-MM-DD');
    daynum = 1;
  }
  for (let i = 1; i < daynum; i++) {
    dates.push(moment(new Date(new Date(defaultDate).setDate(new Date(defaultDate).getDate() - daynum + i))).format("YYYY-MM-DD"));
  }
  for (let i = 0; i < 6 - daynum; i++) {
    dates.push(moment(new Date(new Date(defaultDate).setDate(new Date(defaultDate).getDate() + i))).format("YYYY-MM-DD"));
  }
  const [isEtcAM, setIsEtcAM] = useState([false, false, false, false, false]);
  const [isEtcPM, setIsEtcPM] = useState([false, false, false, false, false]);
  const [schedule, setSchedule] = useState([
    {
      이름: '',
      날짜: dates[0],
      오전: '휴무일',
      오후: '휴무일',
    },
    {
      이름: '',
      날짜: dates[1],
      오전: '휴무일',
      오후: '휴무일',
    },
    {
      이름: '',
      날짜: dates[2],
      오전: '휴무일',
      오후: '휴무일',
    },
    {
      이름: '',
      날짜: dates[3],
      오전: '휴무일',
      오후: '휴무일',
    },
    {
      이름: '',
      날짜: dates[4],
      오전: '휴무일',
      오후: '휴무일',
    }
  ]);

  const onClickSave = () => {
    axios.defaults.headers.common['Authorization'] = cookies.token;
    if (schedule.filter(item => item.오전 === '' || item.오후 === '').length > 0) {
      alert('스케줄을 입력해주세요');
      return;
    }
    axios.post('/schedule/add', {schedule})
    .then(res => {})
    .catch(err => {
      if (cookies.token) {
        removeCookie('token');
      }
      alert("세션이 만료되었습니다. 다시 로그인 해주세요");
      window.location.href = "/";
    });
    window.location.href = "#/app/schedule";
    window.location.reload();
  }

  useEffect(()=> {
    const _이름 = JSON.parse(localStorage.getItem("userInfo")) ? JSON.parse(localStorage.getItem("userInfo")).id : '';
    setSchedule(schedule.map(({이름, 날짜, 오전, 오후}) => ({이름: _이름, 날짜, 오전, 오후})));
    findAllInfo();
  }, []);

  const findAllInfo = () => {
    axios.defaults.headers.common['Authorization'] = cookies.token;
    axios.get(`http://${process.env.REACT_APP_API_URL}/places`)
    .then(res => setPlaces(res.data.sort((a, b) => a.num - b.num).filter(place => place.year === new Date().getFullYear())))
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
      <Widget title={<p style={{ fontSize:20, fontWeight: 700 }}>일주일 일정 추가</p>}>
        <div className="schedule__row">
          {dates.map((date, index) => (
            <div className="schedule__card" key={index}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, borderBottom: 2 + 'px solid rgb(237, 125, 49)'}}>{days[index]}</div>
                <div style={{ fontSize: 15, marginBottom: 3}}>{date}</div>
              </div>
              <div className="schedule__card__row">
                <div className="schedule__card__row_top">
                  <div className="schedule__card__row__text">오전: </div>
                  <select className="form-control" value={schedule[index].오전} onChange={(e) => {
                    if(e.target.value === '') {
                      setIsEtcAM(isEtcAM.map((item, i) => index === i ? true : item));
                    } else {
                      setIsEtcAM(isEtcAM.map((item, i) => index === i ? false : item));
                    }
                    const _schedule = schedule.map((_schedule, _index) => {
                      if (_index === index) {
                        return {
                          ..._schedule,
                          오전: e.target.value
                        }
                      }
                      return _schedule;
                    })
                    setSchedule(_schedule);
                  }}>
                    <option value="">기타</option>
                    {places.map((place, index) => (
                      <option key={index} value={place.name}>{place.name}</option>
                    ))}
                    <option value="휴무일">휴무일</option>
                    <option value="교육">교육</option>
                    <option value="재택">재택</option>
                    <option value="휴가">휴가</option>
                  </select>
                </div>
                <div>
                  {isEtcAM[index] && 
                    <input className="form-control" value={schedule[index].오전} onChange={(e) => {
                      const _schedule = schedule.map((_schedule, _index) => {
                        if (_index === index) {
                          return {
                            ..._schedule,
                            오전: e.target.value
                          }
                        }
                        return _schedule;
                      })
                      setSchedule(_schedule);
                    }}/>
                  }
                </div>
              </div>
              <div className="schedule__card__row">
                <div className="schedule__card__row_top">
                  <div className="schedule__card__row__text">오후: </div>
                  <select className="form-control" value={schedule[index].오후} onChange={(e) => {
                    if(e.target.value === '') {
                      setIsEtcPM(isEtcPM.map((item, i) => i === index ? true : item));
                    } else {
                      setIsEtcPM(isEtcPM.map((item, i) => i === index ? false : item));
                    }
                    const _schedule = schedule.map((_schedule, _index) => {
                      if (_index === index) {
                        return {
                          ..._schedule,
                          오후: e.target.value
                        }
                      }
                      return _schedule;
                    })
                    setSchedule(_schedule);
                  }}>
                    <option value="">기타</option>
                    {places.map((place, index) => (
                      <option key={index} value={place.name}>{place.name}</option>
                    ))}
                    <option value="휴무일">휴무일</option>
                    <option value="교육">교육</option>
                    <option value="재택">재택</option>
                    <option value="휴가">휴가</option>
                  </select>
                </div>
                {isEtcPM[index] &&
                  <input className="form-control" value={schedule[index].오후} onChange={(e) => {
                    const _schedule = schedule.map((_schedule, _index) => {
                      if (_index === index) {
                        return {
                          ..._schedule,
                          오후: e.target.value
                        }
                      }
                      return _schedule;
                    })
                    setSchedule(_schedule);
                  }}/>
                }
              </div>
            </div>
          ))}
        </div>
        <div class="schedule__all">
          아래에서 값 선택 시 해당 주의 모든 일정에 선택한 값이 전체 적용됩니다.
          <select className="form-control" onChange={(e) => {
            if(e.target.value === '') {
              setIsEtcAM([true, true, true, true, true]);
              setIsEtcPM([true, true, true, true, true]);
            } else {
              setIsEtcAM([false, false, false, false, false]);
              setIsEtcPM([false, false, false, false, false]);
            }
            const _schedule = schedule.map((_schedule) => {
              return {
                ..._schedule,
                오전: e.target.value,
                오후: e.target.value
              }
            })
            setSchedule(_schedule);
          }}>
            <option>선택하세요</option>
            <option value="">기타</option>
            {places.map((place, index) => (
              <option key={index} value={place.name}>{place.name}</option>
            ))}
            <option value="휴무일">휴무일</option>
            <option value="교육">교육</option>
            <option value="재택">재택</option>
            <option value="휴가">휴가</option>
          </select>
          {!isEtcAM.filter((item) => !item).length && 
          !isEtcPM.filter((item) => !item).length &&
          <input className="form-control" value={schedule[0].오전} onChange={(e) => {
            const _schedule = schedule.map((_schedule) => {
              return {
                ..._schedule,
                오전: e.target.value,
                오후: e.target.value
              }
            })
            setSchedule(_schedule);
          }}/>
          }
        </div>
        <Button color="primary" onClick={onClickSave}>저장</Button>
      </Widget>
    </>
  );
}

export default NewScheduleWeek;