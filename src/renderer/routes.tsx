import React from 'react';
import Home from './pages/Home';
import Settings from './pages/Settings';

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
    path: '/settings',
    element: <Settings />,
  },
];

// 获取路由配置的辅助函数
export const getRouteConfig = (path: string): RouteConfig | undefined => {
  return routes.find(route => route.path === path);
};
