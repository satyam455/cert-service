export type InventoryStatus = "Active" | "Expiring" | "Revoked";
export type InventoryType = "TLS Certificate" | "Code Signing" | "Client Auth" | "Device Cert";
export type SortKey = "id" | "name" | "type" | "status" | "updated";
export type SortDirection = "asc" | "desc";

export type InventoryItem = {
  id: string;
  name: string;
  type: InventoryType;
  status: InventoryStatus;
  lastUpdated: string;
  owner: string;
  environment: "Production" | "Staging" | "Development";
  description: string;
};

export type InventoryQuery = {
  q: string;
  status: "All" | InventoryStatus;
  sort: SortKey;
  direction: SortDirection;
  page: number;
  pageSize: number;
};

const types: InventoryType[] = ["TLS Certificate", "Code Signing", "Client Auth", "Device Cert"];
const statuses: InventoryStatus[] = ["Active", "Expiring", "Revoked"];
const environments: InventoryItem["environment"][] = ["Production", "Staging", "Development"];

let cachedItems: InventoryItem[] | undefined;

export function getInventoryItems(): InventoryItem[] {
  if (cachedItems) {
    return cachedItems;
  }

  cachedItems = Array.from({ length: 50000 }, (_, index) => {
    const number = index + 1;
    const type = types[index % types.length];
    const status = statuses[(index * 7) % statuses.length];
    const lastUpdated = new Date(Date.UTC(2026, index % 12, (index % 28) + 1, index % 24, 0, 0));

    return {
      id: `INV-${number.toString().padStart(5, "0")}`,
      name: `${type} ${number.toString().padStart(5, "0")}`,
      type,
      status,
      lastUpdated: lastUpdated.toISOString(),
      owner: `Platform Team ${(index % 9) + 1}`,
      environment: environments[index % environments.length],
      description: `Managed ${type.toLowerCase()} inventory record used for operational tracking.`,
    };
  });

  return cachedItems;
}

export function parseInventoryQuery(searchParams: Record<string, string | string[] | undefined>): InventoryQuery {
  const value = (key: string) => {
    const raw = searchParams[key];
    return Array.isArray(raw) ? raw[0] : raw;
  };

  const status = value("status");
  const sort = value("sort");
  const direction = value("direction");
  const page = Number(value("page") ?? "1");

  return {
    q: value("q")?.trim() ?? "",
    status: isStatus(status) ? status : "All",
    sort: isSortKey(sort) ? sort : "updated",
    direction: direction === "asc" ? "asc" : "desc",
    page: Number.isFinite(page) && page > 0 ? Math.floor(page) : 1,
    pageSize: 25,
  };
}

export function queryInventory(query: InventoryQuery) {
  const needle = query.q.toLowerCase();
  const filtered = getInventoryItems().filter((item) => {
    if (query.status !== "All" && item.status !== query.status) return false;
    if (needle.length === 0) return true;
    return (
      item.id.toLowerCase().includes(needle) ||
      item.name.toLowerCase().includes(needle) ||
      item.type.toLowerCase().includes(needle)
    );
  });

  const sorted = filtered.toSorted((a, b) => compareItems(a, b, query.sort, query.direction));
  const totalPages = Math.max(1, Math.ceil(sorted.length / query.pageSize));
  const page = Math.min(query.page, totalPages);
  const start = (page - 1) * query.pageSize;

  return {
    items: sorted.slice(start, start + query.pageSize),
    total: sorted.length,
    page,
    totalPages,
  };
}

export function filterAndSortInventory(items: InventoryItem[], query: Omit<InventoryQuery, "page" | "pageSize">) {
  const needle = query.q.toLowerCase();
  const filtered = items.filter((item) => {
    if (query.status !== "All" && item.status !== query.status) return false;
    if (needle.length === 0) return true;
    return (
      item.id.toLowerCase().includes(needle) ||
      item.name.toLowerCase().includes(needle) ||
      item.type.toLowerCase().includes(needle)
    );
  });

  return filtered.toSorted((a, b) => compareItems(a, b, query.sort, query.direction));
}

export function findInventoryItem(id: string): InventoryItem | undefined {
  return getInventoryItems().find((item) => item.id === id);
}

export function buildInventoryHref(query: InventoryQuery, overrides: Partial<InventoryQuery>) {
  const next = { ...query, ...overrides };
  const params = new URLSearchParams();

  if (next.q) params.set("q", next.q);
  if (next.status !== "All") params.set("status", next.status);
  if (next.sort !== "updated") params.set("sort", next.sort);
  if (next.direction !== "desc") params.set("direction", next.direction);
  if (next.page !== 1) params.set("page", String(next.page));

  const qs = params.toString();
  return qs ? `/inventory?${qs}` : "/inventory";
}

function compareItems(a: InventoryItem, b: InventoryItem, sort: SortKey, direction: SortDirection) {
  const multiplier = direction === "asc" ? 1 : -1;
  const left = valueForSort(a, sort);
  const right = valueForSort(b, sort);
  return left.localeCompare(right) * multiplier;
}

function valueForSort(item: InventoryItem, sort: SortKey) {
  if (sort === "updated") return item.lastUpdated;
  return item[sort];
}

function isStatus(value: string | undefined): value is InventoryStatus {
  return value === "Active" || value === "Expiring" || value === "Revoked";
}

function isSortKey(value: string | undefined): value is SortKey {
  return value === "id" || value === "name" || value === "type" || value === "status" || value === "updated";
}
