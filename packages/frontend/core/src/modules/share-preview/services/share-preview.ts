import { Service } from '@toeverything/infra';

import { WorkspaceSharePreview } from '../entities/share-preview';

export class WorkspaceSharePreviewService extends Service {
  sharePreview = this.framework.createEntity(WorkspaceSharePreview);
}
