import { Colors } from "@/constants/colors";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        justifyContent: "flex-end",
    },
    sheetContainer: {
        backgroundColor: Colors.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        paddingTop: 12,
        // maxHeight ve paddingBottom, pencere boyutu/klavye/safe-area'ya göre runtime'da hesaplanır
        width: "100%",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    dragHandleArea: {
        width: "100%",
        alignItems: "center",
        paddingVertical: 8,
    },
    dragHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: Colors.primary,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        color: Colors.textPrimary,
        flex: 1,
    },
    closeButton: {
        padding: 4,
        marginLeft: 8,
    },
    content: {
        width: "100%",
    },
    scrollArea: {
        flexGrow: 0,
        flexShrink: 1,
    },
    staticArea: {
        flexShrink: 1,
    },
});

export { styles };
