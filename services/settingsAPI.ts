
export interface UserSettings {
  notifications: NotificationSettings;
  security: SecuritySettings;
  profile?: UserProfile;
  lastUpdated: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  specialty: string;
  licenseNumber: string;
  role: string;
}

export interface NotificationSettings {
  desktopNotifications: boolean;
  soundAlerts: boolean;
  emailSummaries: boolean;
}

export interface SecuritySettings {
  autoLockTime: string;
}

const mockSettings: UserSettings = {
  notifications: {
    desktopNotifications: true,
    soundAlerts: true,
    emailSummaries: false
  },
  security: {
    autoLockTime: '15 minutes'
  },
  lastUpdated: new Date().toISOString()
};

const settingsAPI = {
  getUserSettings: async (): Promise<UserSettings> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockSettings;
  },
  
  updateNotificationSettings: async (settings: NotificationSettings): Promise<NotificationSettings> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return settings;
  },
  
  updateSecuritySettings: async (settings: SecuritySettings): Promise<SecuritySettings> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return settings;
  },
  
  updateUserProfile: async (profile: UserProfile): Promise<UserProfile> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return profile;
  }
};

export default settingsAPI;
