jest.mock("@expo/vector-icons", () => {
    const React = require("react");
    const { Text } = require("react-native");

    const mockIcon = props => <Text {...props}>{props.name}</Text>;

    return {
        Ionicons: mockIcon,
        Entypo: mockIcon,
        FontAwesome: mockIcon,
        FontAwesome6: mockIcon,
    };
});

jest.mock("@react-native-async-storage/async-storage", () =>
    require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key) => key,
        i18n: {
            changeLanguage: () => new Promise(() => {}),
        },
    }),
}));

jest.mock("expo-image", () => {
    const React = require("react");
    const { Image } = require("react-native");
    return { Image: (props) => <Image {...props} /> };
});

jest.mock("react-native-mmkv", () => ({
    createMMKV: () => ({
        set: jest.fn(),
        getString: jest.fn(),
        getNumber: jest.fn(),
        getBoolean: jest.fn(),
        delete: jest.fn(),
        clearAll: jest.fn(),
        contains: jest.fn(),
        getAllKeys: jest.fn(() => []),
    }),
}));

jest.mock("@react-native-google-signin/google-signin", () => ({
    GoogleSignin: {
        configure: jest.fn(),
        hasPlayServices: jest.fn().mockResolvedValue(true),
        signIn: jest.fn().mockResolvedValue({ data: { idToken: "mock-token" } }),
        signOut: jest.fn().mockResolvedValue(null),
    },
    statusCodes: {
        SIGN_IN_CANCELLED: "SIGN_IN_CANCELLED",
        IN_PROGRESS: "IN_PROGRESS",
        PLAY_SERVICES_NOT_AVAILABLE: "PLAY_SERVICES_NOT_AVAILABLE",
    },
    isErrorWithCode: jest.fn(() => false),
}));

jest.mock("@react-native-community/netinfo", () =>
    require("@react-native-community/netinfo/jest/netinfo-mock.js")
);
