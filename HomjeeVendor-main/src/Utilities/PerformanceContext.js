import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "../ApiService/apiConstants";
import { useVendorContext } from "./VendorContext";

const PerformanceContext = createContext(null);

export const usePerformance = () => {
    const ctx = useContext(PerformanceContext);
    if (!ctx) throw new Error("usePerformance must be used inside PerformanceProvider");
    return ctx;
};

export const PerformanceProvider = ({ children }) => {
    //   const { vendorDataContext, vendorId } = useVendor(); // ✅ take from VendorContext
    const { vendorDataContext } = useVendorContext();
    const vendorId = vendorDataContext?._id;
    const [loading, setLoading] = useState(false);
    const [performanceData, setPerformanceData] = useState(null);
    const [kpiData, setKpiData] = useState(null);

    const vendorLat = vendorDataContext?.address?.latitude;
    const vendorLong = vendorDataContext?.address?.longitude;
    const coins = Number(vendorDataContext?.wallet?.coins || 0);

    const activeTab = "last";
    const serviceType = vendorDataContext?.vendor?.serviceType;

    const isHousePainting =
        serviceType === "house-painter" || serviceType === "House Painting";

    const isDeepCleaning = useMemo(
        () => String(serviceType || "").toLowerCase().includes("deep"),
        [serviceType]
    );

    const METRICS_ENDPOINT = isHousePainting
        ? API_ENDPOINTS.HOUSE_PAINTING_PERFORMANCE_METRICS
        : API_ENDPOINTS.DEEP_CLEANING_PERFORMANCE_METRICS;

    const renamedServiceType = isHousePainting ? "house_painting" : "deep_cleaning";

    const isPerfReady = useMemo(
        () => !!performanceData && !!kpiData,
        [performanceData, kpiData]
    );

    // ---------------- KPI color helper ----------------
    const getKpiColor = useCallback((value, ranges, options = { positive: true }) => {
        if (!ranges) return "#6c757d";

        const red = "#df2020";
        const orange = "#ff8c00";
        const yellow = "#fcce00ff";
        const green = "#198754";

        const a = Number(ranges.a ?? 0);
        const b = Number(ranges.b ?? 0);
        const c = Number(ranges.c ?? 0);
        const d = Number(ranges.d ?? 0);
        const e = Number(ranges.e ?? 0);
        const v = Number(value ?? 0);

        const uniq = new Set([a, b, c, d, e]);
        if (uniq.size === 1) return "#6c757d";

        const isDescending = a >= b && b >= c && c >= d && d >= e;

        if (options.positive) {
            const [A, B, C, D] = isDescending ? [e, d, c, b] : [a, b, c, d];
            if (v >= A && v < B) return red;
            if (v >= B && v < C) return orange;
            if (v >= C && v < D) return yellow;
            if (v >= D) return green;
            return "#6c757d";
        }

        if (isDescending) {
            if (v >= b) return red;
            if (v >= c) return orange;
            if (v >= d) return yellow;
            return green;
        } else {
            if (v >= a && v < b) return green;
            if (v >= b && v < c) return yellow;
            if (v >= c && v < d) return orange;
            if (v >= d) return red;
            return "#6c757d";
        }
    }, []);

    const colorToBand = useCallback((color) => {
        switch (color) {
            case "#df2020": return "red";
            case "#ff8c00": return "orange";
            case "#fcce00ff": return "yellow";
            case "#198754": return "green";
            default: return "unknown";
        }
    }, []);

    const isPerformanceLowFromBands = useCallback((bands = []) => {
        const counts = bands.reduce((acc, b) => {
            acc[b] = (acc[b] || 0) + 1;
            return acc;
        }, {});
        const red = counts.red || 0;
        const orange = counts.orange || 0;
        const yellow = counts.yellow || 0;

        if (red >= 1) return true;
        if (orange >= 2) return true;
        if (yellow >= 3) return true;
        if (orange >= 1 && yellow >= 2) return true;

        return false;
    }, []);

    // ---------------- Fetch performance ----------------
    const fetchPerformanceData = useCallback(async () => {
        if (!vendorId || vendorLat == null || vendorLong == null) return;

        setLoading(true);
        try {
            const resp = await axios.get(
                `${API_BASE_URL}${METRICS_ENDPOINT}${vendorId}/${vendorLat}/${vendorLong}/${activeTab}`
            );
            setPerformanceData(resp.data);
        } catch (e) {
            console.log("fetchPerformanceData error:", e);
            setPerformanceData(null);
        } finally {
            setLoading(false);
        }
    }, [vendorId, vendorLat, vendorLong, METRICS_ENDPOINT]);

    // ---------------- Fetch KPI ranges ----------------
    const fetchKpiParameters = useCallback(async () => {
        setLoading(true);
        try {
            const resp = await axios.get(
                `${API_BASE_URL}${API_ENDPOINTS.KPI_PARAMETERS}${renamedServiceType}`
            );
            setKpiData(resp?.data?.data?.ranges || null);
        } catch (e) {
            console.log("fetchKpiParameters error:", e);
            setKpiData(null);
        } finally {
            setLoading(false);
        }
    }, [renamedServiceType]);

    useEffect(() => {
        fetchPerformanceData();
    }, [fetchPerformanceData]);

    useEffect(() => {
        fetchKpiParameters();
    }, [fetchKpiParameters]);

    // ---------------- Compute bands ----------------
    const bands = useMemo(() => {
        if (!performanceData || !kpiData) return [];

        if (isDeepCleaning) {
            return [
                colorToBand(getKpiColor(performanceData?.responseRate || 0, kpiData?.responsePercentage, { positive: true })),
                colorToBand(getKpiColor(performanceData?.cancellationRate || 0, kpiData?.cancellationPercentage, { positive: false })),
                colorToBand(getKpiColor(performanceData?.averageRating || 0, kpiData?.rating, { positive: true })),
                colorToBand(getKpiColor(performanceData?.strikes || 0, kpiData?.strikes, { positive: false })),
            ];
        }

        // house painting
        return [
            colorToBand(getKpiColor(performanceData?.surveyRate || 0, kpiData?.surveyPercentage, { positive: true })),
            colorToBand(getKpiColor(performanceData?.hiringRate || 0, kpiData?.hiringPercentage, { positive: true })),
            colorToBand(getKpiColor(performanceData?.averageGsv || 0, kpiData?.avgGSV, { positive: true })),
            colorToBand(getKpiColor(performanceData?.averageRating || 0, kpiData?.rating, { positive: true })),
            colorToBand(getKpiColor(performanceData?.strikes || 0, kpiData?.strikes, { positive: false })),
        ];
    }, [performanceData, kpiData, isDeepCleaning, getKpiColor, colorToBand]);

    // const isPerformanceLow = useMemo(
    //     () => isPerformanceLowFromBands(bands),
    //     [bands, isPerformanceLowFromBands]
    // );

    const isPerformanceLow = useMemo(() => {
        if (!isPerfReady) return null; // ✅ unknown until both are loaded
        return isPerformanceLowFromBands(bands);
    }, [isPerfReady, bands, isPerformanceLowFromBands]);

    // ✅ client rule: buy coins enabled only when coins < 100 and performance good
    const buyCoinsEnabled = useMemo(() => {
        if (isPerformanceLow == null) return false; // until ready
        return coins < 100 && !isPerformanceLow;
    }, [coins, isPerformanceLow]);
    // const buyCoinsEnabled = useMemo(
    //     () => coins < 100 && !isPerformanceLow,
    //     [coins, isPerformanceLow]
    // );

    const value = useMemo(
        () => ({
            loading,
            performanceData,
            kpiData,
            isPerfReady,
            coins,
            serviceType,
            isHousePainting,
            isDeepCleaning,
            bands,
            isPerformanceLow,
            buyCoinsEnabled,
            refresh: async () => {
                await Promise.all([fetchPerformanceData(), fetchKpiParameters()]);
            },
        }),
        [
            loading,
            performanceData,
            kpiData,
            isPerfReady,
            coins,
            serviceType,
            isHousePainting,
            isDeepCleaning,
            bands,
            isPerformanceLow,
            buyCoinsEnabled,
            fetchPerformanceData,
            fetchKpiParameters,
        ]
    );

    return (
        <PerformanceContext.Provider value={value}>
            {children}
        </PerformanceContext.Provider>
    );
};