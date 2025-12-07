import { useState } from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import 'dayjs/locale/zh-cn';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import SamplingPage from './pages/QC/SamplingPage';
import QCDetail from './pages/QC/QCDetail';
import StaffConfirmation from './pages/QC/StaffConfirmation';
import DisputeResolution from './pages/QC/DisputeResolution';
import TeamManagement from './pages/System/TeamManagement';
import DevPlanPage from './pages/DevelopmentPlan/DevPlanPage';
import LeaderLogPage from './pages/LeaderLog/LeaderLogPage';

// ... (previous imports)

import { useAppStore } from './store/useAppStore';

function App() {
  const { currentView, setView } = useAppStore();

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'qc':
      case 'my-qc-action':
        return <SamplingPage />;
      case 'qc-detail':
        return <QCDetail />;
      // case 'staff-confirm': // Merged into QC Module/Inbox logic
      //   return <StaffConfirmation />;
      // case 'dispute':
      //   return <DisputeResolution />;
      case 'team':
      case 'team-structure':
        return <TeamManagement initialTab="structure" />;
      case 'access-mgmt':
        return <TeamManagement initialTab="access" />;
      case 'sampling-rules':
        return <TeamManagement initialTab="rules" />;
      case 'dev-plan':
        return <DevPlanPage />;
      case 'leader-log':
        return <LeaderLogPage />;
      default:
        return <Dashboard />;
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
