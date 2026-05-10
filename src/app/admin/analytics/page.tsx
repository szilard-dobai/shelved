"use client";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type {
  TrackingEvent,
  TrackingEventType,
} from "@/lib/tracking/types";
import { BarChart3, Loader2, LogOut, RefreshCw, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type SortField = "timestamp" | "type" | "deviceId";
type SortOrder = "asc" | "desc";

const EVENT_TYPES: TrackingEventType[] = [
  "landing_view",
  "import_view",
  "editor_view",
  "export_view",
  "share_page_view",
  "not_found_view",
  "landing_cta_click",
  "skip_with_sample_click",
  "import_method_selected",
  "csv_upload",
  "search_result_added",
  "book_added_manual",
  "book_edited",
  "book_removed",
  "title_edited",
  "shelf_style_changed",
  "sort_changed",
  "background_changed",
  "year_filter_changed",
  "theme_changed",
  "export_jpeg_click",
  "share_created",
  "share_edited",
  "share_deleted",
  "share_link_copied",
  "edit_link_copied",
  "library_cleared",
  "shelf_reset",
];

interface Stats {
  total: number;
  filtered: number;
  uniqueDevices: number;
  filteredUniqueDevices: number;
  eventTypes: number;
  filteredEventTypes: number;
  uniqueCountries: number;
  filteredUniqueCountries: number;
  countries: string[];
  regions: string[];
}

interface CountryDeviceCount {
  country: string;
  deviceCount: number;
}

interface HighLevelStats {
  totalEvents: number;
  uniqueCountries: number;
  uniqueDevices: number;
  booksAdded: number;
  booksAddedManual: number;
  booksAddedFromSearch: number;
  csvUploads: number;
  deviceTypePercentages: { mobile: number; tablet: number; desktop: number };
  deviceTypeCounts: Record<string, number>;
  exports: { jpegExports: number };
  sharing: {
    created: number;
    edited: number;
    deleted: number;
    shareLinkCopied: number;
    editLinkCopied: number;
  };
  dataManagement: { libraryCleared: number; shelfReset: number };
  pageViews: {
    landing: number;
    import: number;
    editor: number;
    export: number;
    sharePage: number;
    notFound: number;
  };
  eventBreakdown: Record<string, number>;
  topCountriesByDevices: CountryDeviceCount[];
  interestingMentions: CountryDeviceCount[];
}

const fieldClasses =
  "block w-full rounded-2xs border border-rule bg-transparent px-3 py-2 text-sm text-ink outline-none transition-colors hover:border-rule-strong focus:border-rule-strong placeholder:text-ink-faint";
const selectClasses = `${fieldClasses} cursor-pointer appearance-none pr-8`;
const labelClasses =
  "block text-2xs uppercase tracking-widest text-ink-muted";
const cardClasses =
  "rounded-xs border border-rule bg-bg-panel-solid p-4";

const countryDisplay =
  typeof Intl !== "undefined" && "DisplayNames" in Intl
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

function countryName(code: string): string {
  if (!code) return code;
  try {
    return countryDisplay?.of(code.toUpperCase()) || code;
  } catch {
    return code;
  }
}

function getFlagEmoji(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return "";
  const base = 0x1f1e6;
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((c) => base + c.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
}

export default function AnalyticsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [eventsError, setEventsError] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [deviceIdFilter, setDeviceIdFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [regionFilter, setRegionFilter] = useState<string>("all");

  const [sortField, setSortField] = useState<SortField>("timestamp");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const [selectedEvent, setSelectedEvent] = useState<TrackingEvent | null>(
    null,
  );

  const [showHighLevelStats, setShowHighLevelStats] = useState(false);
  const [highLevelStats, setHighLevelStats] = useState<HighLevelStats | null>(
    null,
  );
  const [isLoadingHighLevelStats, setIsLoadingHighLevelStats] = useState(false);

  const loadMoreRef = useRef<HTMLDivElement>(null);

  const buildFilterParams = useCallback(() => {
    const params = new URLSearchParams();
    if (typeFilter !== "all") params.set("type", typeFilter);
    if (deviceIdFilter) params.set("deviceId", deviceIdFilter);
    if (searchQuery) params.set("search", searchQuery);
    if (countryFilter !== "all") params.set("country", countryFilter);
    if (regionFilter !== "all") params.set("region", regionFilter);
    return params;
  }, [typeFilter, deviceIdFilter, searchQuery, countryFilter, regionFilter]);

  const buildQueryParams = useCallback(
    (extraParams?: Record<string, string>) => {
      const params = buildFilterParams();
      params.set("sortField", sortField);
      params.set("sortOrder", sortOrder);
      if (extraParams) {
        Object.entries(extraParams).forEach(([key, value]) => {
          params.set(key, value);
        });
      }
      return params.toString();
    },
    [buildFilterParams, sortField, sortOrder],
  );

  const fetchStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const response = await fetch(
        `/api/tracking/stats?${buildFilterParams().toString()}`,
      );
      if (!response.ok) {
        if (response.status === 401) {
          setIsAuthenticated(false);
          return;
        }
        throw new Error("Failed to fetch stats");
      }
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setIsLoadingStats(false);
    }
  }, [buildFilterParams]);

  const fetchEvents = useCallback(
    async (resetOffset = true) => {
      const newOffset = resetOffset ? 0 : offset;
      if (resetOffset) {
        setIsLoadingEvents(true);
        setOffset(0);
      } else {
        setIsLoadingMore(true);
      }
      setEventsError("");

      try {
        const response = await fetch(
          `/api/tracking?${buildQueryParams({ limit: "50", offset: String(newOffset) })}`,
        );
        if (!response.ok) {
          if (response.status === 401) {
            setIsAuthenticated(false);
            return;
          }
          throw new Error("Failed to fetch events");
        }

        const data = await response.json();
        if (resetOffset) {
          setEvents(data.events);
        } else {
          setEvents((prev) => [...prev, ...data.events]);
        }
        setHasMore(data.hasMore);
        if (!resetOffset) {
          setOffset(newOffset + 50);
        } else {
          setOffset(50);
        }
      } catch (error) {
        setEventsError(
          error instanceof Error ? error.message : "Unknown error",
        );
      } finally {
        setIsLoadingEvents(false);
        setIsLoadingMore(false);
      }
    },
    [buildQueryParams, offset],
  );

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      fetchEvents(false);
    }
  }, [fetchEvents, hasMore, isLoadingMore]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/tracking/stats");
        if (response.ok) {
          setIsAuthenticated(true);
        }
      } catch {
        // Not authenticated
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const filterDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const sortDebounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    if (filterDebounceRef.current) {
      clearTimeout(filterDebounceRef.current);
    }

    filterDebounceRef.current = setTimeout(() => {
      fetchStats();
      fetchEvents(true);
    }, 300);

    return () => {
      if (filterDebounceRef.current) {
        clearTimeout(filterDebounceRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isAuthenticated,
    typeFilter,
    deviceIdFilter,
    searchQuery,
    countryFilter,
    regionFilter,
  ]);

  useEffect(() => {
    if (!isAuthenticated) return;

    if (sortDebounceRef.current) {
      clearTimeout(sortDebounceRef.current);
    }

    sortDebounceRef.current = setTimeout(() => {
      fetchEvents(true);
    }, 300);

    return () => {
      if (sortDebounceRef.current) {
        clearTimeout(sortDebounceRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortField, sortOrder]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !isLoadingMore &&
          !isLoadingEvents
        ) {
          loadMore();
        }
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, isLoadingEvents, loadMore]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        setIsAuthenticated(true);
        setPassword("");
      } else {
        const data = await response.json();
        setAuthError(data.error || "Invalid password");
      }
    } catch {
      setAuthError("Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setIsAuthenticated(false);
    setEvents([]);
    setStats(null);
  };

  const handleRefresh = () => {
    fetchStats();
    fetchEvents(true);
  };

  const fetchHighLevelStats = async () => {
    setIsLoadingHighLevelStats(true);
    try {
      const response = await fetch("/api/tracking/stats/high-level");
      if (!response.ok) {
        if (response.status === 401) {
          setIsAuthenticated(false);
          return;
        }
        throw new Error("Failed to fetch high-level stats");
      }
      const data = await response.json();
      setHighLevelStats(data);
    } catch (error) {
      console.error("Failed to fetch high-level stats:", error);
    } finally {
      setIsLoadingHighLevelStats(false);
    }
  };

  const handleOpenHighLevelStats = () => {
    setShowHighLevelStats(true);
    fetchHighLevelStats();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-ink-muted" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm space-y-4 rounded-xs border border-rule bg-bg-panel-solid p-6 shadow-lg"
        >
          <h1 className="text-center font-serif text-xl text-ink">
            Admin Access
          </h1>
          <div className="space-y-2">
            <label htmlFor="password" className={labelClasses}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              autoFocus
              className={fieldClasses}
            />
          </div>
          {authError && (
            <p className="text-center text-sm text-danger">{authError}</p>
          )}
          <Button type="submit" full disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-2xl text-ink">Analytics</h1>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleOpenHighLevelStats}
            >
              <BarChart3 className="size-4" />
              <span className="hidden sm:inline">Overview</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoadingStats || isLoadingEvents}
            >
              <RefreshCw
                className={`size-4 ${
                  isLoadingStats || isLoadingEvents ? "animate-spin" : ""
                }`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>

        <div className={`grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6 ${cardClasses}`}>
          <div className="space-y-2">
            <label className={labelClasses}>Event Type</label>
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className={selectClasses}
              >
                <option value="all">All types</option>
                {EVENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <Icon
                name="chevronDown"
                size={14}
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={labelClasses}>Country</label>
            <div className="relative">
              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className={selectClasses}
              >
                <option value="all">All countries</option>
                {(stats?.countries ?? []).map((country) => (
                  <option key={country} value={country}>
                    {countryName(country)}
                  </option>
                ))}
              </select>
              <Icon
                name="chevronDown"
                size={14}
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={labelClasses}>Region</label>
            <div className="relative">
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className={selectClasses}
              >
                <option value="all">All regions</option>
                {(stats?.regions ?? []).map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
              <Icon
                name="chevronDown"
                size={14}
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={labelClasses}>Device ID</label>
            <input
              placeholder="Filter by device ID..."
              value={deviceIdFilter}
              onChange={(e) => setDeviceIdFilter(e.target.value)}
              className={fieldClasses}
            />
          </div>

          <div className="space-y-2">
            <label className={labelClasses}>Search Metadata</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
              <input
                placeholder="Search in metadata..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${fieldClasses} pl-8`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={labelClasses}>Sort By</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as SortField)}
                  className={selectClasses}
                >
                  <option value="timestamp">Time</option>
                  <option value="type">Type</option>
                  <option value="deviceId">Device</option>
                </select>
                <Icon
                  name="chevronDown"
                  size={14}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted"
                />
              </div>
              <div className="relative flex-1">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                  className={selectClasses}
                >
                  <option value="desc">Desc</option>
                  <option value="asc">Asc</option>
                </select>
                <Icon
                  name="chevronDown"
                  size={14}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <StatCell label="Total Events" loading={isLoadingStats}>
            {stats?.total ?? "-"}
          </StatCell>
          <StatCell label="Filtered" loading={isLoadingStats}>
            {stats?.filtered ?? "-"}
          </StatCell>
          <StatCell label="Unique Devices" loading={isLoadingStats}>
            <>
              {stats?.filteredUniqueDevices ?? "-"}
              {stats &&
                stats.filteredUniqueDevices !== stats.uniqueDevices && (
                  <span className="ml-1 text-sm font-normal text-ink-faint">
                    / {stats.uniqueDevices}
                  </span>
                )}
            </>
          </StatCell>
          <StatCell label="Event Types" loading={isLoadingStats}>
            <>
              {stats?.filteredEventTypes ?? "-"}
              {stats && stats.filteredEventTypes !== stats.eventTypes && (
                <span className="ml-1 text-sm font-normal text-ink-faint">
                  / {stats.eventTypes}
                </span>
              )}
            </>
          </StatCell>
          <StatCell label="Unique Countries" loading={isLoadingStats}>
            <>
              {stats?.filteredUniqueCountries ?? "-"}
              {stats &&
                stats.filteredUniqueCountries !== stats.uniqueCountries && (
                  <span className="ml-1 text-sm font-normal text-ink-faint">
                    / {stats.uniqueCountries}
                  </span>
                )}
            </>
          </StatCell>
        </div>

        {eventsError && (
          <div className="rounded-xs border border-danger/40 bg-danger/10 p-4 text-danger">
            {eventsError}
          </div>
        )}

        <div className="overflow-hidden rounded-xs border border-rule bg-bg-panel-solid">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-rule bg-bg-raised">
                <tr>
                  <th className="p-3 text-left font-medium text-ink-muted">
                    Timestamp
                  </th>
                  <th className="p-3 text-left font-medium text-ink-muted">
                    Type
                  </th>
                  <th className="p-3 text-left font-medium text-ink-muted">
                    Device
                  </th>
                  <th className="p-3 text-left font-medium text-ink-muted">
                    Device ID
                  </th>
                  <th className="p-3 text-left font-medium text-ink-muted">
                    Location
                  </th>
                  <th className="w-72 p-3 text-left font-medium text-ink-muted">
                    Metadata
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule">
                {isLoadingEvents ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center">
                      <Loader2 className="mx-auto size-6 animate-spin text-ink-muted" />
                    </td>
                  </tr>
                ) : (
                  <>
                    {events.map((event, idx) => (
                      <tr
                        key={`${event.timestamp}-${event.deviceId}-${idx}`}
                        className="cursor-pointer hover:bg-bg-raised"
                        onClick={() => setSelectedEvent(event)}
                      >
                        <td className="whitespace-nowrap p-3 font-mono text-xs text-ink-muted">
                          {new Date(event.timestamp).toLocaleString()}
                        </td>
                        <td className="p-3">
                          <span className="rounded-full bg-gold-soft px-2 py-1 text-xs font-medium text-gold">
                            {event.type}
                          </span>
                        </td>
                        <td className="p-3 text-xs text-ink-muted">
                          {event.deviceType ?? "-"}
                        </td>
                        <td className="p-3 font-mono text-xs text-ink-muted">
                          {event.deviceId.slice(0, 8)}...
                        </td>
                        <td className="p-3 text-xs text-ink-muted">
                          {event.country
                            ? `${event.country}${event.region ? ` / ${event.region}` : ""}`
                            : "-"}
                        </td>
                        <td className="p-3 text-xs text-ink-muted">
                          <div className="w-72 truncate">
                            {event.metadata
                              ? JSON.stringify(event.metadata).slice(0, 50) +
                                (JSON.stringify(event.metadata).length > 50
                                  ? "..."
                                  : "")
                              : "-"}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {events.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="p-8 text-center text-ink-muted"
                        >
                          No events found
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>

          {hasMore && (
            <div
              ref={loadMoreRef}
              className="flex justify-center border-t border-rule p-4"
            >
              {isLoadingMore ? (
                <Loader2 className="size-5 animate-spin text-ink-muted" />
              ) : (
                <Button variant="ghost" size="sm" onClick={loadMore}>
                  Load more
                </Button>
              )}
            </div>
          )}
        </div>

        {selectedEvent && (
          <Modal onClose={() => setSelectedEvent(null)} title="Event Details">
            <div className="space-y-4 p-4">
              <DetailRow label="Type">{selectedEvent.type}</DetailRow>
              <DetailRow label="Timestamp">
                {new Date(selectedEvent.timestamp).toLocaleString()}
              </DetailRow>
              <DetailRow label="Device Type">
                {selectedEvent.deviceType ?? "-"}
              </DetailRow>
              <DetailRow label="Device ID" mono>
                {selectedEvent.deviceId}
              </DetailRow>
              <DetailRow label="Location">
                {selectedEvent.country
                  ? `${selectedEvent.country}${
                      selectedEvent.region
                        ? ` / ${selectedEvent.region}`
                        : ""
                    }`
                  : "Unknown"}
              </DetailRow>
              <div>
                <span className={labelClasses}>Metadata</span>
                <pre className="mt-1 overflow-auto rounded-2xs bg-bg-raised p-3 text-xs text-ink">
                  {JSON.stringify(selectedEvent.metadata, null, 2) || "null"}
                </pre>
              </div>
            </div>
          </Modal>
        )}

        {showHighLevelStats && (
          <Modal
            onClose={() => setShowHighLevelStats(false)}
            title="Analytics Overview"
            wide
          >
            {isLoadingHighLevelStats ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="size-8 animate-spin text-ink-muted" />
              </div>
            ) : highLevelStats ? (
              <div className="space-y-6 p-4">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <OverviewStat label="Total Events">
                    {highLevelStats.totalEvents.toLocaleString()}
                  </OverviewStat>
                  <OverviewStat label="Unique Devices">
                    {highLevelStats.uniqueDevices.toLocaleString()}
                  </OverviewStat>
                  <OverviewStat label="Unique Countries">
                    {highLevelStats.uniqueCountries.toLocaleString()}
                  </OverviewStat>
                  <OverviewStat label="Books Added">
                    {highLevelStats.booksAdded.toLocaleString()}
                  </OverviewStat>
                </div>

                <div className={cardClasses}>
                  <h3 className="mb-3 font-serif text-base text-ink">
                    Device Type Distribution
                  </h3>
                  <div className="space-y-2">
                    <DeviceTypeBar
                      label="Mobile"
                      percent={highLevelStats.deviceTypePercentages.mobile}
                    />
                    <DeviceTypeBar
                      label="Tablet"
                      percent={highLevelStats.deviceTypePercentages.tablet}
                    />
                    <DeviceTypeBar
                      label="Desktop"
                      percent={highLevelStats.deviceTypePercentages.desktop}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className={cardClasses}>
                    <h3 className="mb-3 font-serif text-base text-ink">
                      Books Added
                    </h3>
                    <div className="space-y-2 text-sm">
                      <KvRow label="Manual">
                        {highLevelStats.booksAddedManual.toLocaleString()}
                      </KvRow>
                      <KvRow label="From Search">
                        {highLevelStats.booksAddedFromSearch.toLocaleString()}
                      </KvRow>
                      <KvRow label="CSV Uploads">
                        {highLevelStats.csvUploads.toLocaleString()}
                      </KvRow>
                    </div>
                  </div>

                  <div className={cardClasses}>
                    <h3 className="mb-3 font-serif text-base text-ink">
                      Sharing & Exports
                    </h3>
                    <div className="space-y-2 text-sm">
                      <KvRow label="Shares Created">
                        {highLevelStats.sharing.created.toLocaleString()}
                      </KvRow>
                      <KvRow label="Shares Edited">
                        {highLevelStats.sharing.edited.toLocaleString()}
                      </KvRow>
                      <KvRow label="Share Link Copies">
                        {highLevelStats.sharing.shareLinkCopied.toLocaleString()}
                      </KvRow>
                      <KvRow label="Edit Link Copies">
                        {highLevelStats.sharing.editLinkCopied.toLocaleString()}
                      </KvRow>
                      <KvRow label="JPEG Exports">
                        {highLevelStats.exports.jpegExports.toLocaleString()}
                      </KvRow>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className={cardClasses}>
                    <h3 className="mb-3 font-serif text-base text-ink">
                      Page Views
                    </h3>
                    <div className="space-y-2 text-sm">
                      <KvRow label="Landing">
                        {highLevelStats.pageViews.landing.toLocaleString()}
                      </KvRow>
                      <KvRow label="Import">
                        {highLevelStats.pageViews.import.toLocaleString()}
                      </KvRow>
                      <KvRow label="Editor">
                        {highLevelStats.pageViews.editor.toLocaleString()}
                      </KvRow>
                      <KvRow label="Export">
                        {highLevelStats.pageViews.export.toLocaleString()}
                      </KvRow>
                      <KvRow label="Share Page">
                        {highLevelStats.pageViews.sharePage.toLocaleString()}
                      </KvRow>
                      <KvRow label="Not Found">
                        {highLevelStats.pageViews.notFound.toLocaleString()}
                      </KvRow>
                    </div>
                  </div>

                  <div className={cardClasses}>
                    <h3 className="mb-3 font-serif text-base text-ink">
                      Data Management
                    </h3>
                    <div className="space-y-2 text-sm">
                      <KvRow label="Library Cleared">
                        {highLevelStats.dataManagement.libraryCleared.toLocaleString()}
                      </KvRow>
                      <KvRow label="Shelf Reset">
                        {highLevelStats.dataManagement.shelfReset.toLocaleString()}
                      </KvRow>
                      <KvRow label="Shares Deleted">
                        {highLevelStats.sharing.deleted.toLocaleString()}
                      </KvRow>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {highLevelStats.topCountriesByDevices.length > 0 && (
                    <div className={cardClasses}>
                      <h3 className="mb-3 font-serif text-base text-ink">
                        Top Countries by Devices
                      </h3>
                      <CountryList
                        items={highLevelStats.topCountriesByDevices.slice(
                          0,
                          5,
                        )}
                      />
                    </div>
                  )}

                  {highLevelStats.interestingMentions.length > 0 && (
                    <div className={cardClasses}>
                      <h3 className="mb-3 font-serif text-base text-ink">
                        Interesting Mentions
                      </h3>
                      <CountryList
                        items={highLevelStats.interestingMentions.slice(0, 5)}
                      />
                    </div>
                  )}
                </div>

                <div className={cardClasses}>
                  <h3 className="mb-3 font-serif text-base text-ink">
                    Event Type Breakdown
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-3">
                    {Object.entries(highLevelStats.eventBreakdown)
                      .sort(([, a], [, b]) => b - a)
                      .map(([type, count]) => (
                        <div
                          key={type}
                          className="flex justify-between rounded-2xs bg-bg-raised px-2 py-1"
                        >
                          <span className="truncate text-ink-muted">
                            {type}
                          </span>
                          <span className="ml-2 font-medium text-ink">
                            {count.toLocaleString()}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-ink-muted">
                Failed to load stats
              </div>
            )}
          </Modal>
        )}
      </div>
    </div>
  );
}

function StatCell({
  label,
  loading,
  children,
}: {
  label: string;
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cardClasses}>
      <p className="text-2xs uppercase tracking-widest text-ink-muted">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-ink">
        {loading ? <Loader2 className="size-5 animate-spin" /> : children}
      </p>
    </div>
  );
}

function OverviewStat({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cardClasses}>
      <p className="text-2xs uppercase tracking-widest text-ink-muted">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-ink">{children}</p>
    </div>
  );
}

function DetailRow({
  label,
  mono,
  children,
}: {
  label: string;
  mono?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <span className={labelClasses}>{label}</span>
      <p
        className={`mt-0.5 text-ink ${mono ? "break-all font-mono text-sm" : "font-mono"}`}
      >
        {children}
      </p>
    </div>
  );
}

function KvRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-ink-muted">{label}</span>
      <span className="font-medium text-ink">{children}</span>
    </div>
  );
}

function DeviceTypeBar({
  label,
  percent,
}: {
  label: string;
  percent: number;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-ink-muted">{label}</span>
      <div className="flex items-center gap-2">
        <div className="h-2 w-32 overflow-hidden rounded-full bg-rule">
          <div
            className="h-full rounded-full bg-gold transition-[width]"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="w-16 text-right text-sm font-medium text-ink">
          {percent.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

function CountryList({ items }: { items: CountryDeviceCount[] }) {
  return (
    <div className="space-y-2 text-sm">
      {items.map(({ country, deviceCount }, index) => (
        <div
          key={country}
          className="flex items-center justify-between py-1"
        >
          <div className="flex items-center gap-2">
            <span className="w-5 text-right text-ink-faint">
              {index + 1}.
            </span>
            <span>{getFlagEmoji(country)}</span>
            <span className="text-ink">{countryName(country)}</span>
          </div>
          <span className="font-medium text-ink">
            {deviceCount.toLocaleString()}{" "}
            <span className="font-normal text-ink-muted">
              {deviceCount === 1 ? "device" : "devices"}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}

function Modal({
  title,
  wide,
  onClose,
  children,
}: {
  title: string;
  wide?: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className={`max-h-[85vh] w-full overflow-auto rounded-xs border border-rule bg-bg-panel-solid shadow-xl ${
          wide ? "max-w-3xl" : "max-w-2xl"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-rule p-4">
          <h2 className="font-serif text-lg text-ink">{title}</h2>
          <button
            onClick={onClose}
            className="text-ink-muted transition-colors hover:text-ink"
            aria-label="Close"
          >
            <Icon name="x" size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
