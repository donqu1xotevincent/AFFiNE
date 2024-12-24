import type { DropType } from '@blocksuite/affine-shared/services';
import type { Rect } from '@blocksuite/global/utils';

export const DRAG_HANDLE_CONTAINER_HEIGHT = 24;
export const DRAG_HANDLE_CONTAINER_WIDTH = 16;
export const DRAG_HANDLE_CONTAINER_WIDTH_TOP_LEVEL = 8;
export const DRAG_HANDLE_CONTAINER_OFFSET_LEFT = 2;
export const DRAG_HANDLE_CONTAINER_OFFSET_LEFT_LIST = 18;
export const DRAG_HANDLE_CONTAINER_OFFSET_LEFT_TOP_LEVEL = 5;
export const DRAG_HANDLE_CONTAINER_PADDING = 8;

export const DRAG_HANDLE_GRABBER_HEIGHT = 12;
export const DRAG_HANDLE_GRABBER_WIDTH = 4;
export const DRAG_HANDLE_GRABBER_WIDTH_HOVERED = 2;
export const DRAG_HANDLE_GRABBER_BORDER_RADIUS = 4;
export const DRAG_HANDLE_GRABBER_MARGIN = 4;

export const HOVER_AREA_RECT_PADDING_TOP_LEVEL = 6;

export const NOTE_CONTAINER_PADDING = 24;
export const EDGELESS_NOTE_EXTRA_PADDING = 20;
export const DRAG_HOVER_RECT_PADDING = 4;

export type DropResult = {
  rect: Rect | null;
  dropBlockId: string;
  dropType: DropType;
};
