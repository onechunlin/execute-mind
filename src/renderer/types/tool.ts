export interface Tool {
  type: 'web_search'; // 工具类型
  name: string; // 工具名称
  description: string; // 工具描述
  parameters: {
    url: string; // 搜索的URL
  };
}
