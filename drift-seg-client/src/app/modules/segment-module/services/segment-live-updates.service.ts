import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../../environment/environment';
import { SegmentDeltaLiveEvent } from '../types';

const SEGMENT_DELTA_EVENT = 'segment.ui.delta.changed';

@Injectable({ providedIn: 'root' })
export class SegmentLiveUpdatesService {
  readonly #socket: Socket = io(`${environment.segmentSocketUrl}/segments`, {
    transports: ['websocket'],
  });

  onDeltaChanged(): Observable<SegmentDeltaLiveEvent> {
    return new Observable<SegmentDeltaLiveEvent>((subscriber) => {
      const handler = (payload: SegmentDeltaLiveEvent) => subscriber.next(payload);
      this.#socket.on(SEGMENT_DELTA_EVENT, handler);
      return () => this.#socket.off(SEGMENT_DELTA_EVENT, handler);
    });
  }
}
