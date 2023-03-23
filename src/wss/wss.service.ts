import { Injectable, Logger } from '@nestjs/common';
import { RawData, WebSocket } from 'ws';

@Injectable()
export class WssService {
  public readonly webSocket: WebSocket;
  private readonly logger = new Logger(WssService.name);

  constructor() {
    this.webSocket = new WebSocket(`wss://api.avax.network/ext/bc/C/ws`)
      .on('open', () => {
        this.subscribeToNewHeads();
      })
      .on('error', (error) => {
        this.logger.error('Error: ', error);
      })
      .on('close', (code, reason) => {
        this.logger.error('Close: ', code, reason);
      });
  }

  /**
   * Subscribes to the 'newHeads' event to receive information about new blocks.
   */
  private subscribeToNewHeads() {
    const payload = {
      id: 1,
      jsonrpc: '2.0',
      method: 'eth_subscribe',
      params: ['newHeads'],
    };

    this.webSocket.send(JSON.stringify(payload));
  }

  /**
   * Returns the active WebSocket instance for the Alchemy API.
   * @returns The active WebSocket instance.
   */
  public getWebSocket(): WebSocket {
    return this.webSocket;
  }

  async getBlockFromData(data: RawData): Promise<WssBlock> {
    const message = JSON.parse(data.toString());

    if (message.method === 'eth_subscription') {
      return message.params.result;
    }
  }
}
