/**
 * The page `pageIndex` names if it exists, else the last page of `count` rows at `pageSize` a
 * page. With no rows there is still one, empty, page.
 */
export function existingPageIndex(pageIndex: number, pageSize: number, count: number) {
  const lastPageIndex = Math.max(Math.ceil(count / pageSize) - 1, 0);
  return Math.min(pageIndex, lastPageIndex);
}
