// // packageCalc.js (UPDATED)

// const PRIORITY = {
//     INT_CEIL: 1,
//     INT_WALL: 2,
//     EXT_CEIL: 3,
//     EXT_WALL: 4,
//     OTH: 5,
// };

// const minPriority = (a, b) => Math.min(Number(a || 99), Number(b || 99));

// const keyOf = (category, itemName) =>
//     `${String(category || "").trim()}|${String(itemName || "").trim()}`;

// const processLabel = (mode) =>
//     mode === "FRESH" ? "Fresh Paint" : "Repaint With Primer";

// const prettifyPaintName = (paintName, mode) => {
//     const p = String(paintName || "").trim();
//     const pl = p.toLowerCase();
//     const suffix = processLabel(mode);

//     // avoid duplicates
//     if (mode === "FRESH" && pl.includes("fresh")) return p;
//     if (mode !== "FRESH" && (pl.includes("repaint") || pl.includes("primer")))
//         return p;

//     return `${p} ${suffix}`;
// };

// const unitFromDetail = (detail, mode, puttyPrice) => {
//     const base = Number(detail?.paintPrice || 0);
//     const putty = Number(puttyPrice || 0);

//     const needsPutty =
//         (mode === "FRESH" && !!detail?.includePuttyOnFresh) ||
//         (mode !== "FRESH" && !!detail?.includePuttyOnRepaint);

//     return base + (needsPutty ? putty : 0);
// };

// export const buildPackageProductSummary = (estimateData, pkg, puttyPrice) => {
//     try {
//         const rooms = estimateData?.rooms || {};
//         const details = Array.isArray(pkg?.details) ? pkg.details : [];

//         // Index details: "Interior|Walls", "Exterior|Ceiling", "Others|Others"
//         const map = new Map();
//         for (const d of details) {
//             map.set(keyOf(d.category, d.itemName), d);
//         }

//         // ✅ bucket key => { paintName, sqft, cost }
//         // key now ONLY depends on (paintName + mode + surfaceType),
//         // so Interior+Exterior gets combined automatically (as client wants).
//         const bucket = new Map();
//         let totalCost = 0;

//         const addToBucket = ({ detail, mode, sqft, priority }) => {
//             try {
//                 if (!detail || !sqft) return;

//                 const unit = unitFromDetail(detail, mode, puttyPrice);
//                 const cost = sqft * unit;
//                 totalCost += cost;

//                 const rowName = prettifyPaintName(detail.paintName, mode);

//                 // ✅ Combined key (as you are using now)
//                 const k = `${detail.paintName}|${mode}`;

//                 const prev =
//                     bucket.get(k) || { paintName: rowName, sqft: 0, cost: 0, priority: 99 };

//                 prev.sqft += sqft;
//                 prev.cost += cost;

//                 // ✅ keep best (highest) priority i.e., smallest number
//                 prev.priority = minPriority(prev.priority, priority);

//                 bucket.set(k, prev);
//             } catch (e) {
//                 console.log("addToBucket error", e);
//             }
//         };

//         Object.values(rooms || {}).forEach((room) => {
//             const sect = String(room?.sectionType || "").trim(); // Interior/Exterior/Others

//             // -------- Interior / Exterior --------
//             if (sect !== "Others") {
//                 const ceilDetail = map.get(keyOf(sect, "Ceiling"));
//                 const wallDetail = map.get(keyOf(sect, "Walls"));

//                 const ceilings = Array.isArray(room?.ceilings) ? room.ceilings : [];
//                 ceilings.forEach((it) => {
//                     const sqft = Number(it?.totalSqt ?? it?.area ?? 0) || 0;
//                     const mode = String(it?.mode || "REPAINT");
//                     addToBucket({
//                         detail: ceilDetail,
//                         mode,
//                         sqft,
//                         priority:
//                             sect === "Interior" ? PRIORITY.INT_CEIL : PRIORITY.EXT_CEIL,
//                     });
//                 });

//                 const walls = Array.isArray(room?.walls) ? room.walls : [];
//                 walls.forEach((it) => {
//                     const sqft = Number(it?.totalSqt ?? it?.area ?? 0) || 0;
//                     const mode = String(it?.mode || "REPAINT");
//                     addToBucket({
//                         detail: wallDetail,
//                         mode,
//                         sqft,
//                         priority:
//                             sect === "Interior" ? PRIORITY.INT_WALL : PRIORITY.EXT_WALL,
//                     });
//                 });

//                 return;
//             }

//             // -------- Others --------
//             const otherDetail = map.get(keyOf("Others", "Others"));
//             const arr = Array.isArray(room?.measurements) ? room.measurements : [];
//             arr.forEach((it) => {
//                 const sqft = Number(it?.totalSqt ?? it?.area ?? 0) || 0;
//                 const mode = String(it?.mode || "REPAINT");

//                 // For Others, we don't want "Fresh/Repaint" suffix in UI in your example.
//                 // But if you WANT repaint/fresh split for Others too, keep prettifyPaintName.
//                 // Here we keep it simple: Oil Enamel Painting only.
//                 const unit = unitFromDetail(otherDetail, mode, puttyPrice);
//                 const cost = sqft * unit;

//                 totalCost += cost;

//                 const k = `OTH|${otherDetail?.paintName || "Others"}|${mode}`;
//                 const prev =
//                     bucket.get(k) || { paintName: otherDetail?.paintName || "Others", sqft: 0, cost: 0 };
//                 prev.sqft += sqft;
//                 prev.cost += cost;
//                 bucket.set(k, prev);
//             });
//         });

//         // ✅ Sort order similar to screenshot expectation (optional)
//         const sortRank = (key) => {
//             if (key.startsWith("CEIL|Tractor Emulsion|REPAINT")) return 1;
//             if (key.startsWith("WALL|Tractor Emulsion|REPAINT")) return 2;
//             if (key.includes("|FRESH")) return 3;
//             if (key.startsWith("WALL|Exterior Apex|REPAINT")) return 4;
//             if (key.startsWith("WALL|Exterior Apex|FRESH")) return 5;
//             if (key.startsWith("OTH|")) return 6;
//             return 99;
//         };

//         const products = Array.from(bucket.entries())
//             .sort((a, b) => {
//                 const pa = a[1]?.priority ?? 99;
//                 const pb = b[1]?.priority ?? 99;
//                 if (pa !== pb) return pa - pb;

//                 // tie-break: repaint before fresh (optional)
//                 const ma = a[0].endsWith("|REPAINT") ? 0 : 1;
//                 const mb = b[0].endsWith("|REPAINT") ? 0 : 1;
//                 if (ma !== mb) return ma - mb;

//                 // final tie-break: name
//                 return String(a[1]?.paintName || "").localeCompare(String(b[1]?.paintName || ""));
//             })
//             .map(([k, p]) => ({
//                 key: k,
//                 paintName: p.paintName,
//                 sqft: Math.round(p.sqft),
//                 cost: p.cost,
//             }));

//         return { products, totalCost };
//     } catch (e) {
//         console.log("buildPackageProductSummary error", e);
//         return { products: [], totalCost: 0 };
//     }
// };

// packageCalc.js

const PRIORITY = {
    INT_CEIL: 1,
    INT_WALL: 2,
    EXT_CEIL: 3,
    EXT_WALL: 4,
    OTH: 5,
};

const minPriority = (a, b) => Math.min(Number(a || 99), Number(b || 99));

const keyOf = (category, itemName) =>
    `${String(category || "").trim()}|${String(itemName || "").trim()}`;

const processLabel = (mode) =>
    mode === "FRESH" ? "Fresh Paint" : "Repaint With Primer";

const normalizeMode = (mode) =>
    String(mode || "REPAINT").trim().toUpperCase() === "FRESH"
        ? "FRESH"
        : "REPAINT";

/**
 * Special paints like:
 * - Royale Luxury Emulsion Fresh Paint
 * - Royale Aspira Fresh Paint
 *
 * should remain SAME in UI for both Fresh/Repaint measurements.
 * So they should be grouped only by paintName, not by mode.
 */
const isModeAgnosticPaint = (detail) => {
    const paintName = String(detail?.paintName || "").trim().toLowerCase();

    if (!paintName) return false;

    const hasFreshInName = paintName.includes("fresh paint");
    const hasRepaintOnly = paintName.includes("repaint only");

    // for these special paints both putty flags are false in your data
    const noPuttyFresh = !detail?.includePuttyOnFresh;
    const noPuttyRepaint = !detail?.includePuttyOnRepaint;

    return hasFreshInName && !hasRepaintOnly && noPuttyFresh && noPuttyRepaint;
};

const getDisplayPaintName = (detail, mode) => {
    const originalName = String(detail?.paintName || "").trim();

    if (isModeAgnosticPaint(detail)) {
        return originalName;
    }

    const lower = originalName.toLowerCase();
    const suffix = processLabel(mode);

    // avoid duplicate suffixes
    if (mode === "FRESH" && lower.includes("fresh")) return originalName;
    if (
        mode !== "FRESH" &&
        (lower.includes("repaint") || lower.includes("primer"))
    ) {
        return originalName;
    }

    return `${originalName} ${suffix}`;
};

const getBucketKey = (detail, mode, sectionType, itemName) => {
    const normalizedMode = normalizeMode(mode);
    const paintName = String(detail?.paintName || "").trim();

    // special paints should merge Fresh/Repaint rows
    if (isModeAgnosticPaint(detail)) {
        return `SPECIAL|${paintName}`;
    }

    // others section can stay separated by mode if needed
    if (String(sectionType || "").trim() === "Others") {
        return `OTH|${paintName}|${normalizedMode}`;
    }

    return `${paintName}|${normalizedMode}`;
};

const unitFromDetail = (detail, mode, puttyPrice) => {
    const base = Number(detail?.paintPrice || 0);
    const putty = Number(puttyPrice || 0);
    const normalizedMode = normalizeMode(mode);

    const needsPutty =
        (normalizedMode === "FRESH" && !!detail?.includePuttyOnFresh) ||
        (normalizedMode !== "FRESH" && !!detail?.includePuttyOnRepaint);

    return base + (needsPutty ? putty : 0);
};

export const buildPackageProductSummary = (estimateData, pkg, puttyPrice) => {
    try {
        const rooms = estimateData?.rooms || {};
        const details = Array.isArray(pkg?.details) ? pkg.details : [];

        const map = new Map();
        for (const d of details) {
            map.set(keyOf(d.category, d.itemName), d);
        }

        const bucket = new Map();
        let totalCost = 0;

        const addToBucket = ({ detail, mode, sqft, priority, sectionType, itemName }) => {
            try {
                if (!detail || !sqft) return;

                const normalizedMode = normalizeMode(mode);
                const unit = unitFromDetail(detail, normalizedMode, puttyPrice);
                const cost = sqft * unit;
                totalCost += cost;

                const rowName = getDisplayPaintName(detail, normalizedMode);
                const k = getBucketKey(detail, normalizedMode, sectionType, itemName);

                const prev =
                    bucket.get(k) || {
                        paintName: rowName,
                        sqft: 0,
                        cost: 0,
                        priority: 99,
                    };

                prev.sqft += sqft;
                prev.cost += cost;
                prev.priority = minPriority(prev.priority, priority);

                bucket.set(k, prev);
            } catch (e) {
                console.log("addToBucket error", e);
            }
        };

        Object.values(rooms || {}).forEach((room) => {
            const sect = String(room?.sectionType || "").trim();

            if (sect !== "Others") {
                const ceilDetail = map.get(keyOf(sect, "Ceiling"));
                const wallDetail = map.get(keyOf(sect, "Walls"));

                const ceilings = Array.isArray(room?.ceilings) ? room.ceilings : [];
                ceilings.forEach((it) => {
                    const sqft = Number(it?.totalSqt ?? it?.area ?? 0) || 0;
                    const mode = String(it?.mode || "REPAINT");
                    addToBucket({
                        detail: ceilDetail,
                        mode,
                        sqft,
                        priority:
                            sect === "Interior" ? PRIORITY.INT_CEIL : PRIORITY.EXT_CEIL,
                        sectionType: sect,
                        itemName: "Ceiling",
                    });
                });

                const walls = Array.isArray(room?.walls) ? room.walls : [];
                walls.forEach((it) => {
                    const sqft = Number(it?.totalSqt ?? it?.area ?? 0) || 0;
                    const mode = String(it?.mode || "REPAINT");
                    addToBucket({
                        detail: wallDetail,
                        mode,
                        sqft,
                        priority:
                            sect === "Interior" ? PRIORITY.INT_WALL : PRIORITY.EXT_WALL,
                        sectionType: sect,
                        itemName: "Walls",
                    });
                });

                return;
            }

            const otherDetail = map.get(keyOf("Others", "Others"));
            const arr = Array.isArray(room?.measurements) ? room.measurements : [];

            arr.forEach((it) => {
                const sqft = Number(it?.totalSqt ?? it?.area ?? 0) || 0;
                const mode = String(it?.mode || "REPAINT");

                addToBucket({
                    detail: otherDetail,
                    mode,
                    sqft,
                    priority: PRIORITY.OTH,
                    sectionType: "Others",
                    itemName: "Others",
                });
            });
        });

        const products = Array.from(bucket.entries())
            .sort((a, b) => {
                const pa = a[1]?.priority ?? 99;
                const pb = b[1]?.priority ?? 99;
                if (pa !== pb) return pa - pb;

                return String(a[1]?.paintName || "").localeCompare(
                    String(b[1]?.paintName || "")
                );
            })
            .map(([k, p]) => ({
                key: k,
                paintName: p.paintName,
                sqft: Math.round(p.sqft),
                cost: p.cost,
            }));

        return { products, totalCost };
    } catch (e) {
        console.log("buildPackageProductSummary error", e);
        return { products: [], totalCost: 0 };
    }
};