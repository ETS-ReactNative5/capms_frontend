import React, {useState,useEffect} from 'react';
import { Row, Col, Table, Button } from 'reactstrap';
import Widget from '../../components/Widget/Widget';
import moment from 'moment';
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/confetti.css";
import axios from 'axios';
import { useCookies } from 'react-cookie';

const DMeeting = (props) => {
  const [cookies, removeCookie ] = useCookies(['token']);
  const user = JSON.parse(localStorage.getItem('userInfo')) ? JSON.parse(localStorage.getItem('userInfo')).name : ''; 
  const columns = [ "회의명","작성자","회의장소","회의일시","작성일시","참석자(슈어)","참석자(고객사)","회의내용","이슈사항"];
  const [meetings, setMeetings] = useState([]);

  const onChangeInput = (e) => {
    setMeetings({
      ...meetings,
      [e.target.id]: e.target.value
    });
  };

  const onClickUpdate = () => {
    const result = window.confirm("수정하시겠습니까?");
    if(result){
      axios.post(`http://${process.env.REACT_APP_API_URL}/meetings/update`, {meetings: meetings})
      .then((response)=>{
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

  const onClickDelete = () => {
    const result = window.confirm("삭제하시겠습니까?");
    if (result) {
      axios.post(`http://${process.env.REACT_APP_API_URL}/meetings/delete`, {id: meetings.id})
      .then((response)=>{
        console.log(response);
      })
      .catch(err => {
        if (cookies.token) {
          removeCookie('token');
        }
        alert("세션이 만료되었습니다. 다시 로그인 해주세요");
        window.location.href = "/";
      });
      window.location.href = "#/app/projects/meetings";
    }
  };

  useEffect(()=> findAllmeetings(), []);

  const findAllmeetings = () => {
    axios.defaults.headers.common['Authorization'] = cookies.token;
    axios.get(`http://${process.env.REACT_APP_API_URL}/meetings/search?id=${props.match.params.id}`)
    .then((res)=>{
      setMeetings(res.data[0]);
    })
    .catch(err => {
      if (cookies.token) {
        removeCookie('token');
      }
      alert("세션이 만료되었습니다. 다시 로그인 해주세요");
      window.location.href = "/";
    });
 }

  return (
    <div>
      <Row>
        <Col>
          <Widget title={<p style={{ fontSize:30, fontWeight: 700 }}>회의록 상세</p>}>
            <Table striped bordered responsive>
              <tbody>
                <tr style={{fontWeight: 'bold'}}>
                  <td colSpan='2'>{columns[0]}</td>
                </tr>
                <tr>
                  <td colSpan='2'>
                  <input className="form-control" id="회의명" value={meetings.회의명} onChange={onChangeInput}/> 
                  </td>
                </tr>
                <tr>
                  <td>{columns[1]}</td>
                  <td>{columns[2]}</td>
                </tr>
                <tr>
                  <td>
                  <input className="form-control" id="작성자" value={meetings.작성자} onChange={onChangeInput}/> 
                  </td>
                  <td>
                  <input className="form-control" id="회의장소" value={meetings.회의장소} onChange={onChangeInput}/> 
                  </td>
                </tr>
                <tr>
                  <td >{columns[3]}</td>
                  <td>{columns[4]}</td>
                </tr>
                <tr>
                  <td>
                  <Flatpickr
                    className="form-control"
                    value={meetings.회의일시}
                    options={
                      {dateFormat: "Y-m-d"}
                    }
                    onChange={회의일시 => {
                      setMeetings({...meetings, 회의일시: moment(new Date(회의일시[0])).format("YYYY-MM-DD")});
                    }}
                  />
                  </td>
                  <td>
                  <Flatpickr
                    className="form-control"
                    value={meetings.작성일시}
                    options={
                      {dateFormat: "Y-m-d"}
                    }
                    onChange={작성일시 => {
                      setMeetings({...meetings, 작성일시: moment(new Date(작성일시[0])).format("YYYY-MM-DD")});
                    }}
                  />
                  </td>
                </tr>
                <tr>
                  <td colSpan='2'>{columns[5]}</td>
                </tr>
                <tr>
                  <td colSpan='2'><input className="form-control" id="참석자" value={meetings.참석자} onChange={onChangeInput}/></td>
                </tr>
                <tr>
                  <td colSpan='2'>{columns[6]}</td>
                </tr>
                <tr>
                  <td colSpan='2'><input className="form-control" id="고객사" value={meetings.고객사} onChange={onChangeInput}/></td>
                </tr>
                <tr>
                  <td colSpan='2'>{columns[7]}</td>
                </tr>
                <tr>
                  <td colSpan='2'><textarea style={{height:"400px"}}  className="form-control" id="회의내용" value={meetings.회의내용} onChange={onChangeInput}/></td>
                </tr>
                <tr>
                  <td colSpan='2'>{columns[8]}</td>
                </tr>
                <tr>
                  <td colSpan='2'><textarea style={{height:"200px"}}  className="form-control" id="이슈사항" value={meetings.이슈사항} onChange={onChangeInput}/></td>
                </tr>
                
              </tbody>
            </Table>
            {user === meetings.작성자 ?
            <>
              <Button color="primary" style={{marginRight: 10}} onClick={onClickUpdate}>수정</Button>
              <Button color="primary" style={{marginLeft: 10}} onClick={onClickDelete}>삭제</Button>
            </>
            : null }
          </Widget>
        </Col>
      </Row>
    </div>
  );
}

export default DMeeting;