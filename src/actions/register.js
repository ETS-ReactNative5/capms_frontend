import {toast} from 'react-toastify';

export const REGISTER_REQUEST = 'REGISTER_REQUEST';
export const REGISTER_SUCCESS = 'REGISTER_SUCCESS';
export const REGISTER_FAILURE = 'REGISTER_FAILURE';

export function receiveRegister() {
    return {
        type: REGISTER_SUCCESS
    };
}

export function registerError(payload) {
    return {
        type: REGISTER_FAILURE,
        payload,
    };
}

export function registerUser(payload) { // id password 길이가 0 보다 많으면 로그인 화면으로 보냄
    return (dispatch) => {
        if (payload) {
            toast.success("회원가입이 완료 되었습니다!!");
        } else {
            dispatch(registerError('Something was wrong. Try again'));
        }
    }
}
