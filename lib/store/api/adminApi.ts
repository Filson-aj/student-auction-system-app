import { User } from '@/types/auction';
import { apiSlice } from './apiSlice';

interface AdminStats {
    totalUsers: number;
    activeListings: number;
    totalRevenue: number;
    completedAuctions: number;
}

interface Analytics {
    totalRevenue: number;
    activeUsers: number;
    newListings: number;
    conversionRate: number;
    totalBids: number;
    averageBidAmount: number;
    completionRate: number;
    averageListingDuration: number;
}

export const adminApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAdminStats: builder.query<AdminStats, void>({
            query: () => ({
                url: '/admin/stats',
                validateStatus: (response, result) => response.status === 200 && !result.isError,
            }),
            transformResponse: (responseData: { data: AdminStats }) => responseData.data,
            providesTags: ['Users', 'Items'],
        }),

        getUsers: builder.query<User[], void>({
            query: () => ({
                url: '/admin/users',
                validateStatus: (response, result) => response.status === 200 && !result.isError,
            }),
            transformResponse: (responseData: { data: User[] }) => responseData.data,
            providesTags: (result) =>
                result
                    ? [
                        { type: 'Users' as const, id: 'LIST' },
                        ...result.map((user) => ({ type: 'Users' as const, id: user._id })),
                    ]
                    : [{ type: 'Users' as const, id: 'LIST' }],
        }),

        updateUserStatus: builder.mutation<void, { userId: string; status: 'active' | 'suspended' | 'admin' }>({
            query: ({ userId, status }) => ({
                url: `/admin/users/${userId}/status`,
                method: 'PATCH',
                body: { status },
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'Users', id: arg.userId },
                { type: 'Users', id: 'LIST' },
            ],
        }),

        getAnalytics: builder.query<Analytics, void>({
            query: () => ({
                url: '/admin/analytics',
                validateStatus: (response, result) => response.status === 200 && !result.isError,
            }),
            transformResponse: (responseData: { data: Analytics }) => responseData.data,
            providesTags: ['Users', 'Items', 'Bids'],
        }),

        deleteUser: builder.mutation<void, { userId: string }>({
            query: ({ userId }) => ({
                url: `/admin/users/${userId}`,
                method: 'DELETE',
            }),
            invalidatesTags: [{ type: 'Users', id: 'LIST' }],
        }),

        exportData: builder.mutation<Blob, { type: 'users' | 'listings' | 'analytics' }>({
            query: ({ type }) => ({
                url: `/admin/export/${type}`,
                method: 'GET',
                responseHandler: (response) => response.blob(),
            }),
        }),
    }),
});

export const {
    useGetAdminStatsQuery,
    useGetUsersQuery,
    useUpdateUserStatusMutation,
    useGetAnalyticsQuery,
    useDeleteUserMutation,
    useExportDataMutation,
} = adminApiSlice;