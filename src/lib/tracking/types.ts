export type TrackingEventType =
  | "landing_view"
  | "import_view"
  | "editor_view"
  | "export_view"
  | "share_page_view"
  | "not_found_view"
  | "landing_cta_click"
  | "import_method_selected"
  | "csv_upload"
  | "search_result_added"
  | "skip_with_sample_click"
  | "shelf_style_changed"
  | "sort_changed"
  | "background_changed"
  | "title_edited"
  | "book_edited"
  | "book_removed"
  | "book_added_manual"
  | "export_png_click"
  | "share_link_copied"
  | "edit_link_copied"
  | "share_created"
  | "share_edited"
  | "theme_changed";

export type DeviceType = "mobile" | "tablet" | "desktop";

export interface TrackingEvent {
  type: TrackingEventType;
  timestamp: string;
  deviceId: string;
  deviceType?: DeviceType;
  country?: string;
  region?: string;
  metadata?: Record<string, unknown>;
}

export interface ImportMethodSelectedMetadata {
  method: "csv" | "storygraph" | "search";
}

export interface ShelfStyleChangedMetadata {
  style: "wood" | "minimal" | "spines";
}

export interface SortChangedMetadata {
  sort: "year" | "author" | "genre";
}

export interface ThemeChangedMetadata {
  theme: "dark" | "light" | "system";
}

export interface ShareCreatedMetadata {
  slug: string;
  bookCount: number;
  style: string;
}
