import React, { useState, useEffect } from "react";
import { View, Text, Switch, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
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
    listId: string;
    initialTitle?: string;
    initialDescription?: string;
    initialImage?: string | null;
    initialIsPrivate?: boolean;
    onSuccess: () => void;
    onDeleteSuccess?: () => void;
}

export default function EditListBottomSheet({
    isVisible,
    onClose,
    type,
    listId,
    initialTitle = "",
    initialDescription = "",
    initialImage = null,
    initialIsPrivate = false,
    onSuccess,
    onDeleteSuccess,
}: Props) {
    const { t } = useTranslation();
    const isMovie = type === "movie-lists";

    const [title, setTitle] = useState(initialTitle);
    const [description, setDescription] = useState(initialDescription);
    const [selectedImageUri, setSelectedImageUri] = useState<string | null>(initialImage);
    const [isImageChanged, setIsImageChanged] = useState(false);
    const [isImageRemoved, setIsImageRemoved] = useState(false);
    const [isPrivate, setIsPrivate] = useState(initialIsPrivate);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        if (isVisible) {
            setTitle(initialTitle);
            setDescription(initialDescription);
            setSelectedImageUri(initialImage);
            setIsImageChanged(false);
            setIsImageRemoved(false);
            setIsPrivate(initialIsPrivate);
            setError(null);
        }
    }, [isVisible, initialTitle, initialDescription, initialImage, initialIsPrivate]);

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
            setIsImageChanged(true);
            setIsImageRemoved(false);
            if (error) setError(null);
        }
    };

    const handleRemoveImage = () => {
        setSelectedImageUri(null);
        setIsImageChanged(true);
        setIsImageRemoved(true);
    };

    const handleSave = async () => {
        if (!title.trim()) {
            setError(t("lists.create.errorTitleRequired"));
            return;
        }

        setError(null);
        setIsLoading(true);

        try {
            let finalImageUrl: string | null | undefined = initialImage;

            if (isImageChanged) {
                if (selectedImageUri) {
                    try {
                        const uploadRes = await StorageService.uploadCover(selectedImageUri);
                        finalImageUrl = uploadRes.data?.imageUrl;
                    } catch {
                        setError(t("lists.create.photoUploadError"));
                        setIsLoading(false);
                        return;
                    }
                } else if (isImageRemoved) {
                    finalImageUrl = null;
                }
            }

            if (isMovie) {
                await MovieService.updateList(listId, {
                    title: title.trim(),
                    description: description.trim() || null,
                    image: finalImageUrl,
                    isPrivate,
                });
            } else {
                await PlaylistService.updatePlaylist(listId, {
                    title: title.trim(),
                    description: description.trim() || null,
                    image: finalImageUrl,
                    isPrivate,
                });
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            const msg = err?.error?.message || err?.message || t("lists.edit.errorGeneral");
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteConfirm = () => {
        Alert.alert(
            t("lists.edit.deleteConfirmTitle"),
            t("lists.edit.deleteConfirmBody"),
            [
                { text: t("common.cancel", { defaultValue: "Vazgeç" }), style: "cancel" },
                {
                    text: t("lists.edit.delete"),
                    style: "destructive",
                    onPress: handleDelete,
                },
            ],
        );
    };

    const handleDelete = async () => {
        setError(null);
        setIsDeleting(true);

        try {
            if (isMovie) {
                await MovieService.deleteList(listId);
            } else {
                await PlaylistService.deletePlaylist(listId);
            }

            onClose();
            if (onDeleteSuccess) {
                onDeleteSuccess();
            } else {
                router.back();
            }
        } catch (err: any) {
            const msg = err?.error?.message || err?.message || t("lists.edit.errorDelete");
            setError(msg);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <BottomSheet
            isVisible={isVisible}
            onClose={onClose}
            title={isMovie ? t("lists.edit.titleMovie") : t("lists.edit.titleTrack")}>
            <View style={styles.container}>
                <View style={styles.headerRow}>
                    <TouchableOpacity
                        testID="edit-list-image-picker"
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
                                    testID="edit-list-remove-image"
                                    activeOpacity={0.7}
                                    style={styles.removeBadge}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    onPress={(e) => {
                                        e?.stopPropagation?.();
                                        handleRemoveImage();
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
                    label={t("lists.edit.submitButton")}
                    onPress={handleSave}
                    disabled={isLoading || isDeleting}
                    isLoading={isLoading}
                    style={styles.submitBtn}
                />

                <Button
                    testID="edit-list-delete-button"
                    label={t("lists.edit.deleteButton")}
                    onPress={handleDeleteConfirm}
                    disabled={isLoading || isDeleting}
                    isLoading={isDeleting}
                    style={styles.deleteBtn}
                    labelStyle={styles.deleteBtnLabel}
                />
            </View>
        </BottomSheet>
    );
}

