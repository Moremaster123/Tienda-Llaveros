import { createSlice } from '@reduxjs/toolkit';

import {
    authenticate,
    registerUser,
    loadSession,
    saveSession,
    clearSession,
} from '../utils/users';

const authSlice = createSlice({
    name: 'auth',
    initialState: { user: loadSession() },
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
        },
        clearUser: (state) => {
            state.user = null;
        },
    },
});

export const { setUser, clearUser } = authSlice.actions;

export const login = (email, password) => (dispatch) => {
    const user = authenticate(email, password);

    if (!user) {
        return { ok: false, error: 'Correo o contraseña incorrectos.' };
    }

    saveSession(user);
    dispatch(setUser(user));

    return { ok: true };
};

export const register = (values) => (dispatch) => {
    const result = registerUser(values);

    if (!result.ok) {
        return result;
    }

    saveSession(result.user);
    dispatch(setUser(result.user));

    return { ok: true };
};

export const logout = () => (dispatch) => {
    clearSession();
    dispatch(clearUser());
};

export const selectUser = (state) => state.auth.user;

export default authSlice.reducer;
