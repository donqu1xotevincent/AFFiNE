export { WorkspaceSharePreviewService } from './services/share-preview';

import { GraphQLService } from '@affine/core/modules/cloud';
import {
  type Framework,
  WorkspaceScope,
  WorkspaceService,
} from '@toeverything/infra';

import { WorkspaceSharePreview } from './entities/share-preview';
import { WorkspaceSharePreviewService } from './services/share-preview';
import { WorkspaceSharePreviewStore } from './stores/share-preview';

export function configureSharePreviewModule(framework: Framework) {
  framework
    .scope(WorkspaceScope)
    .service(WorkspaceSharePreviewService)
    .store(WorkspaceSharePreviewStore, [GraphQLService])
    .entity(WorkspaceSharePreview, [
      WorkspaceService,
      WorkspaceSharePreviewStore,
    ]);
}
