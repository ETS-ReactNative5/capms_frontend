import React, { useState, useEffect } from 'react';
import Widget from '../../components/Widget/Widget';
import moment from "moment";
import Flatpickr from "react-flatpickr";
import axios from 'axios';
import Button from 'reactstrap/lib/Button';
import { Table } from 'reactstrap';
import { useCookies } from 'react-cookie';

const NewSchedule = (props) => {
  const [cookies, removeCookie ] = useCookies(['token']);
  const defaultDate = props.location.state ? moment(new Date(props.location.state.date)).format("YYYY-MM-DD") : moment(new Date()).format('YYYY-MM-DD');
  const [places, setPlaces] = useState([]);
  const [isEtcAM, setIsEtcAM] = useState(false);
  const [isEtcPM, setIsEtcPM] = useState(false);
  const [schedule, setSchedule] = useState([
    {
      이름: '',
      날짜: defaultDate,
      오전: '휴무일',
      오후: '휴무일',
    }
  ]);

  const onClickSave = () => {
    axios.defaults.headers.common['Authorization'] = cookies.token;
    if(schedule[0].오전 === '' || schedule[0].오후 === '') {
      alert('스케줄을 입력해주세요');
      return;
    }
    axios.post('/schedule/add', {schedule})
    .then(res => {
    })
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
  }, [])

  const findAllInfo = () => {
    axios.defaults.headers.common['Authorization'] = cookies.token;
    axios.get(`http://${process.env.REACT_APP_API_URL}/places`)
    .then(res => setPlaces(res.data.sort((a, b) => a.num - b.num)))
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
      <Widget title={<p style={{ fontSize:20, fontWeight: 700 }}>일정 추가</p>}>
        <Table>
          <tr>
            <td>날짜</td>
            <td>
              <Flatpickr
                className="form-control"
                value={schedule[0].날짜}
                onChange={(date) => setSchedule(schedule.map(({이름, 날짜, 오전, 오후}) => ({이름, 날짜: moment(new Date(date)).format("YYYY-MM-DD"), 오전, 오후})))}
                options={
                  {dateFormat: "Y-m-d"}
                }
              />
            </td>
          </tr>
          <tr>
            <td>오전</td>
            <td>
              <select
                className="form-control"
                value={schedule[0].오전}
                onChange={(e) => {
                  if(e.target.value === '') {
                    setIsEtcAM(true);
                  } else {
                    setIsEtcAM(false);
                  }
                  setSchedule(schedule.map(({이름, 날짜, 오전, 오후}) => ({이름, 날짜, 오전: e.target.value, 오후})))
                }}
              >
                <option value="">기타</option>
                {places.filter(place => Number(place.year) === new Date(schedule[0].날짜).getFullYear()).map((place, index) => (
                  <option key={index} value={place.name}>{place.name}</option>
                ))}
                <option value="휴무일">휴무일</option>
                <option value="교육">교육</option>
                <option value="재택">재택</option>
                <option value="휴가">휴가</option>
              </select>
              {isEtcAM &&
                <input className="form-control" value={schedule[0].오전}
                  onChange={(e) => setSchedule(schedule.map(({이름, 날짜, 오전, 오후}) => ({이름, 날짜, 오전: e.target.value, 오후})))}
                />
              }
            </td>
          </tr>
          <tr>
            <td>오후</td>
            <td>
              <select
                className="form-control"
                value={schedule[0].오후}
                onChange={(e) => {
                  if(e.target.value === '') {
                    setIsEtcPM(true);
                  } else {
                    setIsEtcPM(false);
                  }
                  setSchedule(schedule.map(({이름, 날짜, 오전, 오후}) => ({이름, 날짜, 오전, 오후: e.target.value})))
                }}
              >
                <option value="">기타</option>
                {places.filter(place => Number(place.year) === new Date(schedule[0].날짜).getFullYear()).map((place, index) => (
                  <option key={index} value={place.name}>{place.name}</option>
                ))}
                <option value="휴무일">휴무일</option>
                <option value="교육">교육</option>
                <option value="재택">재택</option>
                <option value="휴가">휴가</option>
              </select>
              {isEtcPM &&
                <input className="form-control" value={schedule[0].오후}
                  onChange={(e) => setSchedule(schedule.map(({이름, 날짜, 오전, 오후}) => ({이름, 날짜, 오전, 오후: e.target.value})))}
                />
              }
            </td>
          </tr>
        </Table>
        <Button color="primary" onClick={onClickSave}>저장</Button>
      </Widget>
    </>
  );
}

export default NewSchedule;