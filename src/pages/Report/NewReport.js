import axios from 'axios';
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Row, Col } from "reactstrap";
import Table from "reactstrap/lib/Table";
import Widget from "../../components/Widget/Widget";
import './NewReport.scss';
import { useCookies } from 'react-cookie';

const NewReport = () => {
  const [cookies, removeCookie ] = useCookies(['token']);
  const [projects , setProjects] = useState([]);
  const [report, setReport] = useState({
    project_id: '',
    프로젝트: '',
    작성자: '',
    금주계획: '',
    금주진행: '',
    차주계획: '',
    특이사항: '',
    비고: '',
  });
  const [lastReport, setLastReport] = useState({
    금주계획: '',
    금주진행: '',
    차주계획: '',
    특이사항: '',
    비고: ''
  });
  const cssStart = "<span style='background-color: #ffff00'>"
  const cssEnd = "</span>";

  const adjustHeight = (id) => {
    const textEle = document.getElementById(id);
    return(textEle ? textEle.scrollHeight : 30);
  };

  const onClickSubmit = () => {
    if (!report.project_id) {
      alert("프로젝트를 선택해주세요.");
      return;
    } else if (!report.작성자) {
      alert("작성자를 적어주세요.");
      return;
    }
    const result = window.confirm("등록하시겠습니까?");
    if (result) {
      axios.post(`http://${process.env.REACT_APP_API_URL}/reports/add`, {report: {...report, 최종수정시간: new Date()}})
      .then(res => {
        alert("등록되었습니다.");
      })
      .catch(err => {
        if (cookies.token) {
          removeCookie('token');
        }
        alert("세션이 만료되었습니다. 다시 로그인 해주세요");
        window.location.href = "/";
      });
      window.location.href = "#/app/projects/reports";
    }
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case "프로젝트":
        return(setReport({ ...report, 프로젝트: value }));
      case "작성자":
        return(setReport({ ...report, 작성자: value }));
      case "금주계획":
        return(setReport({ ...report, 금주계획: value }));
      case "금주진행":
        return(setReport({ ...report, 금주진행: value }));
      case "차주계획":
        return(setReport({ ...report, 차주계획: value }));
      case "특이사항":
        return(setReport({ ...report, 특이사항: value }));
      case "비고":
        return(setReport({ ...report, 비고: value }));
      default:
        return;
    }
  }

  useEffect(()=> {
    const tempProject = projects.find(({프로젝트명}) => 프로젝트명 === report.프로젝트);
    if (tempProject) {
      setReport({ ...report, project_id: tempProject.id });
      axios.get(`http://${process.env.REACT_APP_API_URL}/reports/search/last?pid=${tempProject.id}`)
      .then((res) => {
        const _lastReport = res.data.find(({최종수정시간}) => 
        ((new Date(최종수정시간).getWeek(3) === new Date().getWeek(3) - 1) || (new Date(최종수정시간.substring(0,10)).getWeek(3) === new Date().getWeek(3) - 1)) 
        && ((new Date(최종수정시간).getFullYear() === new Date().getFullYear()) || (new Date(최종수정시간.substring(0,10)).getFullYear() === new Date().getFullYear())));
        _lastReport ? setLastReport({..._lastReport}) : setLastReport({금주계획: '', 금주진행: '', 차주계획: '', 특이사항: '', 비고: ''});
      })
      .catch(err => {
        if (cookies.token) {
          removeCookie('token');
        }
        alert("세션이 만료되었습니다. 다시 로그인 해주세요");
        window.location.href = "/";
      });
    } else {
      setReport({ ...report, project_id: '' });
    }
  }, [report.프로젝트])

  useEffect(()=> {
    findAllInfos();
  }, []);

  const findAllInfos = () => {
    const id = JSON.parse(localStorage.getItem("userInfo")) ? JSON.parse(localStorage.getItem("userInfo")).id : '';
    axios.defaults.headers.common['Authorization'] = cookies.token;
    axios.all([
      axios.get(`http://${process.env.REACT_APP_API_URL}/projects`),
      axios.get(`http://${process.env.REACT_APP_API_URL}/members/search?id=${id}`),
      axios.get(`http://${process.env.REACT_APP_API_URL}/reports`)
    ])
    .then(
      axios.spread((res, res2, res3) => {
      const thisReport = res3.data.filter(report =>
        (new Date(report.최종수정시간).getFullYear() === new Date().getFullYear() && new Date(report.최종수정시간).getWeek(3) === new Date().getWeek(3))
        || (new Date(report.최종수정시간.substring(0,10)).getFullYear() === new Date().getFullYear() && new Date(report.최종수정시간.substring(0,10)).getWeek(3) === new Date().getWeek(3)));
      const _projects = res.data.filter((project) => Number(project.주간보고서) === 1 && Number(project.year) === new Date().getFullYear() && project.상태 !== "8.Dropped"
      && (project.투입명단.includes(id) || project.PM === id 
      || (res2.data[0] && project.팀매출 === res2.data[0].team && res2.data[0].직책 === '팀장')
      || (res2.data[0] && res2.data[0].직책 === '실장')))
      .filter(project => !thisReport.find(report => Number(report.project_id) === Number(project.id)));
      setProjects(_projects);
      setReport({ ...report, 작성자: JSON.parse(localStorage.getItem("userInfo")) ? JSON.parse(localStorage.getItem("userInfo")).id : '' });
    }))
    .catch(err => {
      if (cookies.token) {
        removeCookie('token');
      }
      alert("세션이 만료되었습니다. 다시 로그인 해주세요");
      window.location.href = "/";
    });
  }

  function highlightText() { //강조버튼 클릭시 해당 내용을 강조하는 함수
    let selection = "";
    if (document.getSelection) { //크롬
      selection = document.getSelection();
    } else if (document.selection) { //익스
      selection = document.selection.createRange().text;
    }
    try {
      let selectionTextArea = selection.anchorNode.lastElementChild; //선택된 textArea
      if (selectionTextArea.name === "프로젝트" || selectionTextArea.name === "작성자")
        return;
      //getCssIndex(selectionTextArea.value); //선택된 textArea에 css 태그 index 가져오기
      let selectStartIndex = selectionTextArea.selectionStart; // 드래그 영역 selectStartIndex~selectEndIndex-1
      let selectEndIndex = selectionTextArea.selectionEnd;
      let content = selectionTextArea.value;

      // aaAAbb => aa AA bb
      let dragBefore = selectionTextArea.value.substring(0, selectStartIndex);
      let drag = selectionTextArea.value.substring(selectStartIndex, selectEndIndex); //강조할 부분
      let dragAfter = selectionTextArea.value.substring(selectEndIndex, content.length);

      // aa<span>AA</span>bb -> AA만 드래그 했을 경우 고려해서 => aa <span>AA</span> bb
      let includeDragBefore = selectionTextArea.value.substring(0, selectStartIndex-cssStart.length)
      let includeDrag = selectionTextArea.value.substring(selectStartIndex-cssStart.length, selectEndIndex+cssEnd.length) 
      let includeDragAfter = selectionTextArea.value.substring(selectEndIndex+cssEnd.length, content.length);
      
      // <span></span> +- 과정에서 인덱스 벗어나는 경우 고려
      if((selectStartIndex-cssStart.length < 0)&&(selectEndIndex+cssEnd.length>=content.length)){
        includeDragBefore = dragBefore;
        includeDrag = drag;
        includeDragAfter = dragAfter;
      }
      else if(selectStartIndex-cssStart.length < 0){
        includeDragBefore = "";
        includeDrag = selectionTextArea.value.substring(0, selectEndIndex+cssEnd.length)
      }
      else if(selectEndIndex+cssEnd.length>=content.length){
        selectionTextArea.value.substring(selectStartIndex-cssStart.length, content.length)
        includeDragAfter = "";
      }
      
      if(hasHighlight(includeDrag)){ // 강조 해제
        includeDrag = includeDrag.replaceAll(cssStart,"");
        includeDrag = includeDrag.replaceAll(cssEnd, "");
        dragBefore = includeDragBefore;
        drag = includeDrag;
        dragAfter = includeDragAfter;
      }
      else{ // 강조
        drag = cssStart + drag + cssEnd;
      }
      selectionTextArea.value = dragBefore + drag + dragAfter;
      const { name } = selectionTextArea;
      switch (name) {
        case "금주계획":
          return(setReport({ ...report, 금주계획: selectionTextArea.value }));
        case "금주진행":
          return(setReport({ ...report, 금주진행: selectionTextArea.value }));
        case "차주계획":
          return(setReport({ ...report, 차주계획: selectionTextArea.value }));
        case "특이사항":
          return(setReport({ ...report, 특이사항: selectionTextArea.value }));
        case "비고":
          return(setReport({ ...report, 비고: selectionTextArea.value }));
        default:
          return;
      }
    } catch (err) {
    }
  }

  function hasHighlight(content){ //강조되어있는지 확인하는 함수
    if(content.indexOf(cssStart,0)!== -1 || content.indexOf(cssEnd,0) !== -1)
      return true; //cssStart와 cssEnd 둘 중 하나라도 가지고 있으면 true
    return false;
  }

  return (
    <>
      <Row>
        <Col>
          <Widget style={{paddingTop: 2+'rem'}}>
            <Table>
              <tbody>
                <tr style={{fontWeight: 'bold'}}>
                  <td>프로젝트</td>
                  <td>
                    <select className="form-control" name="프로젝트" value={report.프로젝트} onChange={onChange}>
                      <option value="" disabled hidden></option>
                      {projects
                      .map(({프로젝트명}, index) => {
                        return (
                          <option value={프로젝트명} key={index}>{프로젝트명}</option>
                        )
                      })}
                    </select>
                  </td>
                </tr>
                <tr style={{fontWeight: 'bold'}}>
                  <td>작성자</td>
                  <td><input className="form-control" type="text" name="작성자" disabled value={JSON.parse(localStorage.getItem("userInfo")).name}/></td>
                </tr>
              </tbody>
            </Table>
          </Widget>
          <Widget style={{paddingTop: 2+'rem'}}>
            <button className="btn btn-warning" onClick={highlightText} style={{zIndex: 10, position: 'fixed', right:1+'rem' }}>강조</button>
            <Table>
              <tbody>
                <tr style={{fontWeight: 'bold'}}>
                  <td className="col-1">(전)금주계획</td>
                  <td className="col-1">금주계획</td>
                </tr>
                <tr>
                  <td className="newReport__td">
                    <p className="newReport__p" dangerouslySetInnerHTML={ {__html: lastReport.금주계획} }></p>
                  </td>
                  <td className="newReport__td">
                    <textarea 
                      type="text" 
                      name="금주계획"
                      maxLength="5000" 
                      value={report.금주계획}
                      id="thisplan"
                      style={{height: adjustHeight("thisplan")+'px', border: 'none', outline: 'none'}}
                      onChange={onChange}/>
                    </td>
                </tr>
                <tr style={{fontWeight: 'bold'}}>
                  <td className="newReport__td">(전)금주진행</td>
                  <td className="newReport__td">금주진행</td>
                </tr>
                <tr>
                  <td className="newReport__td">
                    <p className="newReport__p" dangerouslySetInnerHTML={ {__html: lastReport.금주진행} }></p>
                  </td>
                  <td className="newReport__td">
                    <textarea
                      type="text" 
                      name="금주진행" 
                      maxLength="10000" 
                      value={report.금주진행}
                      id="thisprogress"
                      style={{height: adjustHeight("thisprogress")+'px', border: 'none', outline: 'none'}}
                      onChange={onChange}/>
                    </td>
                </tr>
                <tr style={{fontWeight: 'bold'}}>
                  <td className="newReport__td">(전)차주계획</td>
                  <td className="newReport__td">차주계획</td>
                </tr>
                <tr>
                  <td className="newReport__td">
                    <p className="newReport__p" dangerouslySetInnerHTML={ {__html: lastReport.차주계획} }></p>
                  </td>
                  <td className="newReport__td">
                    <textarea
                      type="text" 
                      name="차주계획" 
                      maxLength="5000" 
                      value={report.차주계획}
                      id="nextplan"
                      style={{height: adjustHeight("nextplan")+'px', border: 'none', outline: 'none'}}
                      onChange={onChange}/>
                    </td>
                </tr>
                <tr style={{fontWeight: 'bold'}}>
                  <td className="newReport__td">(전)특이사항</td>
                  <td className="newReport__td">특이사항</td>
                </tr>
                <tr>
                  <td className="newReport__td">
                    <p className="newReport__p" dangerouslySetInnerHTML={ {__html: lastReport.특이사항} }></p>
                  </td>
                  <td className="newReport__td">
                    <textarea
                      type="text" 
                      name="특이사항" 
                      maxLength="5000" 
                      value={report.특이사항}
                      id="special"
                      style={{height: adjustHeight("special")+'px', border: 'none', outline: 'none'}}
                      onChange={onChange}/>
                    </td>
                </tr>
                <tr style={{fontWeight: 'bold'}}>
                  <td className="newReport__td">(전)비고</td>
                  <td className="newReport__td">비고</td>
                </tr>
                <tr>
                  <td className="newReport__td">
                    <p className="newReport__p" dangerouslySetInnerHTML={ {__html: lastReport.비고} }></p>
                  </td>
                  <td className="newReport__td">
                    <textarea
                      type="text" 
                      name="비고" 
                      maxLength="5000" 
                      value={report.비고}
                      id="etc"
                      style={{height: adjustHeight("etc")+'px', border: 'none', outline: 'none'}}
                      onChange={onChange}/>
                    </td>
                </tr>
              </tbody>
            </Table>
            <button className="btn btn-primary" onClick={onClickSubmit}>등록</button>
            <Link to="/app/projects/reports"><button className="btn btn-primary">취소</button></Link>
          </Widget>
        </Col>
      </Row>
    </>
  );
};

export default NewReport;