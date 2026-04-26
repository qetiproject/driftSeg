import { Injectable, signal } from '@angular/core';
import { Message } from '@types';

@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  #messagesSignal = signal<Message | null>(null);
  #timeoutId: ReturnType<typeof setTimeout> | null = null;

  readonly message = this.#messagesSignal.asReadonly();

  showMessage(message: Message): void {
    const duration = message.duration ?? 3000;
    if (this.#timeoutId) clearTimeout(this.#timeoutId);
    this.#messagesSignal.set({
      text: message.text,
      severity: message.severity,
      position: message.position,
    });

    this.#timeoutId = setTimeout(() => {
      this.clear();
      this.#timeoutId = null;
    }, duration);
  }

  clear(): void {
    if (this.#timeoutId) {
      clearTimeout(this.#timeoutId);
      this.#timeoutId = null;
    }
    this.#messagesSignal.set(null);
  }
}
