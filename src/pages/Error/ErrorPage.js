import React from "react";
import { Container } from "reactstrap";

import s from "./ErrorPage.module.scss";
import errorImg from "../../images/error-page-img.svg";

class ErrorPage extends React.Component {
  render() {
    return (
      <div className={s.errorPage}>
        <Container>
          <img src={errorImg} alt="error" />
          <div className={`${s.errorContainer}`}>
            <h1 className={s.errorInfo}>404</h1>
            <p className={s.errorHelp}>
              페이지를 찾을 수 없습니다.
            </p>
            <p className={s.errorHelp}>주소를 확인해주세요</p>
          </div>
        </Container>
      </div>
    );
  }
}

export default ErrorPage;
