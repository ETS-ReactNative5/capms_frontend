import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
// import { formatDate } from "@fullcalendar/common";
import Widget from "../../components/Widget/Widget";
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from "reactstrap";
import moment from 'moment';
import axios from "axios";
import { useCookies } from 'react-cookie';

const Reservation = () => {
  const user = JSON.parse(localStorage.getItem('userInfo')) ? JSON.parse(localStorage.getItem('userInfo')) : {};
  const [cookies, removeCookie ] = useCookies(['token']);
  const [isOpen, setIsOpen] = useState(false);
  const [modalMenu, setModalMenu] = useState("");
  const [modalData, setModalData] = useState({
    id: "",
    title: "",
    start: "",
    end: "",
    예약자: "",
    예약내용: "",
  });
  const [events, setEvents] = useState([]);

  useEffect(() => findAllInfo(), []);

  // 전체 데이터 로드
  const findAllInfo = () => {
    axios.defaults.headers.common['Authorization'] = cookies.token;
    axios.get(`http://${process.env.REACT_APP_API_URL}/reservations`)
    .then((res1, res2) => {
      setEvents(res1.data);
    })
    .catch(err => {
      if (cookies.token) {
        removeCookie('token');
      }
      alert("세션이 만료되었습니다. 다시 로그인 해주세요");
      window.location.href = "/";
    });
  }

  const onClickCreate = () => {
    if (modalData.title === "" || modalData.start === "" || modalData.end === "")
      return alert("내용을 입력해주세요");
    axios.post(`http://${process.env.REACT_APP_API_URL}/reservations/add`, {modalData})
    .then(res => {
      console.log(res);
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

  const onClickDelete = (id) => {
    window.confirm("정말 삭제하시겠습니까?") &&
    axios.post(`http://${process.env.REACT_APP_API_URL}/reservations/delete`, {id: modalData.id})
    .then(res => {
      console.log(res);
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

  return (
    <>
      <Widget title={<p style={{ fontSize:30, fontWeight: 700 }}>프로젝트룸</p>}>
        <FullCalendar plugins={[ dayGridPlugin, timeGridPlugin, interactionPlugin ]} initialView="timeGridWeek"
          timeZone="Asia/Seoul"
          locale="ko"
          nowIndicator={true}
          weekends={false}
          headerToolbar= {{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          events={events}
          allDaySlot={false}
          eventClick={(info) => {
            setModalMenu("updateEvent");
            setModalData({
              id: info.event._def.publicId,
              title:info.event._def.title,
              start: info.event._instance.range.start.toISOString().slice(0,-1),
              end: info.event._instance.range.end.toISOString().slice(0,-1),
              예약자: info.event._def.extendedProps.예약자,
              예약내용: info.event._def.extendedProps.예약내용,
            });
            setIsOpen(true);
          }}
          selectable={true}
          selectMirror={true}
          selectOverlap={false}
          select={(selectInfo) => {
            setModalMenu("createEvent");
            setModalData({
              title: user.name,
              start: selectInfo.startStr,
              end: selectInfo.endStr,
              예약자: user.id,
              예약내용: "",
            });
            setIsOpen(true);
          }}
          scrollTime="08:00:00"
        />
      </Widget>
      <Modal isOpen={isOpen} toggle={() => setIsOpen(!isOpen)}>
        <ModalHeader toggle={() => setIsOpen(!isOpen)}>
          {modalMenu === "createEvent" ? "새로운 일정 추가" : "일정 수정"}
        </ModalHeader>
        <ModalBody>
          {modalMenu === "updateEvent" && (
            <>
              <div>예약자 : {modalData.title}</div>
              <div>시작시간 : {moment(new Date(modalData.start)).format("YYYY-MM-DD HH:mm")}</div>
              <div>종료시간 : {moment(new Date(modalData.end)).format("YYYY-MM-DD HH:mm")}</div>
              <div>예약내용 : {modalData.예약내용}</div>
            </>
          )}
          {modalMenu === "createEvent" && (
            <>
              <div>예약자 : {modalData.title}</div>
              <div>시작시간 : {moment(new Date(modalData.start)).format("YYYY-MM-DD HH:mm")}</div>
              <div>종료시간 : {moment(new Date(modalData.end)).format("YYYY-MM-DD HH:mm")}</div>
              <div>예약내용</div>
              <div><Input type="text" value={modalData.예약내용} onChange={(e) => setModalData({...modalData, 예약내용: e.target.value})} /></div>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          {modalMenu === "createEvent" && (
            <>
              <button
                className="btn btn-warning"
                onClick={() => {
                  onClickCreate();
                }}
              >
                예약하기
              </button>
            </>
          )}
          {modalMenu === "updateEvent" && user.id === modalData.예약자 && (
            <>
              <button
                className="btn btn-warning"
                onClick={() => {
                  onClickDelete();
                }}
              >
                삭제하기
              </button>
            </>
          )}
          <button className="btn btn-secondary" onClick={() => setIsOpen(!isOpen)}>닫기</button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default Reservation;
