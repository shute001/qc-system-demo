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

function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'qc':
        return <SamplingPage />;
      case 'qc-detail':
        return <QCDetail />;
      case 'staff-confirm':
        return <StaffConfirmation />;
      case 'dispute':
        return <DisputeResolution />;
      case 'team':
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-700 mb-4">Team Management</h2>
            <p className="text-gray-500">This module is under development.</p>
          </div>
        );
      case 'dev-plan':
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-700 mb-4">Development Plan</h2>
            <p className="text-gray-500">This module is under development.</p>
          </div>
        );
      case 'leader-log':
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-700 mb-4">Leader Log</h2>
            <p className="text-gray-500">This module is under development.</p>
          </div>
        );
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
            siderBg: '#001529', // Revert to standard dark
          }
        }
      }}
    >
      <MainLayout currentView={currentView} onNavigate={setCurrentView}>
        {renderContent()}
      </MainLayout>
    </ConfigProvider>
  )
}

export default App
