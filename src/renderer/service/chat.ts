import OpenAI from 'openai';

// 定义消息类型
export type ChatMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;

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

// 定义工具调用检测结果接口
interface ToolCallDetectionResult {
  assistantMessage: OpenAI.Chat.Completions.ChatCompletionMessage;
  toolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[] | undefined;
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

const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'get_weather',
      description: '获取指定位置的当前天气信息',
      parameters: {
        type: 'object',
        properties: {
          location: { type: 'string' },
          unit: { type: 'string', enum: ['celsius', 'fahrenheit'] },
        },
        required: ['location'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'calculator',
      description: '执行数学计算',
      parameters: {
        type: 'object',
        properties: {
          expression: { type: 'string' },
        },
        required: ['expression'],
      },
    },
  },
];

// 默认配置
const DEFAULT_OPTIONS: Partial<ChatServiceOptions> = {
  baseURL: 'https://api.deepseek.com',
  model: 'deepseek-chat',
  systemMessage: '用户会描述他的需求，你需要拆解需求，并分步给出解决方案。',
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
   * 检测是否需要工具调用
   * @param messages 消息列表
   * @param model 模型名称
   * @param temperature 温度参数
   * @returns 包含助手消息和工具调用的结果
   */
  async detectToolCalls(
    messages: ChatMessage[],
    model?: string,
    temperature?: number
  ): Promise<ToolCallDetectionResult> {
    // 进行非流式请求来检测是否需要工具调用
    const response = await this.client.chat.completions.create({
      messages: messages,
      model: model || this.defaultModel,
      temperature: temperature,
      tools: tools,
      tool_choice: 'auto',
      stream: false,
    });

    const assistantMessage = response.choices[0].message;
    const toolCalls = assistantMessage.tool_calls;

    return {
      assistantMessage,
      toolCalls,
      usage: response.usage,
    };
  }

  /**
   * 执行工具调用
   * @param toolCall 工具调用信息
   * @returns 工具调用结果
   */
  async executeToolCall(toolCall: {
    id: string;
    type: string;
    function: { name: string; arguments: string };
  }) {
    try {
      const args = JSON.parse(toolCall.function.arguments);

      switch (toolCall.function.name) {
        case 'get_weather': {
          const { location, unit = 'celsius' } = args;
          console.log(`获取${location}的天气信息，单位：${unit}`);
          return {
            location,
            temperature: 22,
            unit,
            condition: '晴朗',
            humidity: '65%',
          };
        }
        case 'calculator': {
          const { expression } = args;
          try {
            // 注意：eval有安全风险，实际项目中应使用更安全的方式
            const result = eval(expression);
            return { expression, result };
          } catch (error) {
            return { expression, error: '计算表达式错误' };
          }
        }
        default:
          return { error: `未知工具: ${toolCall.function.name}` };
      }
    } catch (error) {
      console.error(`执行工具调用失败:`, error);
      return { error: `执行失败: ${error.message}` };
    }
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
      // 确保包含系统消息
      const messagesWithSystem = this.getMessagesWithSystem(request.messages);

      // 检测是否需要工具调用
      const { assistantMessage, toolCalls, usage } = await this.detectToolCalls(
        messagesWithSystem,
        request.model,
        request.temperature
      );

      // 如果有工具调用，处理工具调用
      if (toolCalls && toolCalls.length > 0) {
        // 先添加助手的消息（包含工具调用）到消息列表
        messagesWithSystem.push(assistantMessage);

        // 对每个工具调用进行处理并添加工具响应
        for (const toolCall of toolCalls) {
          const toolResult = await this.executeToolCall(toolCall);

          // 添加工具响应消息
          messagesWithSystem.push({
            role: 'tool',
            content: JSON.stringify(toolResult),
            tool_call_id: toolCall.id,
          });
        }

        // 继续对话，获取最终回复
        const stream = await this.client.chat.completions.create({
          messages: messagesWithSystem,
          model: request.model || this.defaultModel,
          temperature: request.temperature,
          stream: true,
        });

        let fullContent = '';

        for await (const chunk of stream) {
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
      } else {
        // 如果没有工具调用，则直接使用初始响应内容
        const content = assistantMessage.content || '';
        if (content) {
          onMessage(content);
        }

        if (onComplete) {
          onComplete({
            message: assistantMessage,
            usage: usage,
          });
        }
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
