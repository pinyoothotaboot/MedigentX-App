
/**
 * ProcessContext to handle streaming updates and progress notifications.
 */
export class ProcessContext {
    private streamHandler: ((message: string) => void) | null;
  
    constructor(streamHandler: ((message: string) => void) | null = null) {
      this.streamHandler = streamHandler;
    }
  
    public update(message: string): void {
      if (!this.streamHandler) {
        return;
      }
      this.streamHandler(message);
    }
  }
