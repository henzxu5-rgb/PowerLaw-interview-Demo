import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  AlertTriangle,
  CheckSquare,
  BarChart3,
  Lightbulb,
  Menu,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import Contracts from '@/pages/Contracts';
import { Risks } from '@/pages/Risks';
import { Tasks } from '@/pages/Tasks';
import { Reports } from '@/pages/Reports';
import { Dashboard } from '@/pages/Dashboard';
import { Thinking } from '@/pages/Thinking';
import type { Page } from '@/types';

const menuItems = [
  { id: 'dashboard' as Page, label: '首页概览', icon: LayoutDashboard },
  { id: 'contracts' as Page, label: '合同履约跟踪', icon: FileText },
  { id: 'risks' as Page, label: '风险识别', icon: AlertTriangle },
  { id: 'tasks' as Page, label: '任务管理', icon: CheckSquare },
  { id: 'reports' as Page, label: '统计分析', icon: BarChart3 },
  { id: 'thinking' as Page, label: 'Demo思路', icon: Lightbulb },
];

function App() {
  const [activeMenu, setActiveMenu] = useState<Page>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <Dashboard onPageChange={setActiveMenu} />;
      case 'contracts':
        return <Contracts />;
      case 'risks':
        return <Risks />;
      case 'tasks':
        return <Tasks />;
      case 'reports':
        return <Reports />;
      case 'thinking':
        return <Thinking />;
      default:
        return <Dashboard onPageChange={setActiveMenu} />;
    }
  };

  return (
    <div className="min-h-screen bg-muted flex">
      <aside
        className={`bg-card border-r border-border transition-all duration-300 flex-shrink-0 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="h-16 border-b border-border flex items-center justify-between px-3">
          {!sidebarCollapsed && (
            <>
              <img
                src="/logo.png"
                alt="MeFlow"
                className="h-8 object-contain object-left"
                style={{ maxWidth: '116px' }}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(true)}
                className="flex-shrink-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>

        {sidebarCollapsed && (
          <div className="flex justify-center py-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(false)}
            >
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        )}

        <nav className="p-2 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const btn = (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  activeMenu === item.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent'
                } ${sidebarCollapsed ? 'justify-center' : ''}`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </button>
            );

            if (sidebarCollapsed) {
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>{btn}</TooltipTrigger>
                  <TooltipContent side="right" sideOffset={8}>
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return btn;
          })}
        </nav>
      </aside>

      <main className="flex-1 overflow-auto p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMenu}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      <Toaster />
    </div>
  );
}

export default App;
