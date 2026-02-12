// Utilities/packageCalc.js

const surfaceKeyByItemName = (itemName) => {
    const v = String(itemName || "").toLowerCase();
    if (v.includes("ceiling")) return "ceilings";
    if (v.includes("wall")) return "walls";
    return "measurements"; // Others/Doors etc
};

const sumAreaFor = (rooms, category, itemName) => {
    try {
        const key = surfaceKeyByItemName(itemName);
        let total = 0;

        Object.values(rooms || {}).forEach((room) => {
            if (room?.sectionType !== category) return;

            const arr = Array.isArray(room?.[key]) ? room[key] : [];
            arr.forEach((s) => {
                total += Number(s?.totalSqt ?? s?.area ?? 0);
            });
        });

        return total;
    } catch (e) {
        console.log("sumAreaFor error", e);
        return 0;
    }
};

export const buildPackageProductSummary = (estimateData, pkg) => {
    try {
        const rooms = estimateData?.rooms || {};
        const details = Array.isArray(pkg?.details) ? pkg.details : [];

        const products = [];
        let totalCost = 0;

        details.forEach((d) => {
            const sqft = sumAreaFor(rooms, d.category, d.itemName);
            if (!sqft) return;

            const price = Number(d.paintPrice || 0);
            const cost = sqft * price;
            totalCost += cost;

            products.push({
                key: d._id,
                paintName: d.paintName,
                sqft,
                cost,
            });
        });

        return { products, totalCost };
    } catch (e) {
        console.log("buildPackageProductSummary error", e);
        return { products: [], totalCost: 0 };
    }
};
