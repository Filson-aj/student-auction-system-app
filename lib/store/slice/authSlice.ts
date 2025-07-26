import { User } from '@/types/auction';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '..';

interface AuthState {
    user: User | null;
    token: string | null;
    refreshToken?: string | null;
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (
            state,
            action: PayloadAction<{ user: User; token: string }>
        ) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
        },
    },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentToken = (state: RootState): string | null => state.auth.token;
export const selectCurrentUser = (state: RootState): User | null => state.auth.user;