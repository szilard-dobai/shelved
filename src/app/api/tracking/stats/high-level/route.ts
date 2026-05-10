import { getTrackingCollection } from "@/lib/mongodb";
import { isAuthenticated, validateSameOrigin } from "@/lib/tracking/api";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const PAGE_VIEW_TYPES = [
  "landing_view",
  "import_view",
  "editor_view",
  "export_view",
  "share_page_view",
  "not_found_view",
] as const;

export async function GET(request: Request) {
  const forbidden = validateSameOrigin(request);
  if (forbidden) return forbidden;

  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const collection = await getTrackingCollection();

    const [
      totalEvents,
      uniqueCountries,
      uniqueDevices,
      deviceTypeCounts,
      booksAddedManual,
      booksAddedFromSearch,
      csvUploads,
      jpegExports,
      sharesCreated,
      sharesEdited,
      sharesDeleted,
      shareLinkCopied,
      editLinkCopied,
      libraryCleared,
      shelfReset,
      pageViews,
      eventTypeBreakdown,
      countriesByDevices,
    ] = await Promise.all([
      collection.countDocuments({}),
      collection.distinct("country").then((arr) => arr.filter(Boolean).length),
      collection.distinct("deviceId").then((arr) => arr.length),
      collection
        .aggregate([
          { $match: { deviceType: { $exists: true, $ne: null } } },
          { $group: { _id: "$deviceType", count: { $sum: 1 } } },
        ])
        .toArray(),
      collection.countDocuments({ type: "book_added_manual" }),
      collection.countDocuments({ type: "search_result_added" }),
      collection.countDocuments({ type: "csv_upload" }),
      collection.countDocuments({ type: "export_jpeg_click" }),
      collection.countDocuments({ type: "share_created" }),
      collection.countDocuments({ type: "share_edited" }),
      collection.countDocuments({ type: "share_deleted" }),
      collection.countDocuments({ type: "share_link_copied" }),
      collection.countDocuments({ type: "edit_link_copied" }),
      collection.countDocuments({ type: "library_cleared" }),
      collection.countDocuments({ type: "shelf_reset" }),
      collection
        .aggregate([
          { $match: { type: { $in: [...PAGE_VIEW_TYPES] } } },
          { $group: { _id: "$type", count: { $sum: 1 } } },
        ])
        .toArray(),
      collection
        .aggregate([{ $group: { _id: "$type", count: { $sum: 1 } } }])
        .toArray(),
      collection
        .aggregate([
          { $match: { country: { $exists: true, $ne: null } } },
          {
            $group: {
              _id: "$country",
              devices: { $addToSet: "$deviceId" },
            },
          },
          {
            $project: {
              country: "$_id",
              deviceCount: { $size: "$devices" },
            },
          },
          { $sort: { deviceCount: -1 } },
        ])
        .toArray(),
    ]);

    const deviceTypeMap: Record<string, number> = {};
    let totalWithDeviceType = 0;
    for (const item of deviceTypeCounts) {
      deviceTypeMap[item._id as string] = item.count as number;
      totalWithDeviceType += item.count as number;
    }

    const deviceTypePercentages = {
      mobile:
        totalWithDeviceType > 0
          ? ((deviceTypeMap["mobile"] || 0) / totalWithDeviceType) * 100
          : 0,
      tablet:
        totalWithDeviceType > 0
          ? ((deviceTypeMap["tablet"] || 0) / totalWithDeviceType) * 100
          : 0,
      desktop:
        totalWithDeviceType > 0
          ? ((deviceTypeMap["desktop"] || 0) / totalWithDeviceType) * 100
          : 0,
    };

    const pageViewMap: Record<string, number> = {};
    for (const item of pageViews) {
      pageViewMap[item._id as string] = item.count as number;
    }

    const eventBreakdown: Record<string, number> = {};
    for (const item of eventTypeBreakdown) {
      eventBreakdown[item._id as string] = item.count as number;
    }

    const topCountriesByDevices = countriesByDevices
      .slice(0, 10)
      .map((item) => ({
        country: item.country as string,
        deviceCount: item.deviceCount as number,
      }));

    const interestingMentions = countriesByDevices
      .filter((item) => (item.deviceCount as number) <= 2)
      .slice(0, 10)
      .map((item) => ({
        country: item.country as string,
        deviceCount: item.deviceCount as number,
      }));

    return NextResponse.json({
      totalEvents,
      uniqueCountries,
      uniqueDevices,
      booksAdded: booksAddedManual + booksAddedFromSearch,
      booksAddedManual,
      booksAddedFromSearch,
      csvUploads,
      deviceTypePercentages,
      deviceTypeCounts: deviceTypeMap,
      exports: {
        jpegExports,
      },
      sharing: {
        created: sharesCreated,
        edited: sharesEdited,
        deleted: sharesDeleted,
        shareLinkCopied,
        editLinkCopied,
      },
      dataManagement: {
        libraryCleared,
        shelfReset,
      },
      pageViews: {
        landing: pageViewMap["landing_view"] || 0,
        import: pageViewMap["import_view"] || 0,
        editor: pageViewMap["editor_view"] || 0,
        export: pageViewMap["export_view"] || 0,
        sharePage: pageViewMap["share_page_view"] || 0,
        notFound: pageViewMap["not_found_view"] || 0,
      },
      eventBreakdown,
      topCountriesByDevices,
      interestingMentions,
    });
  } catch (error) {
    console.error("Failed to fetch high-level stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch high-level stats" },
      { status: 500 },
    );
  }
}
