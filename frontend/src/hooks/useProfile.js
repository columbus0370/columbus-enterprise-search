import { useState } from 'react';

const STORAGE_KEY = 'user_profile';

const DEFAULT_PROFILE = {
  name: '',
  title: '',
  company: '',
  email: '',
  phone: '',
  service: '',
};

export const useProfile = () => {
  const [profile, setProfileState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULT_PROFILE, ...JSON.parse(saved) } : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  const saveProfile = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setProfileState(data);
  };

  const hasProfile = Boolean(profile.name || profile.company);

  return { profile, saveProfile, hasProfile };
};
