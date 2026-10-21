import { join, login, logout } from '../api/authApi';

export const registerAuthListeners = (startListening, { notify, redirect, session }) => {
    startListening({ actionCreator: login.fulfilled, effect: action => session.set(action.payload.token) });
    startListening({ actionCreator: logout.fulfilled, effect: () => {
        session.clear();
        notify('boardSlice.logoutSucc');
    } });
    startListening({ actionCreator: join.fulfilled, effect: () => {
        notify('boardSlice.joinSucc');
        redirect('/login');
    } });
    startListening({ actionCreator: join.rejected, effect: () => notify('boardSlice.error') });
    startListening({ actionCreator: login.rejected, effect: action => {
        const code = action.payload?.code;
        notify(code === 200 ? 'boardSlice.idNotExist' : code === 201 ? 'boardSlice.passwordWrong' : 'boardSlice.loginError');
    } });
};
