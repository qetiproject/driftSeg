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
  {
    path: ':id/members',
    loadComponent: () =>
      import('./pages/segment-members/segment-members').then((c) => c.SegmentMembers),
  },
  {
    path: ':id/deltas',
    loadComponent: () => import('./pages/segment-deltas/segment-deltas').then((c) => c.SegmentDeltas),
  },
];
