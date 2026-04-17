import { AnimatedCircularProgress } from "react-native-circular-progress";
import { Text, View } from "react-native";
import { getKpiColor } from "../Utilities/kpiColorEngine";

export default function KPIHalfCard({
    value,
    count,
    label,
    metricKey,
    serviceType,
    kpiRanges
}) {
    const color = getKpiColor(serviceType, metricKey, value, kpiRanges);

    return (
        <View style={{ alignItems: "center", margin: 5 }}>
            <AnimatedCircularProgress
                size={70}
                width={10}
                fill={value}
                arcSweepAngle={180}
                rotation={-90}
                tintColor={color}
                backgroundColor="#eee"
            >
                {() => <Text style={{ fontSize: 14, color }}>{value}%</Text>}
            </AnimatedCircularProgress>

            <View
                style={{
                    marginTop: 5,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    backgroundColor: "#f8f9fa",
                    borderRadius: 5
                }}
            >
                <Text style={{ fontSize: 12, color }}>{label} ({count})</Text>
            </View>
        </View>
    );
}
