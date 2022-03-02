import React from 'react';
import {
    Table,
    Button,
    Input
} from "reactstrap";
import axios from "axios";
import { Cookies } from "react-cookie";

const cookies = new Cookies();

class Tool extends React.Component{
     
    constructor(props){
      super(props);

      this.state={
        tools:"", 
        num:"",
        toolname:"",
        updateEdit :[],
        onEdit : this.onEdit,
        onDelete : this.onDelete,
        updateValue : this.updateValue,
        onSave : this.onSave,

      };
    }

    getRecord = (num) => {
      const product = this.state.tools.find(item => item.num === num);
      return product;
    }

    onEdit = (num) =>{
      const tempProduct = this.state.tools;
      const index  = tempProduct.indexOf(this.getRecord(num));
      const selectedRecord = tempProduct[index];
      this.setState({
        num : selectedRecord['num'],
        toolname : selectedRecord['toolname'],
      })
    }

    updateValue= (e,test) =>{
      if(test === "toolname"){
        this.state.toolname = e.target.value;
      }
      const tempArr = [this.state.toolname];
      this.setState({
        updateEdit : tempArr
      })
    }

    onSave = (num) =>{
      if(num!==''){ // Update 조건문
        const SaveRecord = this.state.tools;
        const index = SaveRecord.indexOf(this.getRecord(num));
        const Record = SaveRecord[index];
        Record['toolname'] = this.state.updateEdit[0];
        this.setState({
          tools : [...this.state.tools],
          num :"" , toolname:"",
        })
        axios.post(`http://${process.env.REACT_APP_API_URL}/tools/update`, //DB연동
        {num: this.state.num, toolname: this.state.toolname})
        .then((response)=>{
        console.log(response);
        })
        .catch(err => {
          if (cookies.get("token")) {
            cookies.remove("token");
          }
          alert("세션이 만료되었습니다. 다시 로그인 해주세요");
          window.location.href = "/";
        });
        window.location.reload();
      }
      // Insert 조건문
      else{ 
        const MaxNum = Math.max(...this.state.tools.map(item=>item.num))
        const newArr = [];
        newArr['toolname'] = this.state.updateEdit[0];

        this.setState({
          tools : [...this.state.tools, newArr],
          num :"" , toolname:""
        })

        axios.post(`http://${process.env.REACT_APP_API_URL}/tools/add`, //DB연동
        {num: MaxNum+1, toolname: this.state.toolname})
        .then((response)=>{
          console.log(response);
        })
        .catch(err => {
          if (cookies.get("token")) {
            cookies.remove("token");
          }
          alert("세션이 만료되었습니다. 다시 로그인 해주세요");
          window.location.href = "/";
        });
        window.location.reload();
      }
    }

    //DELETE 하기 
    onDelete = (num) => {
      if (window.confirm("정말 삭제하시겠습니까??")){    //확인
        const tempProduct = this.state.tools.filter(item=> item.num !== num);
        this.setState({
          members : tempProduct,
          num :"" , toolname:"",
        })
        axios.post(`http://${process.env.REACT_APP_API_URL}/tools/delete`, //DB연동
          {num: num})
        .then((response)=>{
          console.log(response);
        })
        .catch(err => {
          if (cookies.get("token")) {
            cookies.remove("token");
          }
          alert("세션이 만료되었습니다. 다시 로그인 해주세요");
          window.location.href = "/";
        });
        window.location.reload();
      }else{   //취소
        return;
      }
    }
    componentDidMount(){
      axios.defaults.headers.common['Authorization'] = cookies.get("token");
      this.findAllTools();
    }

    findAllTools(){
      axios.get(`http://${process.env.REACT_APP_API_URL}/tools`)
      .then(res=>res.data)
      .then((data)=>{
        this.setState({tools:data});
      })
      .catch(err => {
        if (cookies.get("token")) {
          cookies.remove("token");
        }
        alert("세션이 만료되었습니다. 다시 로그인 해주세요");
        window.location.href = "/";
      });
    }

    render(){
        return(
          <>
          <div className="tool">
            <p style={{ fontWeight: 700, fontSize: 1.5+'rem' }}>도구 관리</p>
            <Table className="manage__table table-sm">
              <thead>
                <tr className="fs-sm">
                  <th>NO<br /><br /></th>
                  <th>도구명<br /><br /><Input type="text" value={this.state.toolname} onChange={(e) => {this.state.updateValue(e,"toolname")}}/></th>
                  <th>Action<br /><br /><Button color="info" size="sm" onClick={()=>{this.state.onSave(this.state.num)}}>{this.state.num ? "변경" : "추가"}</Button></th>
                </tr>
              </thead>
              <tbody>  
                {this.state.tools ? this.state.tools.map(c => {
                  return( 
                    <tr key={c.num}> 
                      <td style={{ width: "50px", textAlign: "center"}}>{c.num}</td>
                      <td>{c.toolname}</td> 
                      <td style={{ width: "20px"}}>
                        <Button color={"warning"} className="UpdateBtn" size="sm" variant="primary" onClick={()=>{this.state.onEdit(c.num)}}>수정</Button>&nbsp;&nbsp;
                        <Button color={"default"} className="UpdateBtn" size="sm" variant="danger"onClick={()=>{this.state.onDelete(c.num)}}>삭제</Button></td>
                    </tr>
                  );
                })  :<tr><td colSpan="3">데이터가 없습니다.</td></tr>}
              </tbody>
            </Table>
          </div>
        </>
      )
    }
}

export default Tool;