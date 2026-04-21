import { AnimatedCircularProgress } from "react-native-circular-progress";
import { Text, View } from "react-native";
import { getKpiColor } from "../Utilities/kpiColorEngine";

export default function SemiCircleMeter({
    value,
    label,
    metricKey,
    serviceType,
    kpiRanges,
    size = 180,
    width = 35
}) {
    const color = getKpiColor(serviceType, metricKey, value, kpiRanges);

    return (
        <View style={{ backgroundColor: "white", margin: 10, borderRadius: 10 }}>
            <View style={{ alignItems: "center", paddingVertical: 10 }}>
                <AnimatedCircularProgress
                    size={size}
                    width={width}
                    fill={value}
                    arcSweepAngle={180}
                    rotation={-90}
                    tintColor={color}
                    backgroundColor="#e8e8e8"
                >
                    {() => (
                        <Text style={{ fontSize: 22, fontWeight: "bold", color }}>
                            ₹ {Math.round(value)}
                        </Text>
                    )}
                </AnimatedCircularProgress>
            </View>
            <View style={{ alignItems: "center", paddingBottom: 10 }}>
                <Text style={{ fontSize: 16, fontWeight: "600" }}>{label}</Text>
            </View>
        </View>
    );
}
