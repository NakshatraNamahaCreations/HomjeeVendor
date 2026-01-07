import { View, Text } from "react-native";
import { getKpiColor } from "../Utilities/kpiColorEngine";

export default function KpiBadge({ value, label, metricKey, serviceType, kpiRanges }) {
    const bg = getKpiColor(serviceType, metricKey, value, kpiRanges);

    return (
        <View style={{
            backgroundColor: bg,
            paddingVertical: 8,
            paddingHorizontal: 20,
            borderRadius: 20,
            margin: 5
        }}>
            <Text style={{ color: "white", fontWeight: "600" }}>
                {label}: {value}
            </Text>
        </View>
    );
}
