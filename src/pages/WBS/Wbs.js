import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Table,
  Button,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Nav,
  NavItem,
  NavLink,
} from "reactstrap";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official'
import exporting from 'highcharts/modules/exporting';
import exportData from 'highcharts/modules/export-data';
import accessibility from 'highcharts/modules/accessibility';
import highchartsGantt from "highcharts/modules/gantt";
import { useCookies } from 'react-cookie';
import Widget from '../../components/Widget/Widget';
import axios from 'axios';
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import moment from 'moment';

exporting(Highcharts);
exportData(Highcharts);
accessibility(Highcharts);
highchartsGantt(Highcharts);

const getRandomColor = () => {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

const Wbs = (props) => {
  const [rawResources, setRawResources] = useState([]);
  const [rawSub, setRawSub] = useState([]);
  // const [rawEvents, setRawEvents] = useState([]);
  const [cookies, removeCookie ] = useCookies(['token']);
  const [data, setData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [inModifing, setInModifing] = useState(false);
  const [modalMenu, setModalMenu] = useState("");
  const [modalData, setModalData] = useState({
    name: "",
    color: getRandomColor(),
    담당자: "",
    start: "",
    end: "",
    text: "",
    subId: "",
    resourceId: "",
  });
  const [projectName, setProjectName] = useState("");

  // 토스트 옵션 (고정값이므로 state로 관리 X)
  const toastOptions =  {
    position: "top-center",
    autoClose: 2000,
    closeOnClick: false,
    pauseOnHover: false,
    draggable: true,
  };

  // 전체 데이터 로드
  const findAllInfo = () => {
    axios.defaults.headers.common['Authorization'] = cookies.token;
    axios
    .all([
      axios.get(`http://${process.env.REACT_APP_API_URL}/wbs/resources?id=${props.match.params.id}&year=${props.match.params.year}`),
      axios.get(`http://${process.env.REACT_APP_API_URL}/wbs/sub?id=${props.match.params.id}&year=${props.match.params.year}`),
      axios.get(`http://${process.env.REACT_APP_API_URL}/wbs/events?id=${props.match.params.id}&year=${props.match.params.year}`),
      axios.get(`http://${process.env.REACT_APP_API_URL}/projects/search?id=${props.match.params.id}&year=${props.match.params.year}`),
    ])
    .then(axios.spread((res1, res2, res3, res4) => {
      setProjectName(res4.data[0].프로젝트명);
      setRawResources(res1.data.sort((a, b) => a.id - b.id));
      setRawSub(res2.data);
      // setRawEvents(res3.data.filter(event => res2.data.find(sub => sub.id === event.subId)));
      parseData(res1.data, res2.data, res3.data);
    }))
    .catch(err => {
      console.log(err);
      if (cookies.token) {
        removeCookie('token');
      }
      alert("세션이 만료되었습니다. 다시 로그인 해주세요");
      window.location.href = "/";
    });
  }

  const parseData = (_rawResources, _rawSub, _rawEvents) => {
    const data = [];
    let y_count = 0;
    for (let i_resource = 0; i_resource < _rawResources.length; i_resource++) {
      data.push({
        resourceId: _rawResources[i_resource].id,
        resource: _rawResources[i_resource].name,
        pointWidth: 0,
        y: y_count++
      });
      let _resourceId = _rawResources[i_resource].id;
      const sub = _rawSub.filter((item) => _rawResources[i_resource].id === item.resourceId);

      for (let i_sub = 0; i_sub < sub.length; i_sub++) {
        const events = _rawEvents.filter((item) => sub[i_sub].id === item.subId);
        if(events.length === 0) {
          data.push({
            subId: sub[i_sub].id,
            resourceId: _resourceId,
            name: sub[i_sub].name,
            담당자: sub[i_sub].담당자,
            color: _rawResources[i_resource].color,
            y: y_count,
            })
        } else {
          for (let i_event = 0; i_event < events.length; i_event++) {
            data.push({
              eventId: events[i_event].id,
              subId: sub[i_sub].id,
              resourceId: _resourceId,
              name: sub[i_sub].name,
              text: events[i_event].text,
              start: Date.UTC(events[i_event].start.split('-')[0], events[i_event].start.split('-')[1] - 1, events[i_event].start.split('-')[2]),
              end: Date.UTC(events[i_event].end.split('-')[0], events[i_event].end.split('-')[1] - 1, events[i_event].end.split('-')[2]),
              담당자: sub[i_sub].담당자,
              color: _rawResources[i_resource].color,
              y: y_count})
          }
        }
        y_count++;
      }
    }
    setData(data);
  }

  const onClickDelete = () => {
    const confirm = window.confirm("삭제하시겠습니까?");
    if(confirm) {
      if (modalMenu === "resource") {
        axios.post(`http://${process.env.REACT_APP_API_URL}/wbs/resources/delete`, {id: modalData.id})
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
      } else if (modalMenu === "sub") {
        axios.post(`http://${process.env.REACT_APP_API_URL}/wbs/sub/delete`, {id: modalData.id})
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
      } else if (modalMenu === "event") {
        axios.post(`http://${process.env.REACT_APP_API_URL}/wbs/events/delete`, {id: modalData.eventId})
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
      }
      setIsOpen(!isOpen);
      window.location.reload();
    }
  }


  const onClickUpdate = () => {
    if (modalMenu === "resource") {
      if (!modalData.name)
        return toast.error("모든 항목을 입력해주세요", toastOptions);
      axios.post(`http://${process.env.REACT_APP_API_URL}/wbs/resources/update`, {modalData})
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
    } else if(modalMenu === "sub") {
      if (!modalData.name || !modalData.담당자)
        return toast.error("모든 항목을 입력해주세요", toastOptions);
      axios.post(`http://${process.env.REACT_APP_API_URL}/wbs/sub/update`, {modalData})
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
    } else if(modalMenu === "event") {
      if(!modalData.subId || !modalData.start || !modalData.end) {
        toast.error("모든 항목을 입력해주세요", toastOptions);
        return;
      }
      if(modalData.start.localeCompare(modalData.end) > 0) {
        return toast.error("시작 날짜를 종료 날짜 이전으로 설정해주세요", toastOptions);
      }
      axios.post(`http://${process.env.REACT_APP_API_URL}/wbs/events/update`, {modalData})
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
    }
    setIsOpen(!isOpen);
    window.location.reload();
  }

  const onClickAdd = () => {
    if(modalMenu === "resource") {
      if(!modalData.name) {
        return toast.error("모든 항목을 입력해주세요", toastOptions);
      }
      axios.post(`http://${process.env.REACT_APP_API_URL}/wbs/resources/add`, {...modalData, year: props.match.params.year, projectId: props.match.params.id})
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
    } else if(modalMenu === "sub"){
      if(!modalData.name || !modalData.담당자 || !modalData.resourceId) {
        return toast.error("모든 항목을 입력해주세요", toastOptions);
      }
      axios.post(`http://${process.env.REACT_APP_API_URL}/wbs/sub/add`, {...modalData})
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
    } else {
      if(!modalData.start || !modalData.end || !modalData.subId || !modalData.resourceId) {
        return toast.error("모든 항목을 입력해주세요", toastOptions);
      }
      if(modalData.start.localeCompare(modalData.end) > 0) {
        return toast.error("시작 날짜를 종료 날짜 이전으로 설정해주세요", toastOptions);
      }
      axios.post(`http://${process.env.REACT_APP_API_URL}/wbs/events/add`, {...modalData})
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
    }
    setIsOpen(!isOpen);
    window.location.reload();
  }

  useEffect(() => findAllInfo(), []);

  const controlModal = () => {
    return (
      <Modal isOpen={isOpen} toggle={() => setIsOpen(!isOpen)} id="news-close-modal" className="modal-content">
        <ModalHeader toggle={() => setIsOpen(!isOpen)} id="news-close-modal-label" className="modal-header">
          {inModifing ? "수정" : "추가"}
        </ModalHeader>
        <ModalBody className="bg-white modal-body">
          {!inModifing && (
          <Nav tabs justified style={{fontSize: 0.8+'rem', marginBottom: 1+'rem'}}>
            <NavItem>
              <NavLink
                {...modalMenu === "resource" ? {className: "active"} : {}}
                onClick={() => setModalMenu("resource")}
              >
                구분
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                {...modalMenu === "sub" ? {className: "active"} : {}}
                onClick={() => setModalMenu("sub")}
              >
                작업
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                {...modalMenu === "event" ? {className: "active"} : {}}
                onClick={() => setModalMenu("event")}
              >
                일정
              </NavLink>
            </NavItem>
          </Nav>
          )}
          {modalMenu === "resource" ? // 구분
            <>
              <Input type='text' maxLength='20' style={{width: 100+'%'}} value={modalData.name} placeholder='추가할 구분을 입력해주세요.'
                onChange={(e) => setModalData({...modalData, name: e.target.value})}/>
              <br />
              <strong>색상</strong><br />
              <Input type='color' value={modalData.color} onChange={(e) => setModalData({...modalData, color: e.target.value})}/>
            </>
          : modalMenu === "sub" ? // 작업
            <>
              <strong>구분</strong><br />
              <select className="form-control" value={modalData.resourceId} onChange={(e) => setModalData({...modalData, resourceId: e.target.value})}>
                <option value="" disabled hidden></option>
                {rawResources.map((resource, index) => {
                  return <option key={index} value={resource.id}>{resource.name}</option>
                })}
              </select>
              <br />
              <strong>작업</strong><br />
              <Input type='text' maxLength='20' style={{width: 100+'%'}} value={modalData.name} onChange={(e) => setModalData({...modalData, name: e.target.value})} placeholder='추가할 작업을 입력해주세요.'/>
              <br />
              <strong>담당자</strong><br />
              <Input type='text' maxLength='20' style={{width: 100+'%'}} value={modalData.담당자} onChange={(e) => setModalData({...modalData, 담당자: e.target.value})} placeholder='담당자를 입력해주세요.'/>
            </>
          : // 이벤트
            <>
              <strong>구분</strong><br />
              <select className="form-control" value={modalData.resourceId} onChange={(e) => setModalData({...modalData, resourceId: e.target.value, subId: ''})}>
                <option value="" disabled hidden></option>
                {rawResources.map((resource, index) => {
                  return <option key={index} value={resource.id}>{resource.name}</option>
                })}
              </select>
              <br />
              <strong>작업</strong><br />
              <select className="form-control" value={modalData.subId} onChange={(e) => setModalData({...modalData, subId: e.target.value})}>
                <option value="" disabled hidden></option>
                {rawSub.filter((d) =>  d.resourceId === Number(modalData.resourceId)).map((d, index) => {
                  return <option key={index} value={d.id}>{d.name}</option>
                })}
              </select>
              <br />
              <strong>메모</strong><br />
              <Input type='text' className="form-control" value={modalData.text} onChange={(e) => setModalData({...modalData, text: e.target.value})}/>
              <br />
              시작 날짜<Input type='date' maxLength='20' value={modalData.start} onChange={(e) => setModalData({...modalData, start: moment(e.target.value).format("YYYY-MM-DD")})}/>
              종료 날짜<Input type='date' maxLength='20' value={modalData.end} onChange={(e) => setModalData({...modalData, end: moment(e.target.value).format("YYYY-MM-DD")})}/>
            </>
          }
        </ModalBody>
        <ModalFooter className="modal-footer">
          {inModifing ?
          <>
            <Button className="text-capitalize btn btn-warning" onClick={onClickUpdate}>
              수정
            </Button>
            <Button className="text-capitalize btn btn-warning" onClick={onClickDelete}>
              삭제
            </Button>
          </>
          :
          <Button className="text-capitalize btn btn-warning" onClick={onClickAdd}>
            추가
          </Button>
          }
          <Button className="text-capitalize btn btn-secondary" onClick={() => setIsOpen(!isOpen)}>
            취소
          </Button>
        </ModalFooter>
      </Modal>
    )
  }

  const options = {
    chart: {
      animation: false
    },
    yAxis: {
      labels: {
        align: "center",
        overflow: "allow",
        step: 1,
        style: {
          fontSize: "12px", // 왼쪽 표 글씨 사이즈
          whiteSpace: "break-spaces",
          textOverflow: "ellipsis",
          padding: "0px",
        }
      },
      type: 'category',
      grid: {
        cellHeight: 100,
        columns: [{
          title: {
            text: '구분',
          },
          labels: {
            format: '{point.resource}'
          }
        }, {
          title: {
            text: '작업',
          },
          labels: {
            format: '{point.name}'
          }
        }, {
          title: {
            text: '담당자',
          },
          labels: {
            format: '{point.담당자}'
          }
        }]
      }
    },
    series: [{
      events: {
        click: function(e) {
          console.log(e.point.options);
          setModalData({...e.point.options, start: moment(e.point.options.start).format("YYYY-MM-DD"), end: moment(e.point.options.end).format("YYYY-MM-DD")});
          setInModifing(true);
          setModalMenu("event");
          setIsOpen(!isOpen);
        }
      },
      data: data,
    }],
    tooltip: {
      pointFormat: '<span><strong>{point.name}</strong></span><br/><span>{point.text}</span><br/><span>{point.start:%y.%m.%d}~{point.end:%y.%m.%d}</span>'
    },
    navigator: {
      enabled: !isOpen,
      liveRedraw: true,
      series: {
        type: 'gantt',
        pointPlacement: 0.5,
        pointPadding: 0.25
      },
    },
    rangeSelector: { //1개월, 3개월, 6개월, 1년 바꿀수 있음
      enabled: !isOpen,
      inputDateFormat: '%Y-%m-%d',
      buttons: [{
        type: 'month',
        count: 1,
        text: '1m',
        title: '1개월 보기'
      }, {
        type: 'month',
        count: 3,
        text: '3m',
        title: '3개월 보기'
      }, {
        type: 'month',
        count: 6,
        text: '6m',
        title: '6개월 보기'
      }, {
        type: 'ytd',
        text: 'YTD',
        title: '연초부터 현재까지'
      }, {
        type: 'year',
        count: 1,
        text: '1y',
        title: '1년 보기'
      }, {
        type: 'all',
        text: 'All',
        title: '전체보기'
      }]
    },
  }

  return (
    <div>
      <Widget collapse title={<p style={{ fontSize:30, fontWeight: 700 }}>WBS</p>}>
        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
          <Link to={{pathname: `/app/projects/list/${props.match.params.id}/${props.match.params.year}`}}>{projectName}</Link>
          <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'end', alignItems: 'center'}}>
            <Button
              size="sm"
              className="text-capitalize btn btn-warning" 
              onClick={() => {
                setModalMenu("resource");
                setInModifing(false);
                setIsOpen(!isOpen);
              }}
            >
              추가
            </Button>
          </div>
        </div>
        <HighchartsReact
          highcharts={Highcharts}
          constructorType={"ganttChart"}
          options={options}/>
      </Widget>
      <Widget title={<p style={{ fontWeight: 700 }}>WBS 관리</p>} collapse>
        <Row>
          <Col md="12">
            <Table className="manage__table table-sm">
              <thead>
                <tr>
                  <th>구분</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rawResources.map((resource, index) =>
                  <tr key={index}>
                    <td>{resource.name}</td>
                    <td>
                      <Button
                        size="sm"
                        className="text-capitalize btn btn-warning" 
                        onClick={() => {
                          setModalData(resource);
                          setInModifing(true);
                          setModalMenu("resource");
                          setIsOpen(!isOpen);
                        }}
                      >
                        수정
                      </Button>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
            <Table className="manage__table table-sm">
              <thead>
                <tr>
                  <th>구분</th>
                  <th>작업</th>
                  <th>담당자</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rawResources.map((resource) => {
                  return(   
                  rawSub.filter((item) => resource.id === item.resourceId).map((sub, index) =>
                  <tr key={index}>
                    {index === 0 ? <td rowSpan={rawSub.filter((item) => resource.id === item.resourceId).length}>{resource.name}</td> : null}
                    <td>{sub.name}</td>
                    <td>{sub.담당자}</td>
                    <td>
                      <Button
                        size="sm"
                        className="text-capitalize btn btn-warning"
                        onClick={() => {
                          setModalData(sub);
                          setInModifing(true);
                          setModalMenu("sub");
                          setIsOpen(!isOpen);
                        }}
                      >
                        수정
                      </Button>
                    </td>
                  </tr>
                ))}
                )}
              </tbody>
            </Table>
          </Col>
        </Row>
      </Widget>
      {controlModal()}
    </div>
  );
}

export default Wbs;