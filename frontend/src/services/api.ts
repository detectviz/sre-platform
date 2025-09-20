import db from '../mocks/db.json';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

const mockApi = {
  getIncidents: () => Promise.resolve(db.incidents),
  getResources: () => Promise.resolve(db.resources),
  getResourceGroups: () => Promise.resolve(db.resource_groups),
  getAutomationScripts: () => Promise.resolve(db.automation_scripts),
  getSchedules: () => Promise.resolve(db.schedules),
  getExecutions: () => Promise.resolve(db.executions),
  getUsers: () => Promise.resolve(db.users),
  getTeams: () => Promise.resolve(db.teams),
  getRoles: () => Promise.resolve(db.roles),
  getNotifications: () => Promise.resolve(db.notification_history),
  getNotificationPolicies: () => Promise.resolve(db.notification_policies),
  getNotificationChannels: () => Promise.resolve(db.notification_channels),
  inviteUser: (email: string) => {
    console.log(`Mock inviting user: ${email}`);
    return Promise.resolve({ success: true });
  },
  updateUser: (userId: string, data: any) => {
    console.log(`Mock updating user ${userId} with data:`, data);
    return Promise.resolve({ success: true });
  },
  deleteUser: (userId: string) => {
    console.log(`Mock deleting user ${userId}`);
    return Promise.resolve({ success: true });
  },
  createTeam: (data: any) => {
    console.log('Mock creating team with data:', data);
    const newTeam = { id: `team_${Date.now()}`, ...data, member_count: 0 };
    // @ts-ignore
    db.teams.push(newTeam);
    return Promise.resolve(newTeam);
  },
   updateTeam: (teamId: string, data: any) => {
    console.log(`Mock updating team ${teamId} with data:`, data);
    return Promise.resolve({ success: true });
  },
  getPermissions: () => Promise.resolve(db.permissions),
  createRole: (data: any) => {
    console.log('Mock creating role with data:', data);
    const newRole = { id: `role_${Date.now()}`, ...data, is_built_in: false };
    // @ts-ignore
    db.roles.push(newRole);
    return Promise.resolve(newRole);
  },
  updateRole: (roleId: string, data: any) => {
    console.log(`Mock updating role ${roleId} with data:`, data);
    return Promise.resolve({ success: true });
  },
  getAuditLogs: () => Promise.resolve(db.audit_logs),
};

const realApi = {
  getIncidents: () => fetch('/api/v1/incidents').then(res => res.json()),
  getResources: () => fetch('/api/v1/resources').then(res => res.json()),
  getResourceGroups: () => fetch('/api/v1/resource_groups').then(res => res.json()),
  getAutomationScripts: () => fetch('/api/v1/automation_scripts').then(res => res.json()),
  getSchedules: () => fetch('/api/v1/schedules').then(res => res.json()),
  getExecutions: () => fetch('/api/v1/executions').then(res => res.json()),
  getUsers: () => fetch('/api/v1/users').then(res => res.json()),
  getTeams: () => fetch('/api/v1/teams').then(res => res.json()),
  getRoles: () => fetch('/api/v1/roles').then(res => res.json()),
  getNotifications: () => fetch('/api/v1/notification-history').then(res => res.json()),
  getNotificationPolicies: () => fetch('/api/v1/notification-policies').then(res => res.json()),
  getNotificationChannels: () => fetch('/api/v1/notification-channels').then(res => res.json()),
  // Add real API calls for user/team management later
};

const api = USE_MOCK_DATA ? mockApi : realApi;

export default api;
