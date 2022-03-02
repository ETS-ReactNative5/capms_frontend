import React, { useEffect, useState } from 'react';
import {
    Table,
    Button,
    Input,
} from "reactstrap";
import axios from "axios";
import moment from 'moment';
import { useCookies } from 'react-cookie';

const Place = () => {
  const [cookies, removeCookie ] = useCookies(['token']);
  const [places, setPlaces] = useState([]);
  const [place, setPlace] = useState({
    num: '',
    name: '',
    color: '',
    year: moment(new Date()).format('YYYY'),
  });
  const [year, setYear] = useState(moment(new Date()).format('YYYY'));

  const onChangeInput = (e) => {
    setPlace({
      ...place,
      [e.target.id]: e.target.value,
    });
  };

  useEffect(() => findAllInfo(), []);

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

  const onSave = () => {
    if (place.name && place.color && place.year) {
      if (place.num) {
        axios
          .post(`http://${process.env.REACT_APP_API_URL}/places/update`, {
            place: place
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
        axios
          .post(`http://${process.env.REACT_APP_API_URL}/places/add`, {
            num: places.filter(p => Number(p.year) === Number(year)).length + 1,
            name: place.name,
            color: place.color,
            year: place.year,
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
      console.log(place);
      alert("모든 항목을 입력해주세요.");
    }
  };

  const onDelete = (name, year) => {
    const confirm = window.confirm("삭제하시겠습니까?");
    if (confirm) {
      axios
        .post(`http://${process.env.REACT_APP_API_URL}/places/delete`, {name, year})
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

  const onChangeOrder = (e) => {
    axios
    .post(`http://${process.env.REACT_APP_API_URL}/places/order`, {places})
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
    const newPlaces = places
    .map(({num, name, color, year}) => {
      if (Number(year) === Number(_year)) {
        if (num === moving)
          return {num: target, name, color, year};
        else if (moving > target && num >= target && num < moving)
          return {num: num + 1, name, color, year};
        else if (moving < target && num > moving && num <= target)
          return {num: num - 1, name, color, year};
      }
      return {num, name, color, year};
    });
    newPlaces.sort((a, b) => a.num - b.num);
    setPlaces(newPlaces);
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
      <div className="place">
        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 0.5+'rem'}}>
          <p style={{ fontWeight: 700, fontSize: 1.5+'rem' }}>근무지 관리</p>
          <select className="form-control" style={{width: 8+'rem'}} id="year" value={year} onChange={(e) => {setYear(e.target.value); setPlace({...place, year: e.target.value})}}>
            {[...Array(moment(new Date()).format('YYYY') - 2018).keys()].map((i) => (
              <option key={i} value={moment(new Date()).format('YYYY') - i + 1}>{moment(new Date()).format('YYYY') - i + 1}</option>
            ))}
          </select>
        </div>
        <Table className="manage__table table-sm">
          <thead>
            <tr>
              <th className="col-1">순서<br /><br /><Button color="info" size="sm" onClick={onChangeOrder}>저장</Button></th>
              <th className="col-3">근무지<br /><br /><Input type="text" id="name" value={place.name} onChange={onChangeInput}/></th>
              <th className="col-2">색상<br /><br /><input type="color" id="color" value={place.color} onChange={onChangeInput}/></th>
              <th className="col-2">Action<br /><br /><Button size="sm" color="info" onClick={onSave}>{place.num ? "변경" : "추가"}</Button></th>
            </tr>
          </thead>
          <tbody>  
            {places ? places
            .filter((place) => Number(place.year) === Number(year))
            .map((place) => {
              return( 
              <tr key={place.num}>
                <td style={{ textAlign: "center", cursor: 'move' }}
                  id={place.num}
                  draggable
                  onDragStart={handleDragStart}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  >
                    {place.num}
                </td> 
                <td style={{ textAlign: "center" }}>{place.name}</td>
                <td style={{ textAlign: "center" }}><input type="color" value={place.color} readOnly disabled/></td>
                <td>
                  <Button color={"warning"} className="UpdateBtn" size="sm" variant="primary" onClick={()=>setPlace(place)}>수정</Button>
                  &nbsp;
                  <Button color={"default"} className="UpdateBtn" size="sm" variant="danger"onClick={() => onDelete(place.name, place.year)}>삭제</Button></td>
              </tr> 
              );
            })  :<tr><td colSpan="7">데이터가 없습니다.</td></tr>}
          </tbody>
        </Table>
      </div>
    </>
  );
};

export default Place;