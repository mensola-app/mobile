import React, { useState } from "react";
import { View, Text, Switch, TouchableOpacity, Alert } from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet from "@/components/BottomSheet";
import TextField from "@/components/TextField";
import Button from "@/components/Button";
import { Colors } from "@/constants/colors";
import { MovieService } from "@/services/movie.service";
import { PlaylistService } from "@/services/playlist.service";
import { StorageService } from "@/services/storage.service";
import { useTranslation } from "react-i18next";
import { styles } from "./styles";

interface Props {
    isVisible: boolean;
    onClose: () => void;
    type: "movie-lists" | "playlists";
    onSuccess: () => void;
}

export default function CreateListBottomSheet({ isVisible, onClose, type, onSuccess }: Props) {
    const { t } = useTranslation();
    const isMovie = type === "movie-lists";

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
    const [isPrivate, setIsPrivate] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setSelectedImageUri(null);
        setIsPrivate(false);
        setError(null);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const pickImageHandler = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert(
                t("lists.create.photoPermissionErrorTitle"),
                t("lists.create.photoPermissionErrorBody"),
            );
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: isMovie ? [2, 3] : [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setSelectedImageUri(result.assets[0].uri);
            if (error) setError(null);
        }
    };

    const handleCreate = async () => {
        if (!title.trim()) {
            setError(t("lists.create.errorTitleRequired"));
            return;
        }

        setError(null);
        setIsLoading(true);

        try {
            let uploadedImageUrl: string | undefined = undefined;

            if (selectedImageUri) {
                try {
                    const uploadRes = await StorageService.uploadCover(selectedImageUri);
                    uploadedImageUrl = uploadRes.data?.imageUrl;
                } catch {
                    setError(t("lists.create.photoUploadError"));
                    setIsLoading(false);
                    return;
                }
            }

            if (isMovie) {
                await MovieService.createList({
                    title: title.trim(),
                    description: description.trim() || undefined,
                    image: uploadedImageUrl,
                    isPrivate,
                });
            } else {
                await PlaylistService.createPlaylist({
                    title: title.trim(),
                    description: description.trim() || undefined,
                    image: uploadedImageUrl,
                    isPrivate,
                });
            }

            resetForm();
            onSuccess();
            onClose();
        } catch (err: any) {
            const msg = err?.error?.message || err?.message || t("lists.create.errorGeneral");
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <BottomSheet
            isVisible={isVisible}
            onClose={handleClose}
            title={isMovie ? t("lists.create.titleMovie") : t("lists.create.titleTrack")}>
            <View style={styles.container}>
                <View style={styles.headerRow}>
                    <TouchableOpacity
                        testID="create-list-image-picker"
                        activeOpacity={0.8}
                        onPress={pickImageHandler}
                        style={[
                            styles.imagePicker,
                            isMovie ? styles.movieImagePicker : styles.playlistImagePicker,
                            Boolean(selectedImageUri) && styles.imagePickerActive,
                        ]}>
                        {selectedImageUri ? (
                            <>
                                <Image
                                    source={{ uri: selectedImageUri }}
                                    style={styles.previewImage}
                                    contentFit="cover"
                                />
                                <TouchableOpacity
                                    testID="create-list-remove-image"
                                    activeOpacity={0.7}
                                    style={styles.removeBadge}

                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    onPress={(e) => {
                                        e?.stopPropagation?.();
                                        setSelectedImageUri(null);
                                    }}>
                                    <Ionicons name="close" size={12} color="#FFFFFF" />
                                </TouchableOpacity>
                            </>
                        ) : (
                            <View style={styles.placeholderContainer}>
                                <Ionicons
                                    name={isMovie ? "film-outline" : "musical-notes-outline"}
                                    size={isMovie ? 24 : 28}
                                    color={Colors.textMuted}
                                />
                                <View style={styles.addBadge}>
                                    <Ionicons name="camera" size={11} color="#FFFFFF" />
                                </View>
                            </View>
                        )}
                    </TouchableOpacity>

                    <View style={styles.titleWrapper}>
                        <TextField
                            label={t("lists.create.nameLabel")}
                            placeholder={isMovie ? t("lists.create.namePlaceholderMovie") : t("lists.create.namePlaceholderTrack")}
                            value={title}
                            onChangeText={(text) => {
                                setTitle(text);
                                if (error) setError(null);
                            }}
                            style={styles.titleInput}
                        />
                    </View>
                </View>

                <TextField
                    label={t("lists.create.descriptionLabel")}
                    placeholder={t("lists.create.descriptionPlaceholder")}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={3}
                />

                <View style={styles.switchRow}>
                    <View style={styles.switchLabelGroup}>
                        <Text style={styles.switchLabel}>{t("lists.create.privateLabel")}</Text>
                        <Text style={styles.switchDesc}>
                            {t("lists.create.privateListDesc")}
                        </Text>
                    </View>
                    <Switch
                        value={isPrivate}
                        onValueChange={setIsPrivate}
                        trackColor={{ false: Colors.surface, true: Colors.primary }}
                        thumbColor="#FFFFFF"
                    />
                </View>

                {error && <Text style={styles.errorText}>{error}</Text>}

                <Button
                    label={t("lists.create.submitButton")}
                    onPress={handleCreate}
                    disabled={isLoading}
                    isLoading={isLoading}
                    style={styles.submitBtn}
                />
            </View>
        </BottomSheet>
    );
}

