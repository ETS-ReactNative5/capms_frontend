import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Col, Row, Table } from 'reactstrap';
import Widget from '../../components/Widget/Widget';
import { Link } from 'react-router-dom';
import './Meeting.scss';
import { useCookies } from 'react-cookie';

const ProjectList = () => {
  const [cookies, removeCookie ] = useCookies(['token']);
  const [meetings , setmeetings] = useState([]);
  
  const sortList = (e) => {
    let arrayCopy = [...meetings];
    switch (e.target.name) {
      case "ascMname":
        arrayCopy.sort((a, b) => a.회의명.localeCompare(b.회의명));
        break;
      case "descMname":
        arrayCopy.sort((a, b) => b.회의명.localeCompare(a.회의명));
        break;
      case "ascMPlace":
        arrayCopy.sort((a, b) => a.회의장소.localeCompare(b.회의장소));
        break;
      case "descMPlace":
        arrayCopy.sort((a, b) => b.회의장소.localeCompare(a.회의장소));
        break;
      case "ascMDate":
        arrayCopy.sort((a, b) => a.회의일시.localeCompare(b.회의일시));
        break;
      case "descMDate":
        arrayCopy.sort((a, b) => b.회의일시.localeCompare(a.회의일시));
        break;
      case "ascWDate":
        arrayCopy.sort((a, b) => a.작성일시.localeCompare(b.작성일시));
        break;
      case "descWDate":
        arrayCopy.sort((a, b) => b.작성일시.localeCompare(a.작성일시));
        break;
      case "ascWriter":
        arrayCopy.sort((a, b) => a.작성자.localeCompare(b.작성자));
        break;
      case "descWriter":
        arrayCopy.sort((a, b) => b.작성자.localeCompare(a.작성자));
        break;
      default:
        return;
    }
    setmeetings(arrayCopy);
  };

  useEffect(()=> findAllmeetings(), []);

  const findAllmeetings = () => {
    axios.defaults.headers.common['Authorization'] = cookies.token;
    axios.get(`http://${process.env.REACT_APP_API_URL}/meetings`)
    .then((res)=>{
      setmeetings(res.data.sort((a, b) => b.작성일시.localeCompare(a.작성일시)));
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
    <>
      <Row>
        <Col>
          <Widget title={
            <div style={{display: 'flex', flexDirection:'row', justifyContent: 'space-between', marginBottom: 1+'rem'}}>
              <p style={{ fontSize:30, fontWeight: 700 }}>회의록</p>
              <Link to="/app/projects/meetings/new"><button className="btn btn-primary">새로운 회의록</button></Link>
            </div>}>
            <Table className="meeting__table table-md">
              <thead>
                <tr>
                  <th className="col-4 meeting__th">
                    <div className="meeting__th_div">
                      <div>
                        회의명
                      </div>
                      <div>
                        <button className="orderBtn glyphicon glyphicon-collapse" name="ascMname" onClick={sortList}/><button className="orderBtn glyphicon glyphicon-collapse-top" name="descMname" onClick={sortList}/>
                      </div>
                    </div>
                  </th>
                  <th className="col-3 meeting__th">
                    <div className="meeting__th_div">
                      <div>
                        회의장소
                      </div>
                      <div>
                        <button className="orderBtn glyphicon glyphicon-collapse" name="ascMPlace" onClick={sortList}/><button className="orderBtn glyphicon glyphicon-collapse-top" name="descMPlace" onClick={sortList}/>
                      </div>
                    </div>
                  </th>
                  <th className="col-1 meeting__th">
                    <div className="meeting__th_div">
                      <div>
                        회의일시
                      </div>
                      <div>
                        <button className="orderBtn glyphicon glyphicon-collapse" name="ascMDate" onClick={sortList}/><button className="orderBtn glyphicon glyphicon-collapse-top" name="descMDate" onClick={sortList}/>
                      </div>
                    </div>
                  </th>
                  <th className="col-1 meeting__th">
                    <div className="meeting__th_div">
                      <div>
                        작성일시
                      </div>
                      <div>
                        <button className="orderBtn glyphicon glyphicon-collapse" name="ascWDate" onClick={sortList}/><button className="orderBtn glyphicon glyphicon-collapse-top" name="descWDate" onClick={sortList}/>
                      </div>
                    </div>
                  </th>
                  <th className="col-1 meeting__th">
                    <div className="meeting__th_div">
                      <div>
                        작성자
                      </div>
                      <div>
                        <button className="orderBtn glyphicon glyphicon-collapse" name="ascWriter" onClick={sortList}/><button className="orderBtn glyphicon glyphicon-collapse-top" name="descWriter" onClick={sortList}/>
                      </div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {meetings.map((meeting) => {
                  return(
                  <tr key={meeting.id}>
                    
                    <td className="col-4 meeting__th">
                        <Link to={{pathname: `/app/projects/meetings/detail/${meeting.id}`}}>
                        {meeting.회의명}
                        </Link>
                        </td>
                    <td className="col-3 meeting__th">{meeting.회의장소}</td>
                    <td className="col-1 meeting__th">
                        {meeting.회의일시}
                    </td>
                    <td className="col-1 meeting__th">{meeting.작성일시}</td>
                    <td className="col-1 meeting__th">{meeting.작성자}</td>
                  </tr>
                )})}
              </tbody>
            </Table>
          </Widget>
        </Col>
      </Row>
    </>
  );
}

export default ProjectList;