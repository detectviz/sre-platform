import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  UsersApi,
  TeamsApi,
} from './api-client/api';
import type {
  OperationResult,
  UserList,
  ListUsersRequest,
  TeamList,
  ListTeamsRequest,
  User,
  CreateUserRequest,
  UpdateUserRequest,
  Team,
  CreateTeamRequest,
  UpdateTeamRequest,
} from './api-client/api';
import { Configuration } from './api-client/configuration';

// 建立一個 API client 的實例
const apiConfig = new Configuration({ basePath: 'http://localhost:8081' });
const usersApiClient = new UsersApi(apiConfig);
const teamsApiClient = new TeamsApi(apiConfig);

/**
 * 組織管理相關的 API Slice
 */
export const organizationApiSlice = createApi({
  reducerPath: 'organizationApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
  tagTypes: ['User', 'Team'],
  endpoints: (builder) => ({
    // =================================================================
    // Users Endpoints
    // =================================================================
    listUsers: builder.query<UserList, ListUsersRequest>({
      async queryFn(arg) {
        try {
          const data = await usersApiClient.listUsers(arg);
          return { data };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
        }
      },
      providesTags: (result) => result ? [...result.items.map(({ id }) => ({ type: 'User' as const, id })), { type: 'User', id: 'LIST' }] : [{ type: 'User', id: 'LIST' }],
    }),
    deleteUser: builder.mutation<OperationResult, string>({
      async queryFn(id) {
        try {
          const data = await usersApiClient.deleteUser({ id });
          return { data };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
        }
      },
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),
    createUser: builder.mutation<User, CreateUserRequest>({
      async queryFn(arg) {
        try {
          const data = await usersApiClient.createUser(arg);
          return { data };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
        }
      },
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),
    updateUser: builder.mutation<User, { id: string, user: UpdateUserRequest['user'] }>({
      async queryFn({ id, user }) {
        try {
          const data = await usersApiClient.updateUser({ id, updateUserRequest: { user } });
          return { data };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
        }
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }, { type: 'User', id: 'LIST' }],
    }),
    batchDeleteUsers: builder.mutation<OperationResult, string[]>({
      async queryFn(ids) {
        try {
          const data = await usersApiClient.batchDeleteUsers({ batchDeleteUsersRequest: { ids } });
          return { data };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
        }
      },
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),

    // =================================================================
    // Teams Endpoints
    // =================================================================
    listTeams: builder.query<TeamList, ListTeamsRequest>({
      async queryFn(arg) {
        try {
          const data = await teamsApiClient.listTeams(arg);
          return { data };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
        }
      },
      providesTags: (result) => result ? [...result.items.map(({ id }) => ({ type: 'Team' as const, id })), { type: 'Team', id: 'LIST' }] : [{ type: 'Team', id: 'LIST' }],
    }),
    deleteTeam: builder.mutation<OperationResult, string>({
      async queryFn(id) {
        try {
          const data = await teamsApiClient.deleteTeam({ id });
          return { data };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
        }
      },
      invalidatesTags: [{ type: 'Team', id: 'LIST' }],
    }),
    createTeam: builder.mutation<Team, CreateTeamRequest>({
      async queryFn(arg) {
        try {
          const data = await teamsApiClient.createTeam(arg);
          return { data };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
        }
      },
      invalidatesTags: [{ type: 'Team', id: 'LIST' }],
    }),
    updateTeam: builder.mutation<Team, { id: string, team: UpdateTeamRequest['team'] }>({
      async queryFn({ id, team }) {
        try {
          const data = await teamsApiClient.updateTeam({ id, updateTeamRequest: { team } });
          return { data };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
        }
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'Team', id }, { type: 'Team', id: 'LIST' }],
    }),
  }),
});

// 導出 RTK Query 自動生成的 hooks
export const {
  useListUsersQuery,
  useDeleteUserMutation,
  useCreateUserMutation,
  useUpdateUserMutation,
  useBatchDeleteUsersMutation,
  useListTeamsQuery,
  useDeleteTeamMutation,
  useCreateTeamMutation,
  useUpdateTeamMutation,
} = organizationApiSlice;
