import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent, MessagesComponent } from './components';
import { LoadingComponent } from './features/loading/loading.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MessagesComponent, LoadingComponent, HeaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('drift-seg-client');
}
