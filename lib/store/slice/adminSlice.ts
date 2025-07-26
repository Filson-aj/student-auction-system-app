import { User } from '@/types/auction';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '..';

interface AdminState {
    admin: User | null;
    token: string | null;
    isAuthenticated: boolean;
}

const initialState: AdminState = {
    admin: null,
    token: null,
    isAuthenticated: false,
};

const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        setAdminCredentials: (
            state,
            action: PayloadAction<{ admin: User; token: string }>
        ) => {
            state.admin = action.payload.admin;
            state.token = action.payload.token;
            state.isAuthenticated = true;
        },
        adminLogout: (state) => {
            state.admin = null;
            state.token = null;
            state.isAuthenticated = false;
        },
    },
});

export const { setAdminCredentials, adminLogout } = adminSlice.actions;
export default adminSlice.reducer;

export const selectCurrentAdminToken = (state: RootState): string | null => state.admin.token;
export const selectCurrentAdmin = (state: RootState): User | null => state.admin.admin;
export const selectIsAdminAuthenticated = (state: RootState): boolean => state.admin.isAuthenticated;