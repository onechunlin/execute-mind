import OpenAI from 'openai';
import { Tool } from '../types/tool';

// 定义消息类型
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// 定义聊天请求类型
export interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  stream?: boolean;
}

// 定义聊天响应类型
export interface ChatResponse {
  message: ChatMessage;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// 配置选项
export interface ChatServiceOptions {
  apiKey: string;
  baseURL?: string;
  model?: string;
  systemMessage?: string;
}

const TOOLS: Tool[] = [
  {
    type: 'web_search',
    name: '小红书',
    description:
      '小红书是一个生活方式平台，用户可以在上面分享和发现生活方式，包括时尚、美妆、家居、旅行、美食等。',
    parameters: {
      url: 'https://www.xiaohongshu.com',
    },
  },
  {
    type: 'web_search',
    name: '飞书文档',
    description: '飞书文档是一个文档协作平台，用户可以在上面创建、编辑和分享文档。',
    parameters: {
      url: 'https://www.feishu.cn',
    },
  },
];

// 默认配置
const DEFAULT_OPTIONS: Partial<ChatServiceOptions> = {
  baseURL: 'https://api.deepseek.com',
  model: 'deepseek-chat',
  systemMessage: `用户会描述他的需求，你需要拆解需求，并分步给出解决方案。
  你可以使用以下工具来帮助你完成任务：${TOOLS.map(tool => `${tool.name}: ${tool.description}`).join('\n')}.
  使用工具时，请按照以下格式：
\`\`\`tool_call
$tool_name
\`\`\``,
};

/**
 * 聊天服务类，用于与 DeepSeek API 交互
 */
export class ChatService {
  private client: OpenAI;
  private defaultModel: string;
  private systemMessage: string;

  constructor(options: ChatServiceOptions) {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

    this.client = new OpenAI({
      baseURL: mergedOptions.baseURL,
      apiKey: mergedOptions.apiKey,
      dangerouslyAllowBrowser: true,
    });

    this.defaultModel = mergedOptions.model || 'deepseek-chat';
    this.systemMessage = mergedOptions.systemMessage || '你是一个有帮助的助手。';
  }

  /**
   * 获取带有系统消息的完整消息列表
   * @param messages 用户消息列表
   * @returns 包含系统消息的完整消息列表
   */
  getMessagesWithSystem(messages: ChatMessage[]): ChatMessage[] {
    // 检查是否已经包含系统消息
    const hasSystemMessage = messages.some(msg => msg.role === 'system');

    if (hasSystemMessage) {
      return messages;
    }

    // 添加系统消息
    return [{ role: 'system', content: this.systemMessage }, ...messages];
  }

  /**
   * 使用流式响应发送聊天请求
   * @param request 聊天请求参数
   * @param onMessage 接收消息的回调函数
   * @param onComplete 完成时的回调函数
   * @param onError 错误处理回调函数
   */
  async sendStreamMessage(
    request: ChatRequest,
    onMessage: (content: string) => void,
    onComplete?: (response: ChatResponse) => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    try {
      // 确保使用流式输出
      const streamRequest = { ...request, stream: true };

      // 确保包含系统消息
      const messagesWithSystem = this.getMessagesWithSystem(streamRequest.messages);

      const stream = await this.client.chat.completions.create({
        messages: messagesWithSystem,
        model: streamRequest.model || this.defaultModel,
        temperature: streamRequest.temperature,
        stream: true,
      });

      let fullContent = '';

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        console.log('🚀 ~ ChatService ~ forawait ~ content:', content);
        if (content) {
          fullContent += content;
          onMessage(content);
        }
      }

      if (onComplete) {
        onComplete({
          message: {
            role: 'assistant',
            content: fullContent,
          },
        });
      }
    } catch (error) {
      console.error('流式聊天请求失败:', error);
      if (onError) {
        onError(error);
      } else {
        throw error;
      }
    }
  }
}
