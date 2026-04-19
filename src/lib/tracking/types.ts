export type TrackingEventType =
  // Page views
  | "landing_view"
  | "import_view"
  | "editor_view"
  | "export_view"
  | "share_page_view"
  | "not_found_view"
  // Landing
  | "landing_cta_click"
  // Import
  | "import_method_selected"
  | "csv_upload"
  | "isbn_import"
  | "search_result_added"
  | "skip_with_sample_click"
  // Editor
  | "shelf_style_changed"
  | "sort_changed"
  | "background_changed"
  | "title_edited"
  | "book_edited"
  | "book_removed"
  | "book_added_manual"
  // Export / share
  | "export_png_click"
  | "share_link_copied"
  | "edit_link_copied"
  | "share_created"
  | "share_edited"
  // App chrome
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
  method: "csv" | "isbn" | "search";
}

export interface ShelfStyleChangedMetadata {
  style: "wood" | "minimal" | "spines";
}

export interface SortChangedMetadata {
  sort: "year" | "author" | "genre";
}

export interface ThemeChangedMetadata {
  theme: "dark" | "light";
}

export interface ShareCreatedMetadata {
  slug: string;
  bookCount: number;
  style: string;
}
