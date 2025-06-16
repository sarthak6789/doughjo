import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '@/constants/Theme';
import { useAuth } from '@/contexts/AuthContext';
import { User, Check, Camera, Upload } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';

export default function UsernameSetupScreen() {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const { user, profile, updateProfile } = useAuth();

  React.useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
      setDisplayName(profile.full_name || '');
      setProfileImage(profile.avatar_url || null);
    }
  }, [profile]);

  const checkUsernameAvailability = async (usernameToCheck: string) => {
    if (usernameToCheck.length < 3) {
      setIsAvailable(null);
      return;
    }

    setCheckingAvailability(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', usernameToCheck.toLowerCase())
        .neq('id', user?.id) // Exclude current user
        .single();

      if (error && error.code === 'PGRST116') {
        // No rows returned, username is available
        setIsAvailable(true);
      } else if (data) {
        // Username exists
        setIsAvailable(false);
      }
    } catch (error) {
      console.error('Error checking username:', error);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleUsernameChange = (text: string) => {
    // Only allow alphanumeric characters and underscores
    const cleanText = text.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(cleanText);
    
    // Debounce username availability check
    if (cleanText.length >= 3) {
      const timeoutId = setTimeout(() => {
        checkUsernameAvailability(cleanText);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    } else {
      setIsAvailable(null);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload a profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadImage = async (imageUri: string): Promise<string | null> => {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      const fileExt = imageUri.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleSaveProfile = async () => {
    if (!username || username.length < 3) {
      Alert.alert('Error', 'Username must be at least 3 characters long');
      return;
    }

    if (!displayName.trim()) {
      Alert.alert('Error', 'Display name is required');
      return;
    }

    if (!isAvailable && username !== profile?.username) {
      Alert.alert('Error', 'Please choose an available username');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User not found');
      return;
    }

    setLoading(true);
    try {
      let avatarUrl = profile?.avatar_url;

      // Upload new profile image if one was selected
      if (profileImage && profileImage !== profile?.avatar_url) {
        const uploadedUrl = await uploadImage(profileImage);
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
        }
      }

      const { error } = await updateProfile({
        username: username.toLowerCase(),
        full_name: displayName.trim(),
        avatar_url: avatarUrl,
      });

      if (error) {
        throw error;
      }

      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const getUsernameStatus = () => {
    if (username.length < 3) {
      return { color: Colors.text.tertiary, text: 'Minimum 3 characters' };
    }
    if (checkingAvailability) {
      return { color: Colors.text.secondary, text: 'Checking availability...' };
    }
    if (isAvailable === true || username === profile?.username) {
      return { color: Colors.accent.green, text: 'Username available!' };
    }
    if (isAvailable === false) {
      return { color: Colors.accent.red, text: 'Username taken' };
    }
    return { color: Colors.text.tertiary, text: '' };
  };

  const status = getUsernameStatus();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Complete Your Profile</Text>
        <Text style={styles.subtitle}>
          Set up your profile information to get started with DoughJo.
        </Text>
      </View>

      <View style={styles.form}>
        {/* Profile Picture Section */}
        <View style={styles.profilePictureSection}>
          <TouchableOpacity style={styles.profilePictureContainer} onPress={pickImage}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profilePicture} />
            ) : (
              <View style={styles.profilePicturePlaceholder}>
                <Camera color={Colors.text.tertiary} size={32} />
              </View>
            )}
            <View style={styles.uploadIcon}>
              <Upload color={Colors.background.primary} size={16} />
            </View>
          </TouchableOpacity>
          <Text style={styles.profilePictureLabel}>Tap to add profile picture</Text>
        </View>

        {/* Display Name */}
        <View style={styles.inputContainer}>
          <User color={Colors.text.tertiary} size={20} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Display Name"
            placeholderTextColor={Colors.text.tertiary}
            value={displayName}
            onChangeText={setDisplayName}
            autoComplete="name"
            maxLength={50}
          />
        </View>

        {/* Username */}
        <View style={styles.inputContainer}>
          <Text style={styles.atSymbol}>@</Text>
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor={Colors.text.tertiary}
            value={username}
            onChangeText={handleUsernameChange}
            autoCapitalize="none"
            autoComplete="username"
            maxLength={20}
          />
          {(isAvailable === true || username === profile?.username) && (
            <Check color={Colors.accent.green} size={20} style={styles.checkIcon} />
          )}
        </View>

        {status.text && (
          <Text style={[styles.statusText, { color: status.color }]}>
            {status.text}
          </Text>
        )}

        <View style={styles.guidelines}>
          <Text style={styles.guidelinesTitle}>Profile Guidelines:</Text>
          <Text style={styles.guidelineItem}>• Display name: Your real name or preferred name</Text>
          <Text style={styles.guidelineItem}>• Username: 3-20 characters, letters, numbers, underscores only</Text>
          <Text style={styles.guidelineItem}>• Profile picture: Optional but recommended</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.saveButton,
            (!isAvailable && username !== profile?.username || !displayName.trim() || loading) && styles.saveButtonDisabled
          ]}
          onPress={handleSaveProfile}
          disabled={(!isAvailable && username !== profile?.username) || !displayName.trim() || loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Complete Setup'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.xxxl,
    color: Colors.text.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  profilePictureSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  profilePictureContainer: {
    position: 'relative',
    marginBottom: SPACING.sm,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.full,
  },
  profilePicturePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.card.border,
    borderStyle: 'dashed',
  },
  uploadIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.accent.teal,
    borderRadius: BORDER_RADIUS.full,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background.primary,
  },
  profilePictureLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.sm,
    color: Colors.text.secondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  atSymbol: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.md,
    color: Colors.text.tertiary,
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
    color: Colors.text.primary,
    paddingVertical: SPACING.sm,
  },
  checkIcon: {
    marginLeft: SPACING.sm,
  },
  statusText: {
    fontFamily: 'Inter-Medium',
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  guidelines: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  guidelinesTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.md,
    color: Colors.text.primary,
    marginBottom: SPACING.sm,
  },
  guidelineItem: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.sm,
    color: Colors.text.secondary,
    marginBottom: SPACING.xs,
  },
  saveButton: {
    backgroundColor: Colors.accent.teal,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.md,
    color: Colors.background.primary,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  skipButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: FONT_SIZE.md,
    color: Colors.text.tertiary,
  },
});