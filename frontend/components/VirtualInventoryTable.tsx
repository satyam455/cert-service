"use client";

import Link from "next/link";
import { memo, useCallback, useMemo, useState } from "react";
import {
  filterAndSortInventory,
  type InventoryItem,
  type InventoryQuery,
  type InventoryStatus,
  type SortDirection,
  type SortKey,
} from "@/lib/inventory";
import { StatusBadge } from "./StatusBadge";

const ROW_H = 54;
const overscan = 8;

export const VirtualInventoryTable = memo(function VirtualInventoryTable({
  items,
  initialQuery,
}: {
  items: InventoryItem[];
  initialQuery: InventoryQuery;
}) {
  const [q, setQ] = useState(initialQuery.q);
  const [status, setStatus] = useState<"All" | InventoryStatus>(initialQuery.status);
  const [sort, setSort] = useState<SortKey>(initialQuery.sort);
  const [direction, setDirection] = useState<SortDirection>(initialQuery.direction);
  const [scrollTop, setScrollTop] = useState(0);

  const sortedItems = useMemo(
    () => filterAndSortInventory(items, { q, status, sort, direction }),
    [direction, items, q, sort, status],
  );

  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_H) - overscan);
  const visibleCount = Math.ceil(540 / ROW_H) + overscan * 2;
  const visibleItems = useMemo(
    () => sortedItems.slice(startIndex, startIndex + visibleCount),
    [sortedItems, startIndex, visibleCount],
  );
  const topPadding = startIndex * ROW_H;
  const bottomPadding = Math.max(0, (sortedItems.length - startIndex - visibleItems.length) * ROW_H);

  const onScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return (
    <>
      <div className="filters">
        <div className="field">
          <label htmlFor="q">Search</label>
          <input id="q" value={q} onChange={(event) => setQ(event.target.value)} placeholder="ID, name, or type" />
        </div>
        <div className="field">
          <label htmlFor="status">Status</label>
          <select id="status" value={status} onChange={(event) => setStatus(event.target.value as "All" | InventoryStatus)}>
            <option>All</option>
            <option>Active</option>
            <option>Expiring</option>
            <option>Revoked</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="sort">Sort</label>
          <select id="sort" value={sort} onChange={(event) => setSort(event.target.value as SortKey)}>
            <option value="updated">Last Updated</option>
            <option value="id">ID</option>
            <option value="name">Name</option>
            <option value="type">Type</option>
            <option value="status">Status</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="direction">Direction</label>
          <select id="direction" value={direction} onChange={(event) => setDirection(event.target.value as SortDirection)}>
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      <p className="muted" aria-live="polite">
        {sortedItems.length.toLocaleString()} matching inventory records
      </p>

      <div className="table-wrap virtual-table" onScroll={onScroll} tabIndex={0} aria-label="Virtualized inventory table">
        <table>
          <caption>Virtualized inventory records with keyboard-focusable scroll container</caption>
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Name</th>
              <th scope="col">Type</th>
              <th scope="col">Status</th>
              <th scope="col">Last Updated</th>
              <th scope="col">Details</th>
            </tr>
          </thead>
          <tbody>
            {topPadding > 0 ? <tr aria-hidden="true"><td colSpan={6} style={{ height: topPadding }} /></tr> : null}
            {visibleItems.map((item) => (
              <tr key={item.id} style={{ height: ROW_H }}>
                <th scope="row">{item.id}</th>
                <td>{item.name}</td>
                <td>{item.type}</td>
                <td>
                  <StatusBadge status={item.status} />
                </td>
                <td>{new Date(item.lastUpdated).toLocaleDateString()}</td>
                <td>
                  <Link href={`/inventory/items/${item.id}`}>Open</Link>
                </td>
              </tr>
            ))}
            {bottomPadding > 0 ? <tr aria-hidden="true"><td colSpan={6} style={{ height: bottomPadding }} /></tr> : null}
          </tbody>
        </table>
      </div>
    </>
  );
});
