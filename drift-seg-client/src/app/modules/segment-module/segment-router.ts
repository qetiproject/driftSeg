import { Routes } from '@angular/router';

export const segmentRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/segments/segments').then((c) => c.Segments),
    children: [
      {
        path: 'add',
        outlet: 'modal',
        loadComponent: () => import('./components').then((c) => c.AddSegmentModal),
      },
    ],
  },
];
