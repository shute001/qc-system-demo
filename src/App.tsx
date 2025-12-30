import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import 'dayjs/locale/zh-cn';
import MainLayout from './layouts/MainLayout';
import Workspace from './pages/Workspace';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import SamplingPage from './pages/QC/SamplingPage';
import QCDetail from './pages/QC/QCDetail';
import TeamManagement from './pages/System/TeamManagement';
import DevPlanPage from './pages/DevelopmentPlan/DevPlanPage';
import LeaderLogPage from './pages/LeaderLog/LeaderLogPage';

// ... (previous imports)

import { useAppStore } from './store/useAppStore';

function App() {
  const { currentView, setView } = useAppStore();

  const renderContent = () => {
    switch (currentView) {
      case 'workspace':
        return <Workspace />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'dashboard':
        return <Workspace />;
      case 'qc':
      case 'qc-sampling':
        return <SamplingPage initialTab="sampling" />;
      case 'qc-inbox':
        return <SamplingPage initialTab="inbox" />;
      case 'qc-drafts':
        return <SamplingPage initialTab="drafts" />;
      case 'qc-outbox':
        return <SamplingPage initialTab="outbox" />;
      case 'qc-dispute':
        return <SamplingPage initialTab="dispute" />;
      case 'qc-history':
        return <SamplingPage initialTab="history" />;

      case 'my-qc-action':
        return <SamplingPage initialTab="my-tasks" />;
      case 'qc-detail':
        return <QCDetail />;
      // case 'staff-confirm': // Merged into QC Module/Inbox logic
      //   return <StaffConfirmation />;
      // case 'dispute':
      //   return <DisputeResolution />;
      case 'team':
      case 'team-structure':
        return <TeamManagement initialTab="users" />;
      case 'role-mgmt':
        return <TeamManagement initialTab="roles" />;
      case 'access-mgmt':
        return <TeamManagement initialTab="process" />;
      case 'audit-log':
        return <TeamManagement initialTab="audit" />;
      case 'sampling-rules':
        return <TeamManagement initialTab="rules" />;
      case 'dev-plan':
        return <DevPlanPage />;
      case 'leader-log':
        return <LeaderLogPage />;
      default:
        return <Workspace />;
    }
  };

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#009140',
          borderRadius: 6,
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
        components: {
          Layout: {
            siderBg: '#001529',
          }
        }
      }}
    >
      <MainLayout currentView={currentView} onNavigate={setView}>
        {renderContent()}
      </MainLayout>
    </ConfigProvider>
  )
}

export default App
