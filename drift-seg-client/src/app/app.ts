import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MessagesComponent } from './components/messages/messages';
import { LoadingComponent } from './features/loading/loading.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MessagesComponent, LoadingComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('drift-seg-client');
}
