'use client'

import React from 'react';
import { Building, MapPin, Star, Heart, X, Calendar, Users, DollarSign, Award, Home, Stethoscope } from "lucide-react";
import styles from "../../UniversitySwiper/UniversitySwiper.module.css";
import Link from 'next/link';
import Image from 'next/image';
import ReactDOM from 'react-dom';
import { useTranslations, useLocale } from 'next-intl';
import Cookies from 'js-cookie'
import { fetchData } from '@/api/api';
import { useRouter } from 'next/navigation';

interface MultilingualField {
  en: string;
  ru: string;
  tm: string;
}

interface University {
  id: number;
  photoUrl: string | null;
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

interface RatingData {
  universityId: number;
  average: number;
}

interface Props {
  uni: University;
  onToggleFavorite?: () => void;
}

// Local storage keys
const FAVORITES_KEY = 'university_favorites';
const ANALYTICS_KEY = 'university_analytics';

// Helper function to get user data
const getUserData = () => {
  try {
    const userData = Cookies.get('user_data')
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error reading user data:', error);
    return null;
  }
};

// Analytics helper functions
export const getAnalytics = (): Record<number, number> => {
  try {
    const stored = typeof window !== "undefined" && localStorage.getItem(ANALYTICS_KEY);
    if (!stored) return {};
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error reading analytics from localStorage:', error);
    return {};
  }
};

export const trackUniversityClick = (universityId: number) => {
  try {
    const analytics = getAnalytics();
    const currentCount = analytics[universityId] || 0;
    analytics[universityId] = currentCount + 1;
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics));
    console.log(`University ${universityId} clicked. Total clicks: ${analytics[universityId]}`);
  } catch (error) {
    console.error('Error tracking university click:', error);
  }
};

export const getUniversityClicks = (universityId: number): number => {
  try {
    const analytics = getAnalytics();
    return analytics[universityId] || 0;
  } catch (error) {
    console.error('Error getting university clicks:', error);
    return 0;
  }
};

export const clearAnalytics = () => {
  try {
    localStorage.removeItem(ANALYTICS_KEY);
    console.log('Analytics cleared');
  } catch (error) {
    console.error('Error clearing analytics:', error);
  }
};

// Helper function to get display value from multilingual field
const getDisplayValue = (field: MultilingualField | null, lang: keyof MultilingualField): string => {
  if (!field) return '';
  return field[lang] || field.en || '';
};

// Helper functions for localStorage operations
export const getFavorites = (): number[] => {
  try {
    const stored = typeof window !== "undefined" && localStorage.getItem(FAVORITES_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    // Handle both old format (full objects) and new format (IDs only)
    if (Array.isArray(parsed)) {
      if (parsed.length > 0 && typeof parsed[0] === 'object') {
        // Convert old format to new format (IDs only)
        const ids = parsed.map((uni: any) => uni.id).filter((id: number) => id != null);
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
        return ids;
      }
      return parsed.filter((id: any) => id != null);
    }
    return [];
  } catch (error) {
    console.error('Error reading favorites from localStorage:', error);
    return [];
  }
};

export const saveFavorite = (universityId: number) => {
  try {
    const favorites = getFavorites();
    const isAlreadyFavorite = favorites.includes(universityId);
    
    if (!isAlreadyFavorite) {
      const updatedFavorites = [...favorites, universityId];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
    }
  } catch (error) {
    console.error('Error saving favorite to localStorage:', error);
  }
};

export const removeFavorite = (universityId: number) => {
  try {
    const favorites = getFavorites();
    const updatedFavorites = favorites.filter(id => id !== universityId);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
    window.location.reload()
  } catch (error) {
    console.error('Error removing favorite from localStorage:', error);
  }
};

export const isFavoriteUniversity = (universityId: number): boolean => {
  try {
    const favorites = getFavorites();
    return favorites.includes(universityId);
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
};

// Check if user is logged in
export const isUserLoggedIn = (): boolean => {
  return !!getUserData();
};

// Rating API functions
const fetchRating = async (universityId: number): Promise<RatingData | null> => {
  try {
    const response = await fetchData({ url: `/api/universities/${universityId}/ratings/average` });
    console.log(" fetch rating:  ",response);
    
      if (!response) {
        return null; // No ratings yet
      throw new Error('Failed to fetch rating');
    }
    return await response;
  } catch (error) {
    console.error('Error fetching rating:', error);
    return null;
  }
};

const submitRating = async (universityId: number, score: number): Promise<boolean> => {
  try {
    const userData = getUserData();
    if (!userData) {
      throw new Error('User not logged in');
    }

    const response = await fetchData({ url: `/api/universities/${universityId}/ratings`, method: 'POST', body: { userId: userData.id, score: score } });

    console.log("post rating: ", response);
    
    if (!response) {
      throw new Error('Failed to submit rating');
    }

    return true;
  } catch (error) {
    console.error('Error submitting rating:', error);
    return false;
  }
};

// Star Rating Component
interface StarRatingProps {
  rating: number;
  onRate?: (rating: number) => void;
  readonly?: boolean;
  size?: number;
}

function StarRating({ rating, onRate, readonly = false, size = 20 }: StarRatingProps) {
  const [hoverRating, setHoverRating] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleStarClick = async (starRating: number) => {
    if (readonly || isSubmitting || !onRate) return;
    
    setIsSubmitting(true);
    await onRate(starRating);
    setIsSubmitting(false);
  };

  const displayRating = readonly ? rating : (hoverRating || rating);

  return (
    <div className={styles.starRating} style={{ opacity: isSubmitting ? 0.5 : 1 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={`${styles.star} ${!readonly ? styles.clickableStar : ''}`}
          fill={star <= displayRating ? "#ffd700" : "none"}
          stroke={star <= displayRating ? "#ffd700" : "#ccc"}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
          onClick={() => handleStarClick(star)}
          style={{ cursor: readonly ? 'default' : 'pointer' }}
        />
      ))}
      {readonly && rating > 0 && (
        <span className={styles.ratingText}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

// Modal Component (unchanged, only showing the card part)
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  university: University;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  isUserLoggedIn: boolean;
}

function UniversityModal({ isOpen, onClose, university, isFavorite, onToggleFavorite, isUserLoggedIn }: ModalProps) {
  const [mounted, setMounted] = React.useState(false);
  const [rating, setRating] = React.useState<number>(0);
  const [hasRated, setHasRated] = React.useState(false);
  const [isLoadingRating, setIsLoadingRating] = React.useState(true);
  const t = useTranslations("UniversityCard.modal");
  const locale = useLocale() as keyof MultilingualField;
  const router = useRouter()

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      loadRating();
    }
  }, [isOpen, university.id]);

  const loadRating = async () => {
    setIsLoadingRating(true);
    const ratingData = await fetchRating(university.id);
    if (ratingData) {
      setRating(ratingData.average);
      setHasRated(true);
    } else {
      setRating(0);
      setHasRated(false);
    }
    setIsLoadingRating(false);
  };

  if (!isOpen || !mounted) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isUserLoggedIn) {
      const proceed = window.confirm(t('authPrompt'));
      if (proceed) {
        window.location.href = '/login';
      }
      return;
    }
    onToggleFavorite();
  };

  const handleRating = async (newRating: number) => {
    if (!isUserLoggedIn) {
      const proceed = window.confirm(t('authPrompt'));
      if (proceed) {
        window.location.href = '/login';
      }
      return;
    }

    const success = await submitRating(university.id, newRating);
    if (success) {
      setRating(newRating);
      setHasRated(true);
      setTimeout(loadRating, 500);
      location.reload()
    } else {
      alert('Failed to submit rating. Please try again.');
    }
  };

  const InfoSection = ({ title, value, icon: Icon, style }: { title: string; value: string | null; icon: any, style?: React.CSSProperties }) => {
    if (!value) return null;
    
    return (
      <div className={styles.infoSection} style={{...style}}>
        <div className={styles.infoHeader}>
          <Icon size={24} />
          <h4>{title}</h4>
        </div>
        <p>{value}</p>
      </div>
    );
  };

  const modalContent = (
    <div className={styles.fullScreenModalOverlay} onClick={handleOverlayClick}>
      <div className={styles.fullScreenModalContent}>
        <div className={styles.fullScreenModalHeader}>
          <div className={styles.headerContent}>
            <div className={styles.headerImage}>
              {university.photoUrl ? (
                <Image 
                  src={university.photoUrl} 
                  alt={getDisplayValue(university.name, locale)} 
                  fill 
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <Building size={80} />
              )}
            </div>
            <div className={styles.headerInfo}>
              <h1>{getDisplayValue(university.name, locale)}</h1>
              <p className={styles.headerDescription}>{getDisplayValue(university.description, locale)}</p>
              
              <div className={styles.modalRatingSection}>
                {isLoadingRating ? (
                  <div className={styles.loadingRating}>Loading rating...</div>
                ) : hasRated ? (
                  <div className={styles.ratingDisplay}>
                    <StarRating rating={rating} onRate={handleRating} size={24} />
                  </div>
                ) : (
                  <div className={styles.ratingInput}>
                    <p className={styles.ratePrompt}>Rate this university:</p>
                    <StarRating rating={0} onRate={handleRating} size={24} />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className={styles.headerActions}>
            <button
              className={`${styles.fullScreenLikeBtn} ${isFavorite ? styles.liked : ""} ${!isUserLoggedIn ? styles.disabled : ""}`}
              onClick={handleFavoriteClick}
              title={isUserLoggedIn ? 
                (isFavorite ? t('buttons.removeFavorite') : t('buttons.addFavorite')) : 
                t('buttons.loginRequired')}
            >
              <Heart size={24} fill={isFavorite ? "#ff0000" : "none"} />
              {isFavorite ? t('buttons.removeFavorite') : t('buttons.addFavorite')}
            </button>
            
            {university.officialLink && (
              <Link 
                href={university.officialLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.fullScreenWebsiteButton}
                onClick={(e) => e.stopPropagation()}
              >
                {t('buttons.visitWebsite')}
              </Link>
            )}
            
            <button className={styles.closeFullScreenButton} onClick={onClose}>
              <X size={24} />
            </button>
          </div>
        </div>

        <div className={styles.fullScreenModalBody}>
          <div className={styles.detailsGrid}>
            <InfoSection 
              title={t('sections.specializations')} 
              value={getDisplayValue(university.specials, locale)} 
              icon={Award} 
            />
            
            <InfoSection 
              title={t('sections.financing')} 
              value={getDisplayValue(university.financing, locale)} 
              icon={DollarSign} 
            />
            
            <InfoSection 
              title={t('sections.duration')} 
              value={getDisplayValue(university.duration, locale)} 
              icon={Calendar} 
            />
            
            <InfoSection 
              title={t('sections.deadline')} 
              value={university.applicationDeadline} 
              icon={Calendar} 
            />
            
            <InfoSection 
              title={t('sections.gender')} 
              value={getDisplayValue(university.gender, locale)} 
              icon={Users} 
            />
            
            <InfoSection 
              title={t('sections.age')} 
              value={university.age ? university.age.toString() : null} 
              icon={Users} 
            />
            
            <InfoSection 
              title={t('sections.medical')} 
              value={getDisplayValue(university.medicine, locale)} 
              icon={Stethoscope} 
            />
            
            <InfoSection 
              title={t('sections.salary')} 
              value={getDisplayValue(university.salary, locale)} 
              icon={DollarSign} 
            />
            
            <InfoSection 
              title={t('sections.donitory')} 
              value={getDisplayValue(university.donitory, locale)} 
              icon={Home} 
            />
            
            <InfoSection 
              title={t('sections.scholarships')} 
              value={getDisplayValue(university.rewards, locale)} 
              icon={Award} 
            />
            
            <InfoSection 
              title={t('sections.otherInfo')} 
              value={getDisplayValue(university.others, locale)} 
              icon={Award} 
            />
            
            <InfoSection 
              title={t('sections.additionalDetails')} 
              value={getDisplayValue(university.others_p, locale)} 
              icon={Award} 
              style={{ gridColumn: '1 / -1' }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(
    modalContent,
    document.body
  );
}

export default function UniversityCard({ uni, onToggleFavorite }: Props) {
  const [localIsFavorite, setLocalIsFavorite] = React.useState(() => {
    return isFavoriteUniversity(uni.id);
  });
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = React.useState(false);
  const [rating, setRating] = React.useState<number>(0);
  const [hasRating, setHasRating] = React.useState(false);
  const [isLoadingRating, setIsLoadingRating] = React.useState(true);
  const t = useTranslations("UniversityCard");
  const locale = useLocale() as keyof MultilingualField;

  React.useEffect(() => {
    setLocalIsFavorite(isFavoriteUniversity(uni.id));
    setIsUserLoggedIn(!!getUserData());
    loadCardRating();
  }, [uni.id]);

  const loadCardRating = async () => {
    setIsLoadingRating(true);
    const ratingData = await fetchRating(uni.id);
    console.log("id: ", uni.id, "rating: ",ratingData);
    
    if (ratingData) {
      setRating(ratingData.average);
      setHasRating(true);
    } else {
      setRating(0);
      setHasRating(false);
    }
    setIsLoadingRating(false);
  };

  React.useEffect(() => {
    const handleStorageChange = () => {
      setIsUserLoggedIn(!!getUserData());
      setLocalIsFavorite(isFavoriteUniversity(uni.id));
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [uni.id]);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isUserLoggedIn) {
      const proceed = window.confirm(t('authPrompt'));
      if (proceed) {
        window.location.href = '/login';
      }
      return;
    }
    
    const newFavoriteStatus = !localIsFavorite;
    
    if (localIsFavorite) {
      removeFavorite(uni.id);
    } else {
      saveFavorite(uni.id);
    }
    
    setLocalIsFavorite(newFavoriteStatus);
    
    window.dispatchEvent(new Event('storage'));
    
    if (onToggleFavorite) {
      onToggleFavorite();
    }
  };

  const handleCardClick = () => {
    // Track analytics when card is clicked
    trackUniversityClick(uni.id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleModalToggleFavorite = () => {
    if (!isUserLoggedIn) return;
    
    const newFavoriteStatus = !localIsFavorite;
    
    if (localIsFavorite) {
      removeFavorite(uni.id);
    } else {
      saveFavorite(uni.id);
    }
    
    setLocalIsFavorite(newFavoriteStatus);
    
    window.dispatchEvent(new Event('storage'));
    
    if (onToggleFavorite) {
      onToggleFavorite();
    }
  };

  React.useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  return (
    <>
      <div className={styles.card} onClick={handleCardClick}>
        {/* Enhanced Image Container with Gradient Overlay */}
        <div className={styles.imageContainer}>
          {uni.photoUrl ? (
            <div className={styles.cardImageWrapper}>
              <Image
                src={uni.photoUrl}
                alt={getDisplayValue(uni.name, locale)}
                fill
                style={{ objectFit: 'cover' }}
                className={styles.cardImage}
              />
              <div className={styles.imageGradient} />
            </div>
          ) : (
            <div className={styles.defaultImage}>
              <Building size={64} className={styles.defaultIcon} />
            </div>
          )}
          
          {/* Favorite Badge */}
          <button
            className={`${styles.favoriteBadge} ${localIsFavorite ? styles.favoriteActive : ''}`}
            onClick={handleToggleFavorite}
            aria-label={localIsFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart 
              size={20} 
              fill={localIsFavorite ? '#ff0000' : 'rgba(255, 255, 255, 0.8)'} 
              stroke={localIsFavorite ? '#ff0000' : 'rgba(255, 255, 255, 0.8)'}
            />
          </button>
          
          {/* Rating Badge */}
          <div className={styles.ratingBadge}>
            {isLoadingRating ? (
              <span className={styles.loadingDot}>●</span>
            ) : hasRating ? (
              <>
                <Star size={14} fill="#ffd700" stroke="#ffd700" />
                <span>{rating.toFixed(1)}</span>
              </>
            ) : (
              <span className={styles.noRatingText}>No ratings</span>
            )}
          </div>
          
          {/* University Name Overlay */}
          <div className={styles.nameOverlay}>
            <h3 className={styles.title}>
              {getDisplayValue(uni.name, locale)}
            </h3>
          </div>
        </div>

        {/* Enhanced Card Body */}
        <div className={styles.cardBody}>
          {/* Description with gradient fade */}
          <div className={styles.descriptionWrapper}>
            <p className={styles.description}>
              {getDisplayValue(uni.description, locale)}
            </p>
            <div className={styles.descriptionFade} />
          </div>

          {/* Quick Info Cards */}
          <div className={styles.quickInfoGrid}>
            {uni.specials && (
              <div className={styles.infoCard}>
                <Award size={16} className={styles.infoIcon} />
                <div>
                  <span className={styles.infoLabel}>Specializations</span>
                  <span className={styles.infoValue}>{getDisplayValue(uni.specials, locale)}</span>
                </div>
              </div>
            )}
            
            {uni.duration && (
              <div className={styles.infoCard}>
                <Calendar size={16} className={styles.infoIcon} />
                <div>
                  <span className={styles.infoLabel}>Duration</span>
                  <span className={styles.infoValue}>{getDisplayValue(uni.duration, locale)}</span>
                </div>
              </div>
            )}
            
            {uni.financing && (
              <div className={styles.infoCard}>
                <DollarSign size={16} className={styles.infoIcon} />
                <div>
                  <span className={styles.infoLabel}>Financing</span>
                  <span className={styles.infoValue}>{getDisplayValue(uni.financing, locale)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Tags */}
          <div className={styles.tagsContainer}>
            {uni.rewards && <span className={`${styles.tag} ${styles.tagScholarship}`}>🏆 Scholarship</span>}
            {uni.medicine && <span className={`${styles.tag} ${styles.tagMedical}`}>🏥 Medical</span>}
            {uni.salary && <span className={`${styles.tag} ${styles.tagSalary}`}>💼 Salary</span>}
            {uni.donitory && <span className={`${styles.tag} ${styles.tagHousing}`}>🏠 Housing</span>}
          </div>

          {/* Action Buttons */}
          <div className={styles.actionButtons}>
            <Link
              href={uni.officialLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={styles.websiteButton}
            >
              <span>Visit Website</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </Link>
            
            <button 
              className={styles.viewDetailsButton}
              onClick={handleCardClick}
            >
              <span>View Details</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <UniversityModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        university={uni}
        isFavorite={localIsFavorite}
        onToggleFavorite={handleModalToggleFavorite}
        isUserLoggedIn={isUserLoggedIn}
      />
    </>
  );
}