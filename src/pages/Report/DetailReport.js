import axios from 'axios';
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Row, Col } from "reactstrap";
import Table from "reactstrap/lib/Table";
import Widget from "../../components/Widget/Widget";
import "./DetailReport.scss";
import { useCookies } from 'react-cookie';

const DetailWeekly = (props) => {
  const [cookies, removeCookie ] = useCookies(['token']);
  const user = JSON.parse(localStorage.getItem('userInfo')) ? JSON.parse(localStorage.getItem('userInfo')) : ''; 
  const id = Number(props.match.params.id);
  const project_id = props.match.params.pid;
  const [project, setProject] = useState({
    프로젝트명: "",
    PM: "",
    상태: "",
    착수: "",
    종료: "",
  });
  const [report, setReport] = useState({
    작성자: "",
    금주계획: "",
    금주진행: "",
    차주계획: "",
    특이사항: "",
    최종수정시간: "",
    비고: "",
  });
  const [inModifying, setInModifying] = useState(false);
  const [lastReport, setLastReport] = useState({
    금주계획: '',
    금주진행: '',
    차주계획: '',
    특이사항: '',
    비고: ''
  });
  const [member, setMember] = useState();
  const [head, setHead] = useState();
  const cssStart = "<span style='background-color: #ffff00'>"
  const cssEnd = "</span>";

  const adjustHeight = (id) => {
    const textEle = document.getElementById(id);
    return(textEle ? textEle.scrollHeight : 30);
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
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

  const onClickUpdate = () =>
  {
    const result = window.confirm("수정하시겠습니까?");
    if(result){
      axios.post(`http://${process.env.REACT_APP_API_URL}/reports/update`, {report, id, 최종수정시간: new Date()})
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
  }

  const onClickDelete = () =>
  {
    const result = window.confirm("삭제하시겠습니까?");
    if (result) {
      axios.post(`http://${process.env.REACT_APP_API_URL}/reports/delete`, {id: id})
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
      window.location.href = "#/app/projects/reports";
    }
  }

  useEffect(()=> findAllInfos(), []);

  const findAllInfos = () => {
    axios.defaults.headers.common['Authorization'] = cookies.token;
    axios
    .all([
      axios.get(`http://${process.env.REACT_APP_API_URL}/projects/search?id=${props.match.params.pid}&year=${props.match.params.year}`),
      axios.get(`http://${process.env.REACT_APP_API_URL}/reports/search?id=${props.match.params.id}`),
      axios.get(`http://${process.env.REACT_APP_API_URL}/reports/search/last?pid=${props.match.params.pid}`),
      axios.get(`http://${process.env.REACT_APP_API_URL}/members`)])
    .then(axios.spread((res1,res2,res3,res4)=>{
      setProject(res1.data[0]);
      setReport(res2.data[0]);
      const thisReport = res2.data[0];
      const _lastReport = res3.data.find(({최종수정시간}) =>
      ((new Date(최종수정시간).getWeek(3) === new Date(thisReport.최종수정시간).getWeek(3) - 1) || (new Date(최종수정시간.substring(0,10)).getWeek(3) === new Date(thisReport.최종수정시간.substring(0,10)).getWeek(3) - 1)
      || (new Date(최종수정시간).getWeek(3) === new Date(thisReport.최종수정시간).getWeek(3) - 1) || (new Date(최종수정시간.substring(0,10)).getWeek(3) === new Date(thisReport.최종수정시간.substring(0,10)).getWeek(3) - 1)) 
      && ((new Date(최종수정시간).getFullYear() === new Date(thisReport.최종수정시간).getFullYear()) || (new Date(최종수정시간.substring(0,10)).getFullYear() === new Date(thisReport.최종수정시간).getFullYear())
      || (new Date(최종수정시간).getFullYear() === new Date(thisReport.최종수정시간.substring(0,10)).getFullYear()) || (new Date(최종수정시간.substring(0,10)).getFullYear() === new Date(thisReport.최종수정시간.substring(0,10)).getFullYear())));
      _lastReport ? setLastReport({..._lastReport}) : setLastReport({금주계획: '', 금주진행: '', 차주계획: '', 특이사항: '', 비고: ''});
      const member = res4.data.find(({id}) => id === res2.data[0].작성자);
      const head = res4.data.find((head) => head.team === res1.data[0].팀매출 && head.직책 === '팀장');
      setHead(head ? head.id : '');
      setMember(member);
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
    if(content.indexOf(cssStart,0) !== -1 || content.indexOf(cssEnd,0) !== -1)
      return true; //cssStart와 cssEnd 둘 중 하나라도 가지고 있으면 true
    return false;
  }

  return (
    <>
      <Row>
        <Col>
          <Widget style={{paddingTop: 2+'rem'}}>
            {inModifying ?
              <>
                <button className="btn btn-warning" onClick={highlightText} style={{zIndex: 10, position: 'fixed', right:5+'rem' }}>강조</button>
                <Table>
                  <thead>
                    <tr style={{fontWeight: 'bold'}}>
                      <td colSpan="2">
                        <div style={{textAlign: 'center', fontWeight: 'bold'}}>
                          <Link to={{pathname: `/app/projects/list/${project_id}/${props.match.params.year}`}}>{project.프로젝트명}</Link>
                        </div>
                      </td>
                    </tr>
                    <tr style={{fontWeight: 'bold'}}>
                      <td className="detail-report__col-1">작성자</td>
                      <td className="detail-report__col-1"><input className="form-control" type="text" name="작성자" disabled value={member ? member.name : ""}/></td>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{fontWeight: 'bold'}}>
                      <td className="detail-report__col-1">(전)금주계획</td>
                      <td className="detail-report__col-1">금주계획</td>
                    </tr>
                    <tr>
                      <td className="detail-report__col-1 detailReport__td_content">
                        <div className="detailReport__div" dangerouslySetInnerHTML={ {__html: lastReport.금주계획} }></div>
                      </td>
                      <td className="detail-report__col-1 detailReport__td_content">
                        <textarea 
                          type="text" 
                          name="금주계획"
                          maxLength="5000" 
                          value={report.금주계획}
                          id="thisplan"
                          style={{height: adjustHeight("thisplan")+'px'}}
                          onChange={onChange}/>
                      </td>
                    </tr>
                    <tr style={{fontWeight: 'bold'}}>
                      <td className="detail-report__col-1">(전)금주진행</td>
                      <td className="detail-report__col-1">금주진행</td>
                    </tr>
                    <tr>
                      <td className="detail-report__col-1 detailReport__td_content">
                        <div className="detailReport__div" dangerouslySetInnerHTML={ {__html: lastReport.금주진행} }></div>
                      </td>
                      <td className="detail-report__col-1 detailReport__td_content">
                        <textarea
                          type="text" 
                          name="금주진행" 
                          maxLength="10000" 
                          value={report.금주진행}
                          id="thisprogress"
                          style={{height: adjustHeight("thisprogress")+'px'}}
                          onChange={onChange}/>
                        </td>
                    </tr>
                    <tr style={{fontWeight: 'bold'}}>
                      <td className="detail-report__col-1">(전)차주계획</td>
                      <td className="detail-report__col-1">차주계획</td>
                    </tr>
                    <tr>
                      <td className="detail-report__col-1 detailReport__td_content">
                        <div className="detailReport__div" dangerouslySetInnerHTML={ {__html: lastReport.차주계획} }></div>
                      </td>
                      <td className="detail-report__col-1 detailReport__td_content">
                        <textarea
                          type="text" 
                          name="차주계획" 
                          maxLength="5000" 
                          value={report.차주계획}
                          id="nextplan"
                          style={{height: adjustHeight("nextplan")+'px'}}
                          onChange={onChange}/>
                        </td>
                    </tr>
                    <tr style={{fontWeight: 'bold'}}>
                      <td className="detail-report__col-1">(전)특이사항</td>
                      <td className="detail-report__col-1">특이사항</td>
                    </tr>
                    <tr>
                      <td className="detail-report__col-1 detailReport__td_content">
                        <div className="detailReport__div" dangerouslySetInnerHTML={ {__html: lastReport.특이사항} }></div>
                      </td>
                      <td className="detail-report__col-1 detailReport__td_content">
                        <textarea
                          type="text" 
                          name="특이사항" 
                          maxLength="5000" 
                          value={report.특이사항}
                          id="special"
                          style={{height: adjustHeight("special")+'px'}}
                          onChange={onChange}/>
                      </td>
                    </tr>
                    <tr style={{fontWeight: 'bold'}}>
                      <td className="detail-report__col-1">(전)비고</td>
                      <td className="detail-report__col-1">비고</td>
                    </tr>
                    <tr>
                      <td className="detail-report__col-1 detailReport__td_content">
                        <div className="detailReport__div" dangerouslySetInnerHTML={ {__html: lastReport.비고} }></div>
                      </td>
                      <td className="detail-report__col-1 detailReport__td_content">
                        <textarea
                          type="text" 
                          name="비고" 
                          maxLength="5000" 
                          value={report.비고}
                          id="etc"
                          style={{height: adjustHeight("etc")+'px'}}
                          onChange={onChange}/>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </>
              :
              <>
                <Table>
                  <thead>
                    <tr style={{fontWeight: 'bold'}}>
                      <td colSpan="2">
                        <div style={{textAlign: 'center', fontWeight: 'bold'}}>
                          <Link to={{pathname: `/app/projects/list/${project_id}/${props.match.params.year}`}}>{project.프로젝트명}</Link>
                        </div>
                      </td>
                    </tr>
                    <tr style={{fontWeight: 'bold'}}>
                      <td className="detail-report__col-1">작성자</td>
                      <td className="detail-report__col-1"><input className="form-control" type="text" name="작성자" disabled value={member ? member.name : ""}/></td>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{fontWeight: 'bold'}}>
                      <td className="detail-report__col-1">(전)금주계획</td>
                      <td className="detail-report__col-1">금주계획</td>
                    </tr>
                    <tr>
                      <td className="detail-report__col-1 detailReport__td_content">
                        <div className="detailReport__div" dangerouslySetInnerHTML={ {__html: lastReport.금주계획} }></div>
                      </td>
                      <td className="detail-report__col-1 detailReport__td_content">
                        <div className="detailReport__div" dangerouslySetInnerHTML={ {__html: report.금주계획} }></div>
                      </td>
                    </tr>
                    <tr style={{fontWeight: 'bold'}}>
                      <td className="detail-report__col-1">(전)금주진행</td>
                      <td className="detail-report__col-1">금주진행</td>
                    </tr>
                    <tr>
                      <td className="detail-report__col-1 detailReport__td_content">
                        <div className="detailReport__div" dangerouslySetInnerHTML={ {__html: lastReport.금주진행} }></div>
                      </td>
                      <td className="detail-report__col-1 detailReport__td_content">
                        <div className="detailReport__div" dangerouslySetInnerHTML={ {__html: report.금주진행} }></div>
                      </td>
                    </tr>
                    <tr style={{fontWeight: 'bold'}}>
                      <td className="detail-report__col-1">(전)차주계획</td>
                      <td className="detail-report__col-1">차주계획</td>
                    </tr>
                    <tr>
                      <td className="detail-report__col-1 detailReport__td_content">
                        <div className="detailReport__div" dangerouslySetInnerHTML={ {__html: lastReport.차주계획} }></div>
                      </td>
                      <td className="detail-report__col-1 detailReport__td_content">
                        <div className="detailReport__div" dangerouslySetInnerHTML={ {__html: report.차주계획} }></div>
                      </td>
                    </tr>
                    <tr style={{fontWeight: 'bold'}}>
                      <td className="detail-report__col-1">(전)특이사항</td>
                      <td className="detail-report__col-1">특이사항</td>
                    </tr>
                    <tr>
                      <td className="detail-report__col-1 detailReport__td_content">
                        <div className="detailReport__div" dangerouslySetInnerHTML={ {__html: lastReport.특이사항} }></div>
                      </td>
                      <td className="detail-report__col-1 detailReport__td_content">
                        <div className="detailReport__div" dangerouslySetInnerHTML={ {__html: report.특이사항} }></div>
                      </td>
                    </tr>
                    <tr style={{fontWeight: 'bold'}}>
                      <td className="detail-report__col-1">(전)비고</td>
                      <td className="detail-report__col-1">비고</td>
                    </tr>
                    <tr>
                      <td className="detail-report__col-1 detailReport__td_content">
                        <div className="detailReport__div" dangerouslySetInnerHTML={ {__html: lastReport.비고} }></div>
                      </td>
                      <td className="detail-report__col-1 detailReport__td_content">
                        <div className="detailReport__div" dangerouslySetInnerHTML={ {__html: report.비고} }></div>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </>
            }
            {inModifying ?
              <>
                <button className="btn btn-primary" onClick={onClickUpdate}>등록</button>
                <button className="btn btn-primary" onClick={() => setInModifying(false)}>취소</button>
              </>
              :
              <>
              {new Date().getFullYear() === new Date(report.최종수정시간).getFullYear() &&
              new Date().getWeek(3) === new Date(report.최종수정시간).getWeek(3) &&
              (user.id === report.작성자 || user.id === head) ?
                <>
                  <button className="btn btn-primary" onClick={() => setInModifying(true)}>수정</button>
                  <button className="btn btn-primary" onClick={onClickDelete}>삭제</button>
                </>
              : null}
              </>
            }
            <button className="btn btn-primary" onClick={() => window.location.href = "#/app/projects/reports"}>목록</button>
          </Widget>
        </Col>
      </Row>
    </>
  );
};

export default DetailWeekly;