import React, { useState, useEffect } from 'react';
import { Table, Button } from 'reactstrap';
import Flatpickr from "react-flatpickr";
import Widget from '../../components/Widget/Widget';
import moment from 'moment';
import axios from 'axios';
import { useCookies } from 'react-cookie';

const DetailSchedule = (props) => {
  const [cookies, removeCookie] = useCookies(['token']);
  const [places, setPlaces] = useState([]);
  const [isEtcAM, setIsEtcAM] = useState(false);
  const [isEtcPM, setIsEtcPM] = useState(false);
  const id = props.match.params.id;
  const [schedule, setSchedule] = useState([
    {
      이름: '',
      날짜: '',
      오전: '',
      오후: '',
    }
  ]);

  const onClickUpdate = () => {
    if(schedule[0].오전 === '' || schedule[0].오후 === '') {
      alert('스케줄을 입력해주세요');
      return;
    }
    axios
    .post('/schedule/add', {schedule})
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

  const onClickDelete = () => {
    axios
    .post('/schedule/delete', {id})
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

  useEffect(()=> findAllInfos(), []);

  const findAllInfos = () => {
    axios.defaults.headers.common['Authorization'] = cookies.token;
    axios
    .all([axios.get(`http://${process.env.REACT_APP_API_URL}/schedule/search?id=${props.match.params.id}`),
    axios.get(`http://${process.env.REACT_APP_API_URL}/places`)])
    .then(axios.spread((res1, res2) => {
      const places = res2.data.sort((a, b) => a.num - b.num)
      setPlaces(places);
      if (res1.data.length > 0) {
        setSchedule(res1.data);
        if (!res2.data.filter(place => Number(place.year) === new Date(res1.data[0].날짜).getFullYear()).find(({name}) => name === res1.data[0].오전)
        && res1.data[0].오전 !== '휴무일'&& res1.data[0].오전 !== '교육' && res1.data[0].오전 !== '재택' && res1.data[0].오전 !== '휴가') {
          setIsEtcAM(true);
        }
        if (!res2.data.filter(place => Number(place.year) === new Date(res1.data[0].날짜).getFullYear()).find(({name}) => name === res1.data[0].오후)
        && res1.data[0].오후 !== '휴무일'&& res1.data[0].오후 !== '교육' && res1.data[0].오후 !== '재택' && res1.data[0].오후 !== '휴가') {
          setIsEtcPM(true);
        }
      }
    }))
    .catch(err => {
      if (cookies.token) {
        removeCookie('token');
      }
      alert("세션이 만료되었습니다. 다시 로그인 해주세요");
      window.location.href = "/";
    });
  }

  return (
    <>
      <Widget title={<p style={{ fontSize:20, fontWeight: 700 }}>일정 수정</p>}>
        <Table>
          <tbody>
            <tr>
              <td>날짜</td>
              <td>
                <Flatpickr
                  className="form-control"
                  value={schedule[0].날짜}
                  onChange={(date) =>
                    setSchedule(schedule.map(({이름, 날짜, 오전, 오후}) => 
                    ({이름, 날짜: moment(new Date(date)).format("YYYY-MM-DD"), 오전, 오후})))}
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
          </tbody>
        </Table>
        <Button color="primary" onClick={onClickUpdate}>수정</Button>
        <Button color="primary" onClick={onClickDelete}>삭제</Button>
      </Widget>
    </>
  );
}

export default DetailSchedule;