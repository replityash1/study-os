import type { Asset } from '../types';

export class DriveNotConnectedError extends Error {
  constructor() {
    super('Connect Google Drive to upload assets.');
    this.name = 'DriveNotConnectedError';
  }
}

export async function listDriveAssets(topicId: string): Promise<Asset[]> {
  void topicId;
  throw new Error('not implemented');
}
export async function uploadDriveAsset(topicId: string, file: File): Promise<Asset> {
  void topicId;
  void file;
  throw new DriveNotConnectedError();
}
