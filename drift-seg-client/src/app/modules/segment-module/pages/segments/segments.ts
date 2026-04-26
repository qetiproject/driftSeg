import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SegmentList } from '../../components/segment-list/segment-list';
import { SegmentPageHeader } from '../../components/segment-page-header/segment-page-header';

@Component({
  selector: 'app-segments',
  standalone: true,
  imports: [SegmentPageHeader, SegmentList, RouterOutlet],
  templateUrl: './segments.html',
})
export class Segments {}
