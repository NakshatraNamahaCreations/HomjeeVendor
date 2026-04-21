export const KPI_KEY_MAP = {
    responseRate: "responsePercentage",
    cancellationRate: "cancellationPercentage",
    averageGsv: "avgGSV",
    averageRating: "rating",
    strikes: "strikes",
    surveyRate: "surveyPercentage",
    hiringRate: "hiringPercentage"
};

export const getKpiColor = (serviceType, metric, rawValue, kpiRanges) => {
    const mappedKey = KPI_KEY_MAP[metric];
    const ranges = kpiRanges[serviceType]?.[mappedKey];

    if (!ranges) return "#000"; // fallback color

    const value = parseFloat(rawValue);
    const { a, b, c, d } = ranges;

    if (value >= a && value < b) return "#dc3545"; // Red
    if (value >= b && value < c) return "#ff8c00"; // Orange
    if (value >= c && value < d) return "#d4aa00"; // Yellow
    if (value >= d) return "#198754"; // Green

    return "#000";
};
