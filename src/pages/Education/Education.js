import React from "react";
import {
  Row,
  Col,
  Button,
  Input,
} from "reactstrap";
import { CSVLink } from "react-csv";
import Widget from "../../components/Widget/Widget";
import ApexChart from "react-apexcharts";
import { Link } from "react-router-dom";
import moment from "moment";
import axios from "axios";
import uuid from "uuid/v4";
import { Cookies } from "react-cookie";

const cookies = new Cookies();

class Education extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      authority: JSON.parse(localStorage.getItem('userInfo')) ? JSON.parse(localStorage.getItem('userInfo')).authority : '',
      educations: "",
      teams: "",

      fh_learn_time_sum: [],
      sh_learn_time_sum: [],

      fh_learn_time_percent: [],
      sh_learn_time_percent: [],

      total_fh_learn_time_percent: 0,
      total_sh_learn_time_percent: 0,

      cost_sum: [],

      series: [],

      options: {
        chart: {
          height: 350,
          type: "line",
          stacked: false,
        },
        colors: ["#2CA0BA", "#FF7769", "#FFBF69"],
        dataLabels: {
          enabled: true,
          style: {
            fontSize: "12px"
          },
          offsetY: 0,
          formatter: function (value, { seriesIndex, dataPointIndex, w }) {
            if (seriesIndex === 2) {
              return value.toLocaleString("ko-KR") + " 원";
            } else {
              if (value === 0) {
                return;
              } else {
                return value + "%";
              }
            }
          },
        },
        stroke: {
          show: true,
          width: [1, 1, 5],
        },
        plotOptions: {
          bar: {
            columnWidth: "40%",
            endingShape: "rounded",
          },
        },
        tooltip: {},
        xaxis: {
          categories: [],
        },
        yaxis: [],
      },

      selectedYear: new Date().getFullYear(),

      goal: [],
      selectedGoal: 0,

      team_list: [],

      dropdownOpen: false,

      headers: [
        { label: "팀", key: "team" },
        { label: "이름", key: "stu_name" },
        { label: "교육명", key: "edu_name" },
        { label: "이수시간 (단위: 시간)", key: "learn_time" },
        { label: "시작날짜", key: "start_date" },
        { label: "종료날짜", key: "end_date" },
        { label: "지출 (단위: 원)", key: "cost" },
      ],
      
      data: [],

      isLoading: true,

    };
  }

  componentDidMount() {
    axios.defaults.headers.common['Authorization'] = cookies.get("token");
    this.findTeam();
    this.findGoal();
    this.findAllData();
    setTimeout(()=>{
      this.setState({ isLoading : false });
    },1000)
  }

  findTeam() {
    let result = [];

    axios
      .get(`http://${process.env.REACT_APP_API_URL}/teams`)
      .then((res) => res.data.filter((t) => t.teamname !== "커넥티드자율주행시스템실").sort((a, b) => a.num - b.num))
      .then((data) => {
        data.map((d, idx) => {
          axios
            .get(
              `http://${process.env.REACT_APP_API_URL}/education/teams/count?team="${d.teamname}"`
            )
            .then((res) => res.data)
            .then((count_data) => {
              result[idx] = { num: d.num, team: d.teamname, count: count_data[0].count, year: d.year };
              if (idx === data.length - 1) {
                this.findAllEducationsByYear(this.state.selectedYear, result);
              }
            })
        });

        this.setState({ team_list: result });
      }).catch(err => {
        if (cookies.get("token")) {
          cookies.remove("token");
        }
        alert("세션이 만료되었습니다. 다시 로그인 해주세요");
        window.location.href = "/";
      });
  }

  findAllEducationsByYear(year, team_list) {
    let promises = [];

    team_list = team_list.filter((tl) => Number(tl.year) === Number(year));

    team_list.map((tl) => {
      promises.push(
        axios.get(
          `http://${process.env.REACT_APP_API_URL}/education/teams/data?team="${tl.team}"&year=${year}`
        )
      );
    });

    axios.all(promises).then(
      axios.spread((...args) => {
        const fh_learn_time_sum = [];
        const sh_learn_time_sum = [];

        const fh_learn_time_percent = [];
        const sh_learn_time_percent = [];

        const cost_sum = [];

        let total_fh_learn_time = 0;
        let total_sh_learn_time = 0;
        let total_count = 0;

        for (let i = 0; i < args.length; i++) {
          const fh_learn_time_data = args[i].data[0].fh_learn_time_sum ? args[i].data[0].fh_learn_time_sum: 0;
          const sh_learn_time_data = args[i].data[0].sh_learn_time_sum ? args[i].data[0].sh_learn_time_sum: 0;
          
          total_fh_learn_time += fh_learn_time_data;
          total_sh_learn_time += sh_learn_time_data;
          total_count += team_list[i].count;

          const cost_data = args[i].data[0].cost_sum ? args[i].data[0].cost_sum: 0;

          (this.state.selectedGoal === 0 || team_list[i].count === 0) ? fh_learn_time_percent.push(0) : fh_learn_time_percent.push(((fh_learn_time_data / (this.state.selectedGoal * team_list[i].count)) * 100).toFixed(2));
          (this.state.selectedGoal === 0 || team_list[i].count === 0) ? sh_learn_time_percent.push(0) : sh_learn_time_percent.push(((sh_learn_time_data / (this.state.selectedGoal * team_list[i].count)) * 100).toFixed(2));

          fh_learn_time_sum.push(fh_learn_time_data);
          sh_learn_time_sum.push(sh_learn_time_data);

          cost_sum.push(cost_data);
        }
        total_count += 1;

        const category = [];
        this.state.team_list.map((team) => {
          if(team.year === year) {
            category.push(team.team);
          }
        });

        this.setState((prevState) => ({
          fh_learn_time_percent: fh_learn_time_percent,
          sh_learn_time_percent: sh_learn_time_percent,

          total_fh_learn_time_percent : ((total_fh_learn_time / (this.state.selectedGoal * total_count)) * 100).toFixed(2),
          total_sh_learn_time_percent : ((total_sh_learn_time / (this.state.selectedGoal * total_count)) * 100).toFixed(2),

          cost_sum: cost_sum,

          series: [
            {
              name: "이수 시간 (상반기)",
              type: "column",
              data: fh_learn_time_percent,
            },
            {
              name: "이수 시간 (하반기)",
              type: "column",
              data: sh_learn_time_percent,
            },
            {
              name: "연간 사용 금액",
              type: "line",
              data: cost_sum,
            },
          ],

          options: {
            ...prevState.options,

            tooltip: {
              onDatasetHover: {
                highlightDataSeries: true,
              },
              y: {
                formatter: function (
                  value,
                  { seriesIndex, dataPointIndex }
                ) {
                  if (seriesIndex === 2) {
                    return value.toLocaleString("ko-KR") + " 원";
                  } else if (seriesIndex === 1) {
                    return sh_learn_time_sum[dataPointIndex] + " 시간";
                  } else {
                    return fh_learn_time_sum[dataPointIndex] + " 시간";
                  }
                },
              },
            },
            xaxis: {
              categories: category,
            },
            yaxis: [
              {
                title: {
                  text: "이수 시간 달성률 (%)",
                },

                min: 0,
                max: 120,
                // max: Math.max(Math.max(...fh_learn_time_sum), Math.max(...sh_learn_time_sum)) * 1.2,
              },

              {
                show: false,

                min: 0,
                max: 120,
                // max: Math.max(Math.max(...fh_learn_time_sum), Math.max(...sh_learn_time_sum)) * 1.2,
              },

              {
                opposite: true,
                
                title: {
                  text: "연간 사용 금액 (원)",
                },

                min: 0,
                max: Math.max(...cost_sum) * 1.2,
              },
            ],
          },
        }));
      })
    )
  }

  findGoal() {
    axios
      .get(`http://${process.env.REACT_APP_API_URL}/education/goal`)
      .then((res) => res.data)
      .then((data) => {
        let selectedGoal = data.filter((g) => g.year === this.state.selectedYear);
        selectedGoal = selectedGoal.length !== 0 ? selectedGoal[0].goal : 0;

        this.setState({
          goal: data,
          selectedGoal: selectedGoal
        })
      });
  }

  findAllData() {
    axios
    .get(`http://${process.env.REACT_APP_API_URL}/education/excel`)
    .then((res) => res.data)
    .then((data) => {
      this.setState({ data: data });
    });
  }

  changeSelectedGoal = (e) => {
    const newSelectedYear = Number(e.target.value);
    let newSelectedGoal = this.state.goal.filter((g) => g.year === newSelectedYear);
    newSelectedGoal = newSelectedGoal.length !== 0 ? newSelectedGoal[0].goal : 0;

    this.setState({
      selectedGoal: newSelectedGoal,
    });
  };

  changeGoal = (e) => {
    const update_goal = Number(e.target.value);
    let new_goal = this.state.goal;

    new_goal.map((g) => {
      if(g.year === this.state.selectedYear) {
        g.goal = update_goal;
      }
    });

    this.setState({
      goal: new_goal,
      selectedGoal: update_goal
    });
  };

  updateGoal() {
    this.state.goal.map((g) => {
      if(this.state.selectedYear === Number(g.year)) {
        axios
        .post(`http://${process.env.REACT_APP_API_URL}/education/goal/update`, {
          goal: this.state.selectedGoal,
          year: this.state.selectedYear,
        })
        .then((response) => {
          console.log(response);
        }).catch(err => {
          if (cookies.get("token")) {
            cookies.remove("token");
          }
          alert("세션이 만료되었습니다. 다시 로그인 해주세요");
          window.location.href = "/";
        });
      } else {
      }
    })
  }

  render() {
    
    return (
      <div>
        <div style={{ padding: 0, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div className="col-2" style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 0 }}>
            <p style={{ fontWeight: "bold", textAlign: "center", margin: 0 }}>커넥티드자율주행시스템실 교육 현황</p>
          </div>
          <div className="col-2"  style={{ display: "flex", justifyContent: "left", alignItems: "center", padding: 0 }}>
              <select style={{ width: "auto" }} className="form-control"id="Year" value={this.state.selectedYear}
                onChange={(e) => {
                  this.changeSelectedGoal(e);
                  this.findAllEducationsByYear(Number(e.target.value),this.state.team_list);
                  this.setState({ selectedYear: Number(e.target.value) });
                }}>
              {[...Array(moment(new Date()).format('YYYY') - 2018).keys()].map((i) => (
                <option key={i} value={moment(new Date()).format('YYYY') - i + 1}>{moment(new Date()).format('YYYY') - i + 1}</option>
              ))}
            </select>
          </div>

          <div className="col-2"></div>
          <div className="col-2"></div>
            
          {this.state.authority === 0 ?
          <div className="col-4"  style={{ display: "flex", justifyContent: "left", alignItems: "center", padding: 0 }}>
            <div className="col-4"  style={{ display: "flex", justifyContent: "right", alignItems: "center" }}>
              <p style={{ fontWeight: "bold", textAlign: "center", margin: 0 }}>목표 시간: </p>
            </div>
            <div className="col-4"  style={{ display: "flex", justifyContent: "left", alignItems: "center", padding: 0 }}>
              <Input
                type="number"
                value={this.state.selectedGoal}
                onChange={(e) => {
                  this.changeGoal(e);
                }}
              />
            </div>
            <div className="col-4"  style={{ display: "flex", justifyContent: "left", alignItems: "center" }}>
              <Button
                color={"warning"}
                size="sm"
                variant="primary"
                onClick={() => {
                  this.updateGoal();
                  this.findAllEducationsByYear(this.state.selectedYear,this.state.team_list);
                }}
              >
                변경
              </Button>
            </div>
          </div>
          : null}

        </div>

        {/* 팀별 교육 차트 */}
        
        <Row style={{ padding: "20px" }}>
          <Col>
            <Widget
              title={
              <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                <p style={{ fontWeight: 700 }}>팀별 교육 달성률</p>
                <div style={{fontSize: 1+'rem'}}>
                  <strong>실 달성률 </strong>
                  상반기: {this.state.total_fh_learn_time_percent}%
                  하반기: {this.state.total_sh_learn_time_percent}%
                </div>
              </div>}
              // customDropDown
            >
              {this.state.isLoading ? <div><h1 style={{ fontWeight: "bold" }}>Loading...</h1></div> : 
                (<ApexChart
                  className="sparkline-chart"
                  height={350}
                  series={this.state.series}
                  options={this.state.options}
                  // type={"line"}
                >
                </ApexChart>)
              }
            </Widget>
          </Col>
        </Row>

        <div style={{ paddingRight: "50px", paddingLeft: "50px", display: "flex", justifyContent: "center", alignItems: "center" }}>
          {this.state.team_list.map((tl, idx) => {
            if(tl.year === this.state.selectedYear) {
              const link = "/app/education/" + tl.team;
              return (
                <div key={idx} className="col-2" style={{ paddingRight: "15px", paddingLeft: "15px" }}>
                  <Link key={idx} to={link}>
                    <Button
                      style={{ width: "100%", height: "50px", fontSize: "15px" }}
                      color={"warning"}
                    >
                      {tl.team}
                    </Button>
                  </Link>
                </div>
              )
            }
          })}

          <div className="col-2" style={{ paddingRight: "15px", paddingLeft: "15px" }}>
            <Button
            style={{ width: "100%", height: "50px" }}
              color={"success"}
            >
              <CSVLink 
                data={this.state.data} 
                headers={this.state.headers}
                filename={"커넥티드자율주행시스템실 교육현황.csv"}
                >
                엑셀 다운로드
              </CSVLink>
            </Button>
          </div>

        </div>

      </div>
    );
  }

}

export default Education;
