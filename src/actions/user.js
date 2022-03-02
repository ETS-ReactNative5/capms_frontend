import { Cookies } from 'react-cookie';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';
export const LOGOUT_REQUEST = 'LOGOUT_REQUEST';
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';

const cookies = new Cookies();

export function receiveLogin() {
    return {
        type: LOGIN_SUCCESS
    };
}

function loginError(payload) {
    return {
        type: LOGIN_FAILURE,
        payload,
    };
}

function requestLogout() {
    return {
        type: LOGOUT_REQUEST,
    };
}

export function receiveLogout() {
    return {
        type: LOGOUT_SUCCESS,
    };
}

// Logs the user out
export function logoutUser() {
    return (dispatch) => {
        dispatch(requestLogout());
        localStorage.removeItem('userInfo');
        cookies.remove('token');
        dispatch(receiveLogout());
    };
}

// export function loginUser(creds) {
//     return (dispatch) => {

//         dispatch(receiveLogin());

//         if (creds.id.length > 0 && creds.password.length > 0) {
//             localStorage.setItem('authenticated', true)
//         } else {
//             dispatch(loginError('Something was wrong. Try again'));
//         }
//     }
// }
