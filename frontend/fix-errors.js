import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 需要修復的頁面文件
const pageFiles = [
  'src/pages/AuditLogsPage.tsx',
  'src/pages/AuthSettingsPage.tsx',
  'src/pages/EmailSettingsPage.tsx',
  'src/pages/ExecutionLogsPage.tsx',
  'src/pages/LayoutSettingsPage.tsx',
  'src/pages/NotificationChannelsPage.tsx',
  'src/pages/NotificationHistoryPage.tsx',
  'src/pages/NotificationStrategiesPage.tsx',
  'src/pages/ScheduleManagementPage.tsx',
  'src/pages/ScriptLibraryPage.tsx',
  'src/pages/TagManagementPage.tsx'
];

// 修復每個文件
pageFiles.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    console.log(`修復 ${filePath}...`);

    let content = fs.readFileSync(fullPath, 'utf8');

    // 修復 tableActions 中的 icon 類型問題
    content = content.replace(
      /icon: <([^>]+) \/>/g,
      'icon: $1'
    );

    // 修復未使用的 import
    content = content.replace(
      /import \{[^}]*CopyOutlined[^}]*\} from '@ant-design\/icons'/g,
      (match) => match.replace(/CopyOutlined,?/, '').replace(/,,/, ',').replace(/,}/, '}')
    );

    content = content.replace(
      /import \{[^}]*CheckCircleOutlined[^}]*\} from '@ant-design\/icons'/g,
      (match) => match.replace(/CheckCircleOutlined,?/, '').replace(/,,/, ',').replace(/,}/, '}')
    );

    content = content.replace(
      /import \{[^}]*PlusOutlined[^}]*\} from '@ant-design\/icons'/g,
      (match) => match.replace(/PlusOutlined,?/, '').replace(/,,/, ',').replace(/,}/, '}')
    );

    content = content.replace(
      /import \{[^}]*StopOutlined[^}]*\} from '@ant-design\/icons'/g,
      (match) => match.replace(/StopOutlined,?/, '').replace(/,,/, ',').replace(/,}/, '}')
    );

    content = content.replace(
      /import \{[^}]*ClockCircleOutlined[^}]*\} from '@ant-design\/icons'/g,
      (match) => match.replace(/ClockCircleOutlined,?/, '').replace(/,,/, ',').replace(/,}/, '}')
    );

    content = content.replace(
      /import \{[^}]*LogoutOutlined[^}]*\} from '@ant-design\/icons'/g,
      (match) => match.replace(/LogoutOutlined,?/, '').replace(/,,/, ',').replace(/,}/, '}')
    );

    content = content.replace(
      /import \{[^}]*DatabaseOutlined[^}]*\} from '@ant-design\/icons'/g,
      (match) => match.replace(/DatabaseOutlined,?/, '').replace(/,,/, ',').replace(/,}/, '}')
    );

    content = content.replace(
      /import \{[^}]*DashboardOutlined[^}]*\} from '@ant-design\/icons'/g,
      (match) => match.replace(/DashboardOutlined,?/, '').replace(/,,/, ',').replace(/,}/, '}')
    );

    content = content.replace(
      /import \{[^}]*BarChartOutlined[^}]*\} from '@ant-design\/icons'/g,
      (match) => match.replace(/BarChartOutlined,?/, '').replace(/,,/, ',').replace(/,}/, '}')
    );

    content = content.replace(
      /import \{[^}]*AppstoreOutlined[^}]*\} from '@ant-design\/icons'/g,
      (match) => match.replace(/AppstoreOutlined,?/, '').replace(/,,/, ',').replace(/,}/, '}')
    );

    content = content.replace(
      /import \{[^}]*FileTextOutlined[^}]*\} from '@ant-design\/icons'/g,
      (match) => match.replace(/FileTextOutlined,?/, '').replace(/,,/, ',').replace(/,}/, '}')
    );

    content = content.replace(
      /import \{[^}]*PhoneOutlined[^}]*\} from '@ant-design\/icons'/g,
      (match) => match.replace(/PhoneOutlined,?/, '').replace(/,,/, ',').replace(/,}/, '}')
    );

    // 移除多餘的逗號
    content = content.replace(/,[\s]*}/g, ' }');
    content = content.replace(/,[\s]*\]/g, ' ]');

    fs.writeFileSync(fullPath, content, 'utf8');
  }
});

console.log('修復完成！');
