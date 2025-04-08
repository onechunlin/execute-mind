import OpenAI from 'openai';

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
}

// 默认配置
const DEFAULT_OPTIONS: Partial<ChatServiceOptions> = {
  baseURL: 'https://api.deepseek.com',
  model: 'deepseek-chat',
};

/**
 * 聊天服务类，用于与 DeepSeek API 交互
 */
export class ChatService {
  private client: OpenAI;
  private defaultModel: string;

  constructor(options: ChatServiceOptions) {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

    this.client = new OpenAI({
      baseURL: mergedOptions.baseURL,
      apiKey: mergedOptions.apiKey,
      dangerouslyAllowBrowser: true,
    });

    this.defaultModel = mergedOptions.model || 'deepseek-chat';
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

      const stream = await this.client.chat.completions.create({
        messages: streamRequest.messages,
        model: streamRequest.model || this.defaultModel,
        temperature: streamRequest.temperature,
        stream: true,
      });

      let fullContent = '';

      for await (const chunk of stream) {
        console.log('🚀 ~ ChatService ~ forawait ~ chunk:', chunk);
        const content = chunk.choices[0]?.delta?.content || '';
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
