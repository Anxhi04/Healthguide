
export interface PrivacySettings {
    publicProfile: boolean;
}

export interface NotificationSettings {
    helpRequests: boolean;
    comments: boolean;
    reviews: boolean;
}

export interface UserSettings {
    notifications: NotificationSettings;
    privacy: PrivacySettings;
}