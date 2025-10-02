'use client'

import React, { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';
import UniversityCard from '@/components/ui/UniversityCard/UniversityCard';
import Cookies from 'js-cookie';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchData } from '@/api/api';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Dog, Cat, PersonStanding, RectangleCircle, LucidePoundSterling, ShieldQuestionMark } from "lucide-react"

interface MultilingualField {
  en: string;
  ru: string;
  tm: string;
}

interface University {
  id: number;
  photolr1: string | null;
  name: MultilingualField;
  description: MultilingualField;
  specials: MultilingualField | null;
  financing: MultilingualField | null;
  duration: MultilingualField | null;
  applicationDeadline: string | null;
  gender: MultilingualField | null;
  age: number | null;
  others: MultilingualField | null;
  medicine: MultilingualField | null;
  salary: MultilingualField | null;
  donitory: MultilingualField | null;
  rewards: MultilingualField | null;
  others_p: MultilingualField | null;
  officialLink: string;
}

// Profile Icons Array
const PROFILE_ICONS = [
    { id: "Dog" },
    { id: "Cat" },
    { id: "PersonStanding" },
    { id: "RectangleCircle" },
    { id: "LucidePoundSterling" }, 
    { id: "ShieldQuestionMark" }
  ];

// Icon Selector Modal Component
interface IconSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (iconId: string) => void;
  currentIconId?: string;
}

const IconSelectorModal: React.FC<IconSelectorModalProps> = ({ 
  isOpen, 
  onClose, 
  onSelect,
  currentIconId 
}) => {
  const t = useTranslations();

  const handleSelect = (iconId: string) => {
    onSelect(iconId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Choose Profile Icon</h2>
          <button 
            className={styles.closeButton} 
            onClick={onClose}
            type="button"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        
        <div className={styles.iconGrid}>
          {PROFILE_ICONS.map((icon) => (
            <button
              key={icon.id}
              className={`${styles.iconOption} ${currentIconId === icon.id ? styles.iconSelected : ''}`}
              onClick={() => handleSelect(icon.id)}
              type="button"
            >
              <div 
                className={styles.iconPreview}
              >
                {icon.id === "Dog" && <Dog size={48} />}
                {icon.id === "Cat" && <Cat size={48} />}
                {icon.id === "PersonStanding" && <PersonStanding size={48} />}
                {icon.id === "RectangleCircle" && <RectangleCircle size={48} />}
                {icon.id === "LucidePoundSterling" && <LucidePoundSterling size={48} />}
                {icon.id === "ShieldQuestionMark" && <ShieldQuestionMark size={48} />}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: any;
  onSave: (data: any) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, profileData, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  const [errors, setErrors] = useState<{name?: string; email?: string}>({});
  const t = useTranslations("ProfilePage.editModal");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && isOpen && profileData) {
      setFormData({
        name: profileData?.name || '',
        email: profileData?.email || '',
      });
    }
  }, [isMounted, isOpen, profileData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: {name?: string; email?: string} = {};
    
    if (!formData.name.trim()) {
      newErrors.name = t('errors.nameRequired');
    }
    
    if (!formData.email.trim()) {
      newErrors.email = t('errors.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('errors.emailInvalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleClose = () => {
    if (isMounted && profileData) {
      setFormData({
        name: profileData?.name || '',
        email: profileData?.email || '',
      });
    }
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>{t('title')}</h2>
          <button 
            className={styles.closeButton} 
            onClick={handleClose}
            type="button"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label htmlFor="name">{t('form.name')} *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={errors.name ? styles.inputError : ''}
              placeholder={t('form.namePlaceholder')}
            />
            {errors.name && <span className={styles.errorText}>{errors.name}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">{t('form.email')} *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? styles.inputError : ''}
              placeholder={t('form.emailPlaceholder')}
            />
            {errors.email && <span className={styles.errorText}>{errors.email}</span>}
          </div>

          <div className={styles.modalActions}>
            <button 
              type="button" 
              className={styles.cancelButton}
              onClick={handleClose}
            >
              {t('buttons.cancel')}
            </button>
            <button 
              type="submit" 
              className={styles.saveButton}
            >
              {t('buttons.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isIconModalOpen, setIsIconModalOpen] = useState(false);
  const [selectedIconId, setSelectedIconId] = useState<string>('default');
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [favoriteUniversities, setFavoriteUniversities] = useState<University[]>([]);
  const [allUniversities, setAllUniversities] = useState<University[]>([]);
  const [isClient, setIsClient] = useState(false);
  const queryClient = useQueryClient();
  const token = Cookies.get('auth_token');
  const t = useTranslations("ProfilePage");
  const ts = useTranslations("Header");
  const locale = useLocale();
  const router = useRouter();

  // Set client-side flag and load saved icon
  useEffect(() => {
    setIsClient(true);
    
    // Load saved icon from localStorage
    const savedIconId = localStorage.getItem('profile_icon');
    if (savedIconId && PROFILE_ICONS.find(icon => icon.id === savedIconId)) {
      setSelectedIconId(savedIconId);
    }
  }, []);

  // Fetch all universities to match with favorite IDs
  const { data: universitiesData } = useQuery({
    queryKey: ['universities'],
    queryFn: async () => await fetchData({ url: '/api/universities' })
  });

  // Set all universities when data loads
  useEffect(() => {
    if (universitiesData) {
      setAllUniversities(universitiesData);
    }
  }, [universitiesData]);

  // Get favorite university IDs from localStorage - CLIENT ONLY
  useEffect(() => {
    if (!isClient) return;

    const getFavoriteIds = () => {
      try {
        const favorites = localStorage.getItem('university_favorites');
        if (favorites) {
          const parsedFavorites = JSON.parse(favorites);
          if (Array.isArray(parsedFavorites)) {
            if (parsedFavorites.length > 0 && typeof parsedFavorites[0] === 'object') {
              const ids = parsedFavorites.map((uni: any) => uni.id).filter((id: number) => id != null);
              setFavoriteIds(ids);
              localStorage.setItem('university_favorites', JSON.stringify(ids));
            } else {
              setFavoriteIds(parsedFavorites.filter((id: any) => id != null));
            }
          } else {
            setFavoriteIds([]);
          }
        } else {
          setFavoriteIds([]);
        }
      } catch (error) {
        console.error('Error reading favorite universities from localStorage:', error);
        setFavoriteIds([]);
      }
    };

    getFavoriteIds();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'university_favorites') {
        getFavoriteIds();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isClient]);

  // Sync favorite universities with actual university data
  useEffect(() => {
    if (allUniversities.length > 0 && favoriteIds.length > 0) {
      const favUnis = allUniversities.filter((uni: University) => 
        favoriteIds.includes(uni.id)
      );
      setFavoriteUniversities(favUnis);
    } else {
      setFavoriteUniversities([]);
    }
  }, [allUniversities, favoriteIds]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['profileData'],
    queryFn: () => fetchData({ url: '/api/users/me', token: token }),
    enabled: !!token && isClient,
  });

  console.log(data);

  // Mutation for updating profile
  const updateProfileMutation = useMutation({
    mutationFn: (updatedData: any) => 
      fetchData({ 
        url: '/api/users/me', 
        token: token, 
        method: 'PATCH', 
        body: updatedData 
      }),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['profileData'], updatedProfile);
      setIsEditModalOpen(false);
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
    }
  });

  // Mutation for uploading photo
  const uploadPhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('id', data.id)
      
      console.log('Uploading file:', file.name, file.type, file.size);
      console.log('FormData entries:', Array.from(formData.entries()));
      
      const response = await fetchData({ 
        url: '/api/users/me/photo', 
        token: token, 
        method: 'PATCH', 
        body: formData,
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (!response) {
        throw new Error('Failed to upload photo');
      }

      return response;
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['profileData'], updatedProfile);
      setIsPhotoModalOpen(false);
    },
    onError: (error) => {
      console.error('Error uploading photo:', error);
    }
  });

  // Mutation for deleting photo
  const deletePhotoMutation = useMutation({
    mutationFn: async () => {
      const response = await fetchData({ 
        url: '/api/users/me/photo', 
        token: token, 
        method: 'DELETE'
      });

      if (!response) {
        throw new Error('Failed to delete photo');
      }

      return response;
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['profileData'], updatedProfile);
    },
    onError: (error) => {
      console.error('Error deleting photo:', error);
    }
  });

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = (updatedData: any) => {
    updateProfileMutation.mutate(updatedData);
  };

  const handleUploadPhoto = (file: File) => {
    uploadPhotoMutation.mutate(file);
  };

  const handleDeletePhoto = () => {
    if (window.confirm(t('confirmDeletePhoto') || 'Are you sure you want to delete your profile photo?')) {
      deletePhotoMutation.mutate();
    }
  };

  const handleSelectIcon = (iconId: string) => {
    setSelectedIconId(iconId);
    localStorage.setItem('profile_icon', iconId);
  };

  const getSelectedIcon = () => {
    return PROFILE_ICONS.find(icon => icon.id === selectedIconId) || PROFILE_ICONS[0];
  };

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  // Helper function to get display value from multilingual field
  const getDisplayValue = (field: MultilingualField | null, lang: keyof MultilingualField = 'en'): string => {
    if (!field) return '';
    return field[lang] || field.en || '';
  };

  if (!isClient) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <p>Loading</p>
        </div>
      </div>
    );
  }

  if (error || data?.statusCode === 401) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <p>{t('error')}</p>
          <button 
            onClick={() => handleNavigate('/login')}
            className={styles.loginButton}
          >
            {ts('nav.login')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.profileHeader}>
        <div className={styles.coverPhoto}>
          <div className={styles.profileImageContainer}>
            <div className={styles.profileImage}>
              {data?.photo ? (
                <img src={data.photo} alt="Profile" />
              ) : (getSelectedIcon().id === "Dog" ? <Dog size={64} /> :
                  getSelectedIcon().id === "Cat" ? <Cat size={64} /> :
                  getSelectedIcon().id === "PersonStanding" ? <PersonStanding size={64} /> :
                  getSelectedIcon().id === "RectangleCircle" ? <RectangleCircle size={64} /> :
                  getSelectedIcon().id === "LucidePoundSterling" ? <LucidePoundSterling size={64} /> :
                  getSelectedIcon().id === "ShieldQuestionMark" ? <ShieldQuestionMark size={64} /> :
                  <Dog size={64} />

              )}
            </div>
          </div>
        </div>
        
        <div className={styles.profileInfo}>
          <h1 className={styles.name}>{data?.name || t('noName')}</h1>
          <div className={styles.contactInfo}>
            <p className={styles.email}>{data?.email}</p>
          </div>
          <button 
            className={styles.editButton}
            onClick={handleEditProfile}
            disabled={updateProfileMutation.isPending}
          >
            {updateProfileMutation.isPending ? t('saving') : t('editProfile')}
          </button>
          <div className={styles.photoActions}>
            <button 
                className={styles.changeIconButton}
                onClick={() => setIsIconModalOpen(true)}
                title="Change Icon"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            {data?.photo && (
              <button 
                className={styles.deletePhotoButton}
                onClick={handleDeletePhoto}
                disabled={deletePhotoMutation.isPending}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                {deletePhotoMutation.isPending ? (t('deleting') || 'Deleting...') : (t('delete') || 'Delete')}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <section className={styles.likedUniversitiesSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('likedUniversities')}</h2>
          </div>
          <div className={styles.universitiesContainer}>
            {favoriteUniversities.length === 0 ? (
              <div className={styles.emptyState}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" 
                        stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
                <h3>{t('noLikedUniversities')}</h3>
                <button 
                  className={styles.exploreButton}
                  onClick={() => handleNavigate('/')}
                >
                  {t('exploreUniversities')}
                </button>
              </div>
            ) : (
              <div className={styles.universitiesContainer}>
                {favoriteUniversities.map((university: University) => (
                  <UniversityCard 
                    key={university.id} 
                    uni={university}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profileData={data}
        onSave={handleSaveProfile}
      />

      <IconSelectorModal
        isOpen={isIconModalOpen}
        onClose={() => setIsIconModalOpen(false)}
        onSelect={handleSelectIcon}
        currentIconId={selectedIconId}
      />
    </div>
  );
};

export default ProfilePage;