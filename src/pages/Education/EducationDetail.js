import React from "react";
import {
  Row,
  Col,
  Table,
  Progress,
  Button,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import uuid from "uuid/v4";
import moment from "moment";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/confetti.css";
import Widget from "../../components/Widget/Widget";
import axios from "axios";
import { Cookies } from "react-cookie";

const cookies = new Cookies();

class EducationDetail extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      // 팀 이름
      team: props.match.params.team_name,

      // 년도
      selectedYear: Number(moment(new Date()).format("YYYY")),
      
      // 전체 정형화된 교육관리 데이터 스테이트
      educations: "",

      // 생성, 수정 시 올라가는 데이터
      updateData: {
        updateName: "",
        updateEdu: {
          num: "",
          edu_name: "",
          learn_time: "",
          start_date : moment(new Date()).format("YYYY-MM-DD"),
          end_date: moment(new Date()).format("YYYY-MM-DD"),
          cost: "",
        },
      },
      
      // 기존에 있는 사람의 데이터 수정 혹은 추가 시 필요한 인덱스
      education_index: "",
      edu_index: "",

      // toast 옵션
      options: {
        position: "top-center",
        autoClose: 2000,
        closeOnClick: false,
        pauseOnHover: false,
        draggable: true,
      },

      onSave: this.onSave,
      onEdit: this.onEdit,
      onDelete: this.onDelete,
      updateValue: this.updateValue,
      toggle: this.toggle,

      // 모달
      modal: false,

      // 삭제 시 사용될 인덱스
      delete_education_idx: "",
      delete_edu_idx: "",
      
      // 팀별 구성원
      team_member: [],

      // 목표 시간
      goal: 1,

      yearList: [],

    };
  }

  toggle = () => {
    this.setState({
      modal: !this.state.modal,
    });
  };

  reset() {
    const resetData = {
      updateName: "",
      updateEdu: {
        num: "",
        edu_name: "",
        learn_time: "",
        start_date :moment(new Date()).format("YYYY-MM-DD"),
        end_date: moment(new Date()).format("YYYY-MM-DD"),
        cost: "",
      },
    }

    this.setState({
      updateData: resetData
    })
  };

  onEdit = (education_idx, edu_idx) => {
    const selectedName = this.state.educations[education_idx].stu_name;
    const selectedRecord = this.state.educations[education_idx].edu[edu_idx];

    const updateObject = {
      updateName: selectedName,
      updateEdu: {
        num: selectedRecord["num"],
        edu_name: selectedRecord["edu_name"],
        learn_time: selectedRecord["learn_time"],
        start_date: selectedRecord["start_date"],
        end_date: selectedRecord["end_date"],
        cost: Number(selectedRecord["cost"].replaceAll(",","")),
      },
    };

    this.setState({
      updateData: updateObject,

      education_index: education_idx,
      edu_index: edu_idx,
    });
  };

  updateValue = (e, update_col) => {
    let stu_name = this.state.updateData.updateName;
    let edu_name = this.state.updateData.updateEdu.edu_name;
    let learn_time = this.state.updateData.updateEdu.learn_time;
    let start_date = this.state.updateData.updateEdu.start_date;
    let end_date = this.state.updateData.updateEdu.end_date;
    let cost =this.state.updateData.updateEdu.cost;

    switch (update_col) {
      case "stu_name":
        stu_name = e.target.value;
        break;

      case "edu_name":
        edu_name = e.target.value;
        break;

      case "learn_time":
        learn_time = Number(e.target.value);
        break;

      case "start_date":
        start_date = moment(e[0]).format("YYYY-MM-DD");
        break;

      case "end_date":
        end_date = moment(e[0]).format("YYYY-MM-DD");
        break;

      case "cost":
        cost = Number(e.target.value);
        break;
    }

    const updateObject = {
      updateName: stu_name,
      updateEdu: {
        num: this.state.updateData.updateEdu.num, // num이 있으면 수정, 빈 값이면 추가
        edu_name: edu_name,
        learn_time: learn_time,
        start_date: start_date,
        end_date: end_date,
        cost: cost,
      },
    };

    this.setState({
      updateData: updateObject,
    });

  };

  onSave = (education_index, edu_index) => {
    const { educations } = this.state;
    const { updateData } = this.state;

    let num = 0;

    // 데이터를 모두 입력하지 않았을 때
    if (
      Object.keys(updateData).length === 0 ||
      updateData.updateName === "" ||
      updateData.updateEdu.edu_name === "" ||
      updateData.updateEdu.learn_time === "" ||
      updateData.updateEdu.cost === ""
    ) {
      this.addNotification("값을 모두 입력해주세요", "error");
      return;
    }

    // 모두 입력된 데이터 추가 혹은 수정
    if (education_index !== "" && edu_index !== "") {
      // 수정일 때
      this.addNotification("수정되었습니다", "success");

      const updatedEducations = educations;
      
      updatedEducations[education_index].stu_name = updateData.updateName;
      updatedEducations[education_index].edu[edu_index] = Object.assign({}, updateData.updateEdu);

      updatedEducations[education_index].edu[edu_index].cost = updatedEducations[education_index].edu[edu_index].cost.toLocaleString('ko-KR');
      
      this.setState({
        educations: updatedEducations,
      });
      
      axios
        .post(
          `http://${process.env.REACT_APP_API_URL}/education/update`, //DB연동
          {
            num: this.state.updateData.updateEdu.num,
            stu_name: this.state.updateData.updateName,
            edu_name: this.state.updateData.updateEdu.edu_name,
            learn_time: this.state.updateData.updateEdu.learn_time,
            start_date: this.state.updateData.updateEdu.start_date,
            end_date: this.state.updateData.updateEdu.end_date,
            cost: this.state.updateData.updateEdu.cost,
          }
          ).then(res => {})
      
      this.reset();

    } else {
      // 추가일 때
      this.addNotification("추가되었습니다", "success");

      // 추가 후에 pK 값을 받아야 하기 때문에 axios 안에서 setState를 사용함
      axios
        .post(
          `http://${process.env.REACT_APP_API_URL}/education/add`, //DB연동
          { 
            team: this.state.team,
            stu_name: this.state.updateData.updateName,
            edu_name: this.state.updateData.updateEdu.edu_name,
            learn_time: this.state.updateData.updateEdu.learn_time,
            start_date: this.state.updateData.updateEdu.start_date,
            end_date: this.state.updateData.updateEdu.end_date,
            cost: this.state.updateData.updateEdu.cost,
          }
        )
        .then((response) => {
          num = response.data.insertId;

          const addEducations = educations;
          const addData = updateData;

          addData.updateEdu.num = num; // 할당 받은 키값
          addData.updateEdu.cost = addData.updateEdu.cost.toLocaleString('ko-KR'); // 소수점 콤마 수정

          const nameIndex = addEducations.findIndex(
            (d) => d.stu_name === addData.updateName
          )

          if (nameIndex === -1) {
            // 추가한 사람이 기존 데이터에 없을 때
            addEducations.push({
              stu_name: updateData.updateName,
              edu: [addData.updateEdu],
            });
          } else {
            // 추가한 사람이 기존 데이터에 있을 때
            addEducations[nameIndex].edu.push(addData.updateEdu);
          }

          this.setState({
            educations: addEducations,
          });
        })
        .catch(err => {
          console.log(err);
          if (cookies.get("token")) {
            cookies.remove("token");
          }
          alert("세션이 만료되었습니다. 다시 로그인 해주세요");
          window.location.href = "/";
        });

      this.reset();
    }
  };

  onDelete = (education_idx, edu_index) => {
    this.addNotification("삭제되었습니다.", "success");

    const { educations } = this.state;
    const num = educations[education_idx].edu[edu_index].num;

    const deletedEducations = educations; // 복사
    deletedEducations[education_idx].edu.splice(edu_index, 1);

    axios
      .post(
        `http://${process.env.REACT_APP_API_URL}/education/delete`, //DB연동
        { 
          num: num 
        }
      ).then(res => {})
      .catch(err => {
        console.log(err)
        if (cookies.get("token")) {
          cookies.remove("token");
        }
        alert("세션이 만료되었습니다. 다시 로그인 해주세요");
        window.location.href = "/";
      });

    this.setState({
      educations: deletedEducations
    });

    this.reset();
  };

  componentDidMount() {
    axios.defaults.headers.common['Authorization'] = cookies.get("token");
    this.findAllData(this.state.selectedYear);
    this.findAllMember();
    this.findGoal();
  }
  
  findAllData(year) {
    axios
    .get(`http://${process.env.REACT_APP_API_URL}/education/read?team="${this.state.team}"&year=${year}`)
    .then((res) => res.data)
    .then((data) => {
      let tempName = "";
      let transformData = [];
      data.map((d) => {
        // 전 데이터와 같은 사람이면
        if (d.stu_name === tempName) {
          transformData[transformData.length - 1].edu.push({
            num: d.num,
            edu_name: d.edu_name,
            learn_time: d.learn_time,
            start_date: moment(d.start_date).format("YYYY-MM-DD"),
            end_date: moment(d.end_date).format("YYYY-MM-DD"),
            cost: d.cost.toLocaleString('ko-KR'),
          });
        } else {
          // 다른 사람이 되었거나 맨 처음 사람이라면
          transformData.push({
            stu_name: d.stu_name,
            edu: [
              {
                num: d.num,
                edu_name: d.edu_name,
                learn_time: d.learn_time,
                start_date: moment(d.start_date).format("YYYY-MM-DD"),
                end_date: moment(d.end_date).format("YYYY-MM-DD"),
                cost: d.cost.toLocaleString('ko-KR'),
              },
            ],
          });
        }
        tempName = d.stu_name;
      });
      this.setState({ educations: transformData });
    }).catch(err => {
      if (cookies.get("token")) {
        cookies.remove("token");
      }
      alert("세션이 만료되었습니다. 다시 로그인 해주세요");
      window.location.href = "/";
    });
  }

  findAllMember() {
    axios.get(`http://${process.env.REACT_APP_API_URL}/education/team_member?team="${this.state.team}"`)
    .then((res) => res.data).then((data) => {
      this.setState({ team_member: data });
    });
  }

  findGoal() {
    axios
      .get(`http://${process.env.REACT_APP_API_URL}/education/goal`)
      .then((res) => res.data)
      .then((data) => {
        this.setState({ goal: data.goal });
      });
  }

  addNotification = (message, type) => {
    let id = uuid();
    if (type === "error") { // 빨간색
      toast.error(<div>{message}</div>, { ...this.state.options, toastId: id });
    } else if (type === "info") { // 초록색
      toast.info(<div>{message}</div>, { ...this.state.options, toastId: id });
    } else if (type === "success") { // 노란색
      toast.warn(<div>{message}</div>, { ...this.state.options, toastId: id,});
    }
  };

  render() {

    const {selectedYear} = this.state;

    return (
      <React.Fragment>
        <Row>
          <Col>
            <Widget
              title={<p style={{ fontSize:30, fontWeight: 700 }}>{this.state.team} 교육관리</p>}
            >
              <select style={{ width: "auto" }} className="form-control"id="Year" value={selectedYear}
                onChange={(e) => {
                  this.setState({ 
                    selectedYear: Number(e.target.value)
                  });
                  this.findAllData(e.target.value);
                }}>
              {[...Array(moment(new Date()).format('YYYY') - 2018).keys()].map((i) => (
                <option key={i} value={moment(new Date()).format('YYYY') - i + 1}>{moment(new Date()).format('YYYY') - i + 1}</option>
              ))}
            </select>
              <br />
              <Table size="sm" responsive>
                <thead>
                  <tr>
                    <th>
                      이름<br /><br />
                      <Input
                        type="select"
                        style={{ width: "150px" }}
                        value={this.state.updateData.updateName}
                        onChange={(e) => {
                          this.state.updateValue(e, "stu_name");
                        }}
                        disabled={(this.state.updateData.updateEdu.num) ? true : false} // 수정 시 이름 변경 불가
                      >

                        <option key={uuid()} value=""></option>

                        {this.state.team_member ? (
                          this.state.team_member.map((member) => {
                            const nameWidthRank = member.name + " " + member.직급
                            return (
                              <option key={uuid()} value={member.name}>{nameWidthRank}</option>
                            )
                          })
                        ) : (
                          ""
                        )}
                      </Input>
                    </th>
                    <th>
                      교육명<br /><br />
                      <Input
                        type="text"
                        value={this.state.updateData.updateEdu.edu_name}
                        onChange={(e) => {
                          this.state.updateValue(e, "edu_name");
                        }}
                      />
                    </th>
                    <th>
                      이수 시간<br /><br />
                      <Input
                        type="number"
                        style={{ width: "90px"}}
                        value={this.state.updateData.updateEdu.learn_time}
                        onChange={(e) => {
                          this.state.updateValue(e, "learn_time");
                        }}
                      />
                    </th>
                    <th>
                      시작 날짜<br /><br />
                      <Flatpickr
                        className={"form-control"}
                        style={{ backgroundColor: "white", width: "140px" }}
                        value={this.state.updateData.updateEdu.start_date}
                        options={{ dateFormat: "Y-m-d " }}
                        onChange={(start_date) => {
                          this.state.updateValue(start_date, "start_date");
                        }}
                      />
                    </th>
                    <th>
                      종료 날짜<br /><br />
                      <Flatpickr
                        className={"form-control"}
                        style={{ backgroundColor: "white", width: "140px" }}
                        value={this.state.updateData.updateEdu.end_date}
                        options={{ dateFormat: "Y-m-d" }}
                        onChange={(end_date) => {
                          this.state.updateValue(end_date, "end_date");
                        }}
                      />
                    </th>
                    <th>
                      지출 (단위: 원)<br /><br />
                      <Input
                        type="number"
                        style={{ width: "120px"}}
                        step="1000"
                        value={this.state.updateData.updateEdu.cost}
                        onChange={(e) => {
                          this.state.updateValue(e, "cost");
                        }}
                      />
                    </th>

                    <th style={{ width: "140px"}}>
                      Action<br /><br />
                      {/* 추가 초기화 버튼 */}
                      <Button
                        color={"primary"}
                        size="sm"
                        onClick={() => {
                          this.state.onSave(
                            this.state.education_index,
                            this.state.edu_index
                          );
                        }}
                      >
                        {this.state.updateData.updateEdu.num ? "변경" : "추가"}
                      </Button>
                      &nbsp;&nbsp;
                      <Button
                        color={"info"}
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          this.reset();
                        }}
                      >
                        리셋
                      </Button>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  

                  {this.state.educations ? (
                    this.state.educations.map((education, education_idx) => {
                      let result = "";

                      const fh_sum = education.edu.map(function(edu) {
                        if (Number(edu.start_date.split('-')[1]) < 7) { return edu.learn_time }
                        else return 0
                      }
                      ).reduce((prev, curr) => prev + curr, 0);
                      
                      const sh_sum = education.edu.map(function(edu) {
                        if (Number(edu.start_date.split('-')[1]) >= 7) { return edu.learn_time }
                        else return 0
                      }
                      ).reduce((prev, curr) => prev + curr, 0);

                      const fh_percent = ((fh_sum / (this.state.goal)) * 100).toFixed(2);
                      const sh_percent = ((sh_sum / (this.state.goal)) * 100).toFixed(2);
                      
                      result = education.edu.map((e, edu_idx) => {
                        return (
                          <tr key={e.num}>

                            {/* 셀 병합 함수 (이름) */}
                            {(function () {
                              if (edu_idx === 0) {
                                return (
                                  <td rowSpan={education.edu.length} style={{ fontWeight: "bold" }}>
                                    <div style={{ fontSize: 18, textAlign: "center", paddingLeft: "10px", paddingRight: "10px" }}>{education.stu_name}</div>
                                    <div style={{ fontSize: 12, paddingLeft: "10px", paddingRight: "10px" }}><Progress className={['progress-sm', 'm-0'].join(' ')} color="primary" value={fh_percent} />
                                      상반기 진행률 {fh_percent}%
                                    </div>
                                    <div style={{ fontSize: 12, paddingLeft: "10px", paddingRight: "10px" }}><Progress className={['progress-sm', 'm-0'].join(' ')} color="danger" value={sh_percent} />
                                      하반기 진행률 {sh_percent}%
                                    </div>
                                  </td>
                                );
                              } else return;
                            })()}

                            {/* 데이터 */}
                            <td style={{ whiteSpace: "break-spaces" }}>{e.edu_name}</td>
                            <td style={{ textAlign: "center" }}>{e.learn_time}</td>
                            <td style={{ textAlign: "center" }}>{e.start_date}</td>
                            <td style={{ textAlign: "center" }}>{e.end_date}</td>
                            <td style={{ textAlign: "center" }}>{e.cost}</td>

                            {/* 수정 삭제 버튼 */}
                            <td style={{ textAlign: "center" }}>
                              <Button
                                color={"warning"}
                                className="UpdateBtn"
                                size="sm"
                                variant="primary"
                                onClick={() => {
                                  this.state.onEdit(education_idx, edu_idx);
                                }}
                                disabled={this.state.selectedYear !== Number(moment(new Date()).format("YYYY"))  ? true : false}
                              >
                                수정
                              </Button>
                              &nbsp;&nbsp;
                              <Button
                                color={"default"}
                                size="sm"
                                variant="danger"
                                onClick={() => {
                                  this.state.delete_education_idx = education_idx;
                                  this.state.delete_edu_idx = edu_idx;
                                  this.toggle();
                                }}
                                disabled={this.state.selectedYear !== Number(moment(new Date()).format("YYYY"))  ? true : false}
                              >
                                삭제
                              </Button>
                            </td>
                          </tr> // 위에 선언한 state educations 의 모든 값을 반복문으로 리턴해옴 if문을 해준 이유는 data 를 get 하는 속도보다 코드 읽는 속도가 더 빠르기 때문에 debug를 위해
                        );
                      });
                      return result;
                    })
                  ) : (
                    // 데이터가 없을 때 -> 그냥 빈 문자열 쓰면 콘솔에서 빨간 경고창 뜸
                    <tr>
                      <td></td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Widget>
          </Col>
        </Row>
        
        {/* 삭제 시 뜨는 모달 */}
        <Modal
          isOpen={this.state.modal}
          toggle={this.toggle}
          id="news-close-modal"
          className="modal-content"
        >
          <ModalHeader toggle={this.toggle} id="news-close-modal-label" className="modal-header">
            교육 데이터 삭제
          </ModalHeader>

          <ModalBody className="bg-white modal-body">
            정말로 삭제하시겠습니까?
            <br />
          </ModalBody>

          <ModalFooter className="modal-footer">
            <Button
              className="text-capitalize btn btn-warning"
              onClick={() => {
                this.state.onDelete(this.state.delete_education_idx,this.state.delete_edu_idx);
                this.toggle();
              }}
            >
              삭제
            </Button>{" "}
            <Button
              className="text-capitalize btn btn-secondary"
              onClick={() => {
                this.toggle();
              }}
            >
              취소
            </Button>
          </ModalFooter>
        </Modal>
      </React.Fragment>
    );
  }
}

export default EducationDetail;
