import React from 'react';
import Home from './pages/Home';
import Settings from './pages/Settings';
import Chat from './pages/Chat';

export interface RouteConfig {
  path: string;
  element: React.ReactNode;
}

export const routes: RouteConfig[] = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/chat',
    element: <Chat />,
  },
  {
    path: '/settings',
    element: <Settings />,
  },
];

// 获取路由配置的辅助函数
export const getRouteConfig = (path: string): RouteConfig | undefined => {
  return routes.find(route => route.path === path);
};
