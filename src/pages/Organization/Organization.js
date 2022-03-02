import React, {useState, useEffect} from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import './Organization.scss'
import Widget from "../../components/Widget/Widget";

const ranks = ['수석(부장)', '책임', '선임', '전임']

const Organization = () => {
  const [cookies, removeCookie ] = useCookies(['token']);
  const [teams, setTeams] = useState([]);
  const [members, setMembers] = useState([]);

  useEffect(() => findAllInfo(), []);

  const findAllInfo = () => {
    axios.defaults.headers.common['Authorization'] = cookies.token;
    axios
    .all([
      axios.get(`http://${process.env.REACT_APP_API_URL}/members`),
      axios.get(`http://${process.env.REACT_APP_API_URL}/teams`),
    ])
    .then(axios.spread((res1, res2) => {
      setMembers(res1.data);
      setTeams(res2.data
        .filter(team => team.year === new Date().getFullYear() && team.teamname.charAt(team.teamname.length - 1) === '팀')
        .sort((a, b) => a.num - b.num));
    }))
    .catch(err => {
      console.log(err);
      if (cookies.token) {
        removeCookie('token');
      }
      alert("세션이 만료되었습니다. 다시 로그인 해주세요");
      window.location.href = "/";
    });
  };

  const getHead = () => {
    if (members.length > 0) {
      const head = members.find(member => member.직책 === '실장');
      return (head.name + " " + head.직책);
    }
  };

  const getTeamMembers = (team, rank) => {
    const _members = members.filter(member => member.team === team && member.직급 === rank && member.직책 !== '팀장')
    .sort((a, b) => a.name.localeCompare(b.name))
    let data = [];
    _members.forEach((member, index) => {
      data.push(
        <div key={index}>
          <div className={"organization__team_"+ranks.indexOf(member.직급)}>{member.name} {member.직급}</div>
        </div>
      );
    });
    return data;
  };

  return (
    <Widget title={<p style={{ fontSize:30, fontWeight: 700 }}>조직도</p>}>
      <div className="organization__wrapper">
        <div className="organization__title">
          <div className="organization__title_main">커넥티드자율주행시스템실</div>
          <div className="organization__title_sub">{getHead()}</div>
        </div>
        <div className="organization__calculate">
          총 인원 {members.filter(member => member.team && teams.find(({teamname, year}) => teamname === member.team && year === new Date().getFullYear()) && member.직급 !== '인턴').length + 1}명
        </div>
        <table className="organization__teams">
          <thead>
            <tr>
              {teams
              .map((team, index) => (
                <td className="organization__team_name" key={index}>{team.teamname}</td>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {teams
              .map((team, idx) => (
                members
                .filter(member => member.team === team.teamname && member.직책 === '팀장')
                .map((member, index) => (
                  <td className="organization__team_head" key={idx.toString() + index.toString()}>{member.name} {member.직책}</td>
                ))
              ))}
            </tr>
              {ranks
              .map((rank, idx) => (
                <tr>
                  {teams
                  .map((team, index) => (
                    <td className="organization__team_member" key={idx.toString() + index.toString()}>
                      {getTeamMembers(team.teamname, rank)}
                    </td>))}
                </tr>
              ))}
            <tr>
              {teams.map(({teamname}, index) => (
                <td className="organization__team_name" key={index}>
                  {members.filter(member => member.team === teamname && member.직급 !== '인턴').length}명
                </td>
              ))}
            </tr>
          </tbody>
        </table>
        <div className="organization__interns">
          <div className="organization__interns_title">인턴</div>
          <div className="organization__interns_list">
          {members.filter(member => member.직급 === '인턴').map((member, index) => (
            <div key={index}>
              <div className="organization__interns_0">{member.name}</div>
            </div>
          ))}
          </div>
        </div>
      </div>
    </Widget>
  );
}

export default Organization;