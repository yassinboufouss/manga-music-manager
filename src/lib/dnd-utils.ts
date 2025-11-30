import { arrayMove } from '@dnd-kit/sortable';

/**
 * Reorders an array based on the indices of the dragged item and the target item.
 * @param array The array to reorder.
 * @param activeId The ID of the item being dragged.
 * @param overId The ID of the item being dropped over.
 * @param getId A function to extract the unique ID from an array item.
 * @returns The reordered array.
 */
export function reorderArray<T>(
  array: T[],
  activeId: string,
  overId: string,
  getId: (item: T) => string
): T[] {
  const oldIndex = array.findIndex(item => getId(item) === activeId);
  const newIndex = array.findIndex(item => getId(item) === overId);

  if (oldIndex === -1 || newIndex === -1) {
    return array;
  }

  return arrayMove(array, oldIndex, newIndex);
}