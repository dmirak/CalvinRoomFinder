import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private _storage: Storage | null = null;
  private storageSubject = new BehaviorSubject<any>('');

  // eslint-disable-next-line @typescript-eslint/member-ordering
  storage$ = this.storageSubject.asObservable();

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
  }

  public set(key: string, value: any) {
    this._storage?.set(key, value);
    this.storageSubject.next(key);
  }

  public get(key: string) {
    return this._storage?.get(key);
  }
}
