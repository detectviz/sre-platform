// --- UTILITIES ---
const random = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const randomString = (length) => Math.random().toString(36).substring(2, 2 + length);
const randomEmail = () => `${randomString(8)}@example.com`;
const randomFullName = () => `${random(['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer'])} ${random(['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'])}`;
const randomIp = () => `${randomNumber(1,254)}.${randomNumber(1,254)}.${randomNumber(1,254)}.${randomNumber(1,254)}`;
const randomPhrase = () => `${random(['Fix', 'Implement', 'Update', 'Refactor', 'Deploy'])} ${random(['the', 'a', 'an'])} ${random(['database', 'server', 'API', 'frontend', 'cache'])}`;


// --- CONSTANTS ---
const USER_COUNT = 20;
const TEAM_COUNT = 8;
const RESOURCE_COUNT = 75;
const EVENT_COUNT = 200;
const SCRIPT_COUNT = 15;
const SCHEDULE_COUNT = 10;
const EXECUTION_COUNT = 50;

// --- DATA DEFINITIONS ---

const ROLES = [
    { id: 'super_admin', name: '超級管理員', color: 'red' },
    { id: 'team_manager', name: '團隊管理員', color: 'orange' },
    { id: 'team_member', name: '團隊成員', color: 'blue' },
    { id: 'viewer', name: '唯讀人員', color: 'gray' }
];

const TAG_DEFINITIONS = [
    { id: 'tag_cat_1', name: 'environment', displayName: '環境', category: 'infrastructure', required: true, values: [
        { id: 'val_1', value: 'production', displayName: '生產環境', color: '#f5222d', usageCount: randomNumber(20,50) },
        { id: 'val_2', value: 'staging', displayName: '預發環境', color: '#fa8c16', usageCount: randomNumber(10,30) },
        { id: 'val_3', value: 'development', displayName: '開發環境', color: '#52c41a', usageCount: randomNumber(5,20) },
    ]},
    { id: 'tag_cat_2', name: 'team', displayName: '負責團隊', category: 'organization', required: false, values: [
        { id: 'val_4', value: 'frontend', displayName: '前端團隊', color: '#722ed1', usageCount: randomNumber(5,15)},
        { id: 'val_5', value: 'backend', displayName: '後端團隊', color: '#52c41a', usageCount: randomNumber(5,15)},
        { id: 'val_6', value: 'devops', displayName: 'DevOps 團隊', color: '#1890ff', usageCount: randomNumber(5,15)},
    ]},
    { id: 'tag_cat_3', name: 'os', displayName: '作業系統', category: 'infrastructure', required: false, values: []},
    { id: 'tag_cat_4', name: 'data-center', displayName: '數據中心', category: 'infrastructure', required: false, values: []},
];

// --- GENERATION LOGIC ---

// Users
const users = Array.from({ length: USER_COUNT }, (_, i) => ({
    key: `user_${i + 1}`,
    id: `user_${i + 1}`,
    name: randomFullName(),
    email: randomEmail(),
    status: random(['active', 'inactive', 'pending']),
    last_login: randomDate(new Date(2025, 0, 1), new Date()).toISOString(),
    created_at: randomDate(new Date(2024, 0, 1), new Date(2025, 0, 1)).toISOString(),
}));

// Teams
const teams = Array.from({ length: TEAM_COUNT }, (_, i) => ({
    key: `team_${i + 1}`,
    id: `team_${i + 1}`,
    name: `${random(['Data', 'Web', 'Mobile', 'Core', 'Infra'])} Team`,
    description: randomPhrase(),
    members: Array.from({length: randomNumber(1, 5)}, () => random(users).id),
    owner: random(users).id,
    created_at: randomDate(new Date(2024, 0, 1), new Date(2025, 0, 1)).toISOString(),
}));
users.forEach(user => {
    user.teams = teams.filter(t => t.members.includes(user.id)).map(t => t.id);
    user.roles = Array.from({length: randomNumber(1,2)}, () => random(ROLES).id);
});


// Resources
const resources = Array.from({ length: RESOURCE_COUNT }, (_, i) => {
    const type = random(['server', 'database', 'gateway', 'cache', 'container']);
    const status = random(['healthy', 'warning', 'critical']);
    return {
        id: `res_${i + 1}`,
        key: `res_${i + 1}`,
        name: `${type}-${randomString(5)}-${i + 1}`,
        type,
        status,
        ip_address: randomIp(),
        location: random(['us-east-1', 'us-west-2', 'eu-central-1', 'ap-northeast-1']),
        groups: [`g_${randomNumber(1, 5)}`],
        tags: {
            environment: random(TAG_DEFINITIONS.find(t=>t.name==='environment').values).value,
            team: random(TAG_DEFINITIONS.find(t=>t.name==='team').values).value,
            os: random(['ubuntu-22.04', 'debian-11', 'centos-9']),
            'data-center': random(['dc-01', 'dc-02'])
        },
        cpu_usage: randomNumber(10, 98),
        memory_usage: randomNumber(20, 95),
        disk_usage: randomNumber(5, 99),
        alarms: status !== 'healthy' && Math.random() > 0.3 ? [{ severity: status, summary: `${type} ${status} alert` }] : [],
        created_at: randomDate(new Date(2023, 0, 1), new Date()).toISOString(),
        last_check: randomDate(new Date(2025, 8, 1), new Date()).toISOString(),
    };
});

// Groups
const groups = Array.from({ length: 5 }, (_, i) => ({
    id: `g_${i + 1}`,
    key: `g_${i + 1}`,
    name: `Resource Group ${i + 1}`,
    description: `Description for group ${i + 1}`,
    members: resources.filter(r => r.groups.includes(`g_${i + 1}`)).map(r => r.id),
    responsibleTeam: `team_${randomNumber(1, TEAM_COUNT)}`
}));

// Events
const events = Array.from({ length: EVENT_COUNT }, (_, i) => {
    const resource = random(resources);
    return {
        id: `evt_${i + 1}`,
        key: `evt_${i + 1}`,
        summary: `${random(['CPU high', 'Memory low', 'Disk space full', 'API latency high', '5xx error rate'])} on ${resource.name}`,
        severity: random(['critical', 'warning', 'info']),
        source: random(['Prometheus', 'Grafana', 'Datadog', 'Kubernetes']),
        status: random(['new', 'acknowledged', 'resolved', 'silenced']),
        created_at: randomDate(new Date(2025, 8, 1), new Date()).toISOString(),
        assignee: random([null, ...users.map(u => u.id)]),
        resource_name: resource.name,
        service: 'SRE Platform Service',
        business_impact: random(['高', '中', '低']),
        storm_group: random([null, 'storm_1', 'storm_2']),
        rule_id: `rule_${randomNumber(1, 5)}`,
    };
});

// Scripts
const scripts = Array.from({ length: SCRIPT_COUNT }, (_, i) => ({
    id: `s_${i + 1}`,
    key: `s_${i + 1}`,
    name: `Script ${randomPhrase()}`,
    type: random(['Python', 'Bash']),
    description: randomPhrase(),
    creator: random(users).name,
    code: `echo "Executing script ${i+1}"`,
    params: Math.random() > 0.5 ? [{ name: 'param1', type: 'string', label: 'Parameter 1' }] : [],
    status: 'active',
    category: random(['deployment', 'maintenance', 'monitoring', 'performance']),
    executionCount: randomNumber(5, 200),
    last_executed: randomDate(new Date(2025, 8, 1), new Date()).toISOString(),
}));

// Schedules
const schedules = Array.from({ length: SCHEDULE_COUNT }, (_, i) => ({
    key: `sch_${i + 1}`,
    name: `Scheduled Task: ${randomPhrase()}`,
    cron: `0 ${randomNumber(0, 23)} * * *`,
    script_id: random(scripts).id,
    last_run: randomDate(new Date(2025, 8, 1), new Date()).toISOString(),
    last_status: random(['success', 'failed']),
    enabled: random([true, false]),
    creator: random(users).name,
}));

// Executions
const executions = Array.from({ length: EXECUTION_COUNT }, (_, i) => {
    const script = random(scripts);
    return {
        key: `e_${i + 1}`,
        script_id: script.id,
        script_name: script.name,
        trigger: random([
            { type: 'Manual', user: random(users).name },
            { type: 'Schedule', id: random(schedules).key },
            { type: 'Event', event_id: random(events).id, event_summary: random(events).summary }
        ]),
        status: random(['success', 'failed']),
        start_time: randomDate(new Date(2025, 8, 1), new Date()).toISOString(),
        duration: `${randomNumber(1, 30)}.${randomNumber(0, 9)}s`
    };
});


// Final DB object
const db = {
    users,
    teams,
    roles: ROLES,
    resources,
    groups,
    events,
    scripts,
    schedules,
    executions,
    tags: TAG_DEFINITIONS,
    // empty for now
    alert_rules: [],
    silences: [],
    notifications: [],
    notification_channels: [],
    notification_strategies: []
};

console.log(JSON.stringify(db, null, 2));
