"use client";
import React, { useState, useEffect } from "react";
import styles from "./page.module.css";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchData } from "@/api/api";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Cookies from 'js-cookie'

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

// Type for creating a university (without id)
type CreateUniversity = Omit<University, 'id'>;

const initialMultilingualField: MultilingualField = {
  en: "",
  ru: "",
  tm: ""
};

const initialFormData: CreateUniversity = {
  photoUrl: "",
  name: initialMultilingualField,
  description: initialMultilingualField,
  specials: null,
  financing: null,
  duration: null,
  applicationDeadline: "",
  gender: null,
  age: null,
  others: null,
  medicine: null,
  salary: null,
  donitory: null,
  rewards: null,
  others_p: null,
  officialLink: "",
};

export default function AdminUniversitiesPage() {
  const t = useTranslations('AdminUniversities');
  const queryClient = useQueryClient();

  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ['universities'],
    queryFn: async () => await fetchData({ url: '/api/universities' })
  });

  console.log(apiData);
  

  const router = useRouter()
  const userData = Cookies.get('user_data')
  const user = userData ? JSON.parse(userData) : null
  const locale = useLocale()

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Create mutation - send data without id
  const createMutation = useMutation({
    mutationFn: async (newUniversity: CreateUniversity) => {
      let photoUrl = newUniversity.photoUrl;
      
      // If there's a selected file, upload it to Next.js first
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        
        const uploadData = await uploadResponse.json();
        photoUrl = uploadData.url; // This will be like "/uploads/filename.jpg"
      }
      
      const processedData = {
        ...newUniversity,
        photoUrl: photoUrl === "" ? null : photoUrl,
        applicationDeadline: newUniversity.applicationDeadline === "" ? null : newUniversity.applicationDeadline,
      };
      
      return await fetchData({ 
        url: '/api/universities', 
        method: 'POST',
        body: processedData,
        token: user?.token
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['universities'] });
      resetFileInput();
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (updatedUniversity: University) => {
      let photoUrl = updatedUniversity.photoUrl;
      
      // If there's a selected file, upload it to Next.js first
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        
        const uploadData = await uploadResponse.json();
        photoUrl = uploadData.url; // This will be like "/uploads/filename.jpg"
      }
      
      const processedData = {
        ...updatedUniversity,
        photoUrl: photoUrl === "" ? null : photoUrl,
        applicationDeadline: updatedUniversity.applicationDeadline === "" ? null : updatedUniversity.applicationDeadline,
      };
      
      return await fetchData({ 
        url: `/api/universities/${updatedUniversity.id}`, 
        method: 'PUT',
        body: processedData,
        token: user?.token
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['universities'] });
      resetFileInput();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await fetchData({ 
        url: `/api/universities/${id}`, 
        method: 'DELETE',
        token: user?.token
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['universities'] });
    },
  });

  const [universities, setUniversities] = useState<University[]>([]);
  
  // Initialize universities with API data when it loads
  useEffect(() => {
    if (apiData) {
      setUniversities(apiData);
    }
  }, [apiData]);

  const [formData, setFormData] = useState<CreateUniversity>(initialFormData);
  const [editingUni, setEditingUni] = useState<University | null>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);

    // Create preview URL
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }

    // Also update formData for consistency
    setFormData(prev => ({
      ...prev,
      photoUrl: file ? URL.createObjectURL(file) : "" // Temporary local URL for preview
    }));
  };

  // Reset file input
  const resetFileInput = () => {
    setSelectedFile(null);
    setImagePreview(null);
  };

  // Handle change for multilingual fields
  const handleMultilingualChange = (
    field: keyof CreateUniversity,
    lang: keyof MultilingualField,
    value: string
  ) => {
    setFormData(prev => {
      const currentField = prev[field];
      
      if (field === 'name' || field === 'description') {
        // Required fields that are always MultilingualField
        return {
          ...prev,
          [field]: {
            ...(currentField as MultilingualField),
            [lang]: value
          }
        };
      } else {
        // Optional fields that can be null
        if (currentField === null) {
          // Initialize with empty multilingual object
          return {
            ...prev,
            [field]: {
              ...initialMultilingualField,
              [lang]: value
            }
          };
        } else {
          return {
            ...prev,
            [field]: {
              ...(currentField as MultilingualField),
              [lang]: value
            }
          };
        }
      }
    });
  };

  // Handle change for simple fields
  const handleSimpleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === 'age') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value === "" ? null : parseInt(value) || null
      }));
    } else if (name === 'applicationDeadline' || name === 'officialLink') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value 
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingUni) {
        // Update existing university - include the id
        const updatedUniversity: University = {
          ...formData,
          id: editingUni.id
        };
        await updateMutation.mutateAsync(updatedUniversity);
      } else {
        // Add new university - send only CreateUniversity data (without id)
        await createMutation.mutateAsync(formData);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving university:', error);
    }
  };

  const handleEdit = (uni: University) => {
    setEditingUni(uni);
    setFormData({
      photoUrl: uni.photoUrl || "",
      name: uni.name,
      description: uni.description,
      specials: uni.specials,
      financing: uni.financing,
      duration: uni.duration,
      applicationDeadline: uni.applicationDeadline || "",
      gender: uni.gender,
      age: uni.age,
      others: uni.others,
      medicine: uni.medicine,
      salary: uni.salary,
      donitory: uni.donitory,
      rewards: uni.rewards,
      others_p: uni.others_p,
      officialLink: uni.officialLink,
    });
    
    // Set image preview if photo exists
    if (uni.photoUrl) {
      setImagePreview(uni.photoUrl);
    } else {
      setImagePreview(null);
    }
    setSelectedFile(null);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(t('messages.confirmDelete'))) {
      try {
        await deleteMutation.mutateAsync(id);
        if (editingUni?.id === id) resetForm();
      } catch (error) {
        console.error('Error deleting university:', error);
      }
    }
  };

  const resetForm = () => {
    setEditingUni(null);
    setFormData(initialFormData);
    resetFileInput();
  };

  // Helper function to display multilingual values (show English by default)
  const displayMultilingualValue = (value: MultilingualField | null, lang: keyof MultilingualField = 'en'): string => {
    if (value === null) return "-";
    return value[lang] || value.en || "-";
  };

  // Format date for display
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  // Fixed: Added proper type annotation
  const normalizeImageUrl = (url: string | null): string => {
    if (!url) return '';
    
    // If it's already an absolute URL (starts with http), return as is
    if (url.startsWith('http')) {
      return url;
    }
    
    // If it's a relative path, ensure it starts with /
    return url.startsWith('/') ? url : `/${url}`;
  };

  if ( user?.role !== 'admin' ) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>{t('accessDenied')}</h1>
        <p className={styles.error}>{t('noPermission')}</p>
      </div>
    );
  }

  // Check if any mutation is loading
  const isLoadingMutation = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  console.log(apiData, 'API Data');
  

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{t('title')}</h1>

      {isLoading && <div className={styles.loading}>{t('messages.loading')}</div>}
      {error && (
        <div className={styles.error}>
          {t('messages.error', { error: (error as Error).message })}
        </div>
      )}

      {/* Form Card */}
      <div className={styles.formCard}>
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Basic Information */}
          <div className={styles.formSection}>
            <h3>{t('form.basicInfo')}</h3>
            
            {/* Photo Upload */}
            <div className={styles.photoUploadSection}>
              <label>{t('form.fields.photo')} ({t('form.placeholders.optional')})</label>
              <div className={styles.photoUploadContainer}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className={styles.fileInput}
                  id="university-photo"
                />
                <label htmlFor="university-photo" className={styles.fileInputLabel}>
                  {t('buttons.chooseFile')}
                </label>
                {selectedFile && (
                  <span className={styles.fileName}>{selectedFile.name}</span>
                )}
              </div>
              
              {/* Image Preview */}
              {(imagePreview || formData.photoUrl) && (
                <div className={styles.imagePreview}>
                  <img 
                    src={imagePreview || formData.photoUrl || ""} 
                    alt="University preview" 
                    className={styles.previewImage}
                  />
                  <button
                    type="button"
                    onClick={resetFileInput}
                    className={styles.removeImageBtn}
                  >
                    {t('buttons.delete')}
                  </button>
                </div>
              )}
            </div>

            {/* Name - Multilingual */}
            <div className={styles.multilingualGroup}>
              <label>{t('form.fields.name')} *</label>
              <input
                type="text"
                placeholder={`English ${t('form.fields.name')}`}
                value={formData.name.en}
                onChange={(e) => handleMultilingualChange('name', 'en', e.target.value)}
                required
                className={styles.input}
              />
              <input
                type="text"
                placeholder={`Russian ${t('form.fields.name')}`}
                value={formData.name.ru}
                onChange={(e) => handleMultilingualChange('name', 'ru', e.target.value)}
                required
                className={styles.input}
              />
              <input
                type="text"
                placeholder={`Turkmen ${t('form.fields.name')}`}
                value={formData.name.tm}
                onChange={(e) => handleMultilingualChange('name', 'tm', e.target.value)}
                required
                className={styles.input}
              />
            </div>

            {/* Description - Multilingual */}
            <div className={styles.multilingualGroup}>
              <label>{t('form.fields.description')} *</label>
              <textarea
                placeholder={`English ${t('form.fields.description')}`}
                value={formData.description.en}
                onChange={(e) => handleMultilingualChange('description', 'en', e.target.value)}
                required
                className={styles.textarea}
                rows={2}
              />
              <textarea
                placeholder={`Russian ${t('form.fields.description')}`}
                value={formData.description.ru}
                onChange={(e) => handleMultilingualChange('description', 'ru', e.target.value)}
                required
                className={styles.textarea}
                rows={2}
              />
              <textarea
                placeholder={`Turkmen ${t('form.fields.description')}`}
                value={formData.description.tm}
                onChange={(e) => handleMultilingualChange('description', 'tm', e.target.value)}
                required
                className={styles.textarea}
                rows={2}
              />
            </div>
          </div>

          {/* Program Details */}
          <div className={styles.formSection}>
            <h3>{t('form.programDetails')}</h3>
            
            {/* Specials - Multilingual */}
            <div className={styles.multilingualGroup}>
              <label>{t('form.fields.specials')} ({t('form.placeholders.optional')})</label>
              <input
                type="text"
                placeholder="English Specials"
                value={formData.specials?.en || ""}
                onChange={(e) => handleMultilingualChange('specials', 'en', e.target.value)}
                className={styles.input}
              />
              <input
                type="text"
                placeholder="Russian Specials"
                value={formData.specials?.ru || ""}
                onChange={(e) => handleMultilingualChange('specials', 'ru', e.target.value)}
                className={styles.input}
              />
              <input
                type="text"
                placeholder="Turkmen Specials"
                value={formData.specials?.tm || ""}
                onChange={(e) => handleMultilingualChange('specials', 'tm', e.target.value)}
                className={styles.input}
              />
            </div>

            {/* Financing - Multilingual */}
            <div className={styles.multilingualGroup}>
              <label>{t('form.fields.financing')} ({t('form.placeholders.optional')})</label>
              <input
                type="text"
                placeholder="English Financing"
                value={formData.financing?.en || ""}
                onChange={(e) => handleMultilingualChange('financing', 'en', e.target.value)}
                className={styles.input}
              />
              <input
                type="text"
                placeholder="Russian Financing"
                value={formData.financing?.ru || ""}
                onChange={(e) => handleMultilingualChange('financing', 'ru', e.target.value)}
                className={styles.input}
              />
              <input
                type="text"
                placeholder="Turkmen Financing"
                value={formData.financing?.tm || ""}
                onChange={(e) => handleMultilingualChange('financing', 'tm', e.target.value)}
                className={styles.input}
              />
            </div>

            {/* Duration - Multilingual */}
            <div className={styles.multilingualGroup}>
              <label>{t('form.fields.duration')} ({t('form.placeholders.optional')})</label>
              <input
                type="text"
                placeholder="English Duration (e.g., 6 years)"
                value={formData.duration?.en || ""}
                onChange={(e) => handleMultilingualChange('duration', 'en', e.target.value)}
                className={styles.input}
              />
              <input
                type="text"
                placeholder="Russian Duration"
                value={formData.duration?.ru || ""}
                onChange={(e) => handleMultilingualChange('duration', 'ru', e.target.value)}
                className={styles.input}
              />
              <input
                type="text"
                placeholder="Turkmen Duration"
                value={formData.duration?.tm || ""}
                onChange={(e) => handleMultilingualChange('duration', 'tm', e.target.value)}
                className={styles.input}
              />
            </div>

            <label>{t('form.fields.applicationDeadline')} ({t('form.placeholders.optional')})</label>
            <input
              type="date"
              name="applicationDeadline"
              value={formData.applicationDeadline}
              onChange={handleSimpleChange}
              className={styles.input}
            />
          </div>

          {/* Requirements */}
          <div className={styles.formSection}>
            <h3>{t('form.requirements')}</h3>
            
            {/* Gender - Multilingual */}
            <div className={styles.multilingualGroup}>
              <label>{t('form.fields.gender')} ({t('form.placeholders.optional')})</label>
              <select
                value={formData.gender?.en || ""}
                onChange={(e) => handleMultilingualChange('gender', 'en', e.target.value)}
                className={styles.input}
              >
                <option value="">Select Gender (English)</option>
                <option value="Everyone">Everyone</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <input
                type="text"
                placeholder="Russian Gender"
                value={formData.gender?.ru || ""}
                onChange={(e) => handleMultilingualChange('gender', 'ru', e.target.value)}
                className={styles.input}
              />
              <input
                type="text"
                placeholder="Turkmen Gender"
                value={formData.gender?.tm || ""}
                onChange={(e) => handleMultilingualChange('gender', 'tm', e.target.value)}
                className={styles.input}
              />
            </div>

            <input
              type="number"
              name="age"
              placeholder={`${t('form.fields.age')} (${t('form.placeholders.optional')})`}
              value={formData.age || ""}
              onChange={handleSimpleChange}
              min="0"
              className={styles.input}
            />

            {/* Others - Multilingual */}
            <div className={styles.multilingualGroup}>
              <label>{t('form.fields.others')} ({t('form.placeholders.optional')})</label>
              <textarea
                placeholder="English Others"
                value={formData.others?.en || ""}
                onChange={(e) => handleMultilingualChange('others', 'en', e.target.value)}
                className={styles.textarea}
                rows={2}
              />
              <textarea
                placeholder="Russian Others"
                value={formData.others?.ru || ""}
                onChange={(e) => handleMultilingualChange('others', 'ru', e.target.value)}
                className={styles.textarea}
                rows={2}
              />
              <textarea
                placeholder="Turkmen Others"
                value={formData.others?.tm || ""}
                onChange={(e) => handleMultilingualChange('others', 'tm', e.target.value)}
                className={styles.textarea}
                rows={2}
              />
            </div>

            {/* Others_p - Multilingual */}
            <div className={styles.multilingualGroup}>
              <label>{t('form.fields.others_p')} ({t('form.placeholders.optional')})</label>
              <textarea
                placeholder="English Others (Program)"
                value={formData.others_p?.en || ""}
                onChange={(e) => handleMultilingualChange('others_p', 'en', e.target.value)}
                className={styles.textarea}
                rows={2}
              />
              <textarea
                placeholder="Russian Others (Program)"
                value={formData.others_p?.ru || ""}
                onChange={(e) => handleMultilingualChange('others_p', 'ru', e.target.value)}
                className={styles.textarea}
                rows={2}
              />
              <textarea
                placeholder="Turkmen Others (Program)"
                value={formData.others_p?.tm || ""}
                onChange={(e) => handleMultilingualChange('others_p', 'tm', e.target.value)}
                className={styles.textarea}
                rows={2}
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className={styles.formSection}>
            <h3>{t('form.additionalInfo')}</h3>
            
            {/* Medicine - Multilingual */}
            <div className={styles.multilingualGroup}>
              <label>{t('form.fields.medicine')} ({t('form.placeholders.optional')})</label>
              <input
                type="text"
                placeholder="English Medicine"
                value={formData.medicine?.en || ""}
                onChange={(e) => handleMultilingualChange('medicine', 'en', e.target.value)}
                className={styles.input}
              />
              <input
                type="text"
                placeholder="Russian Medicine"
                value={formData.medicine?.ru || ""}
                onChange={(e) => handleMultilingualChange('medicine', 'ru', e.target.value)}
                className={styles.input}
              />
              <input
                type="text"
                placeholder="Turkmen Medicine"
                value={formData.medicine?.tm || ""}
                onChange={(e) => handleMultilingualChange('medicine', 'tm', e.target.value)}
                className={styles.input}
              />
            </div>

            {/* Salary - Multilingual */}
            <div className={styles.multilingualGroup}>
              <label>{t('form.fields.salary')} ({t('form.placeholders.optional')})</label>
              <select
                value={formData.salary?.en || ""}
                onChange={(e) => handleMultilingualChange('salary', 'en', e.target.value)}
                className={styles.input}
              >
                <option value="">Salary Option (English)</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              <input
                type="text"
                placeholder="Russian Salary"
                value={formData.salary?.ru || ""}
                onChange={(e) => handleMultilingualChange('salary', 'ru', e.target.value)}
                className={styles.input}
              />
              <input
                type="text"
                placeholder="Turkmen Salary"
                value={formData.salary?.tm || ""}
                onChange={(e) => handleMultilingualChange('salary', 'tm', e.target.value)}
                className={styles.input}
              />
            </div>

            {/* Donitory - Multilingual */}
            <div className={styles.multilingualGroup}>
              <label>{t('form.fields.donitory')} ({t('form.placeholders.optional')})</label>
              <input
                type="text"
                placeholder="English Donitory"
                value={formData.donitory?.en || ""}
                onChange={(e) => handleMultilingualChange('donitory', 'en', e.target.value)}
                className={styles.input}
              />
              <input
                type="text"
                placeholder="Russian Donitory"
                value={formData.donitory?.ru || ""}
                onChange={(e) => handleMultilingualChange('donitory', 'ru', e.target.value)}
                className={styles.input}
              />
              <input
                type="text"
                placeholder="Turkmen Donitory"
                value={formData.donitory?.tm || ""}
                onChange={(e) => handleMultilingualChange('donitory', 'tm', e.target.value)}
                className={styles.input}
              />
            </div>

            {/* Rewards - Multilingual */}
            <div className={styles.multilingualGroup}>
              <label>{t('form.fields.rewards')} ({t('form.placeholders.optional')})</label>
              <input
                type="text"
                placeholder="English Rewards"
                value={formData.rewards?.en || ""}
                onChange={(e) => handleMultilingualChange('rewards', 'en', e.target.value)}
                className={styles.input}
              />
              <input
                type="text"
                placeholder="Russian Rewards"
                value={formData.rewards?.ru || ""}
                onChange={(e) => handleMultilingualChange('rewards', 'ru', e.target.value)}
                className={styles.input}
              />
              <input
                type="text"
                placeholder="Turkmen Rewards"
                value={formData.rewards?.tm || ""}
                onChange={(e) => handleMultilingualChange('rewards', 'tm', e.target.value)}
                className={styles.input}
              />
            </div>
          </div>

          {/* Website Links */}
          <div className={styles.formSection}>
            <h3>{t('form.websiteLinks')}</h3>
            
            <input
              type="url"
              name="officialLink"
              placeholder={`${t('form.fields.officialLink')} *`}
              value={formData.officialLink}
              onChange={handleSimpleChange}
              required
              className={`${styles.input} ${styles.fullWidth}`}
            />
          </div>

          <div className={styles.actionsForm}>
            <button 
              type="submit" 
              className={styles.button}
              disabled={isLoadingMutation}
            >
              {isLoadingMutation 
                ? t('buttons.saving') 
                : editingUni 
                  ? t('buttons.updateUniversity') 
                  : t('buttons.addUniversity')
              }
            </button>
            {editingUni && (
              <button
                type="button"
                onClick={resetForm}
                className={`${styles.button} ${styles.cancelBtn}`}
                disabled={isLoadingMutation}
              >
                {t('buttons.cancel')}
              </button>
            )}
          </div>

          {/* Mutation Status Messages */}
          {createMutation.isError && (
            <div className={styles.error}>
              {t('messages.errorCreating', { error: (createMutation.error as Error).message })}
            </div>
          )}
          {updateMutation.isError && (
            <div className={styles.error}>
              {t('messages.errorUpdating', { error: (updateMutation.error as Error).message })}
            </div>
          )}
          {deleteMutation.isError && (
            <div className={styles.error}>
              {t('messages.errorDeleting', { error: (deleteMutation.error as Error).message })}
            </div>
          )}
        </form>
      </div>

      {/* Universities Table */}
      <div className={styles.tableWrapper}>
        <div className={styles.tableTitle}>
          {t('table.title', { count: universities.length })}
          {isLoadingMutation && (
            <span className={styles.savingIndicator}>
              {t('table.savingChanges')}
            </span>
          )}
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t('table.headers.id')}</th>
              <th>{t('table.headers.photo')}</th>
              <th>{t('table.headers.name')}</th>
              <th>{t('table.headers.description')}</th>
              <th>{t('table.headers.specials')}</th>
              <th>{t('table.headers.duration')}</th>
              <th>{t('table.headers.deadline')}</th>
              <th>{t('table.headers.website')}</th>
              <th>{t('table.headers.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {universities.map((uni) => (
              <tr key={uni.id}>
                <td>{uni.id}</td>
                <td>
                  {uni.photoUrl && (
                    <img 
                      src={uni.photoUrl} 
                      alt={displayMultilingualValue(uni.name, locale as keyof MultilingualField)} 
                      className={styles.photoThumbnail}
                    />
                  )}
                </td>
                <td>
                  <div className={styles.nameCell}>
                    <span>{displayMultilingualValue(uni.name, locale as keyof MultilingualField)}</span>
                  </div>
                </td>
                <td className={styles.descriptionCell}>
                  {displayMultilingualValue(uni.description, locale as keyof MultilingualField)}
                </td>
                <td>{displayMultilingualValue(uni.specials, locale as keyof MultilingualField)}</td>
                <td>{displayMultilingualValue(uni.duration, locale as keyof MultilingualField)}</td>
                <td>{formatDate(uni.applicationDeadline)}</td>
                <td>
                  <a href={uni.officialLink} target="_blank" rel="noopener noreferrer" className={styles.link}>
                    {t('buttons.visit')}
                  </a>
                </td>
                <td>
                  <div className={styles.tableActions}>
                    <button
                      onClick={() => handleEdit(uni)}
                      className={styles.button}
                      disabled={isLoadingMutation}
                    >
                      {t('buttons.edit')}
                    </button>
                    <button
                      onClick={() => handleDelete(uni.id)}
                      className={`${styles.button} ${styles.deleteBtn}`}
                      disabled={isLoadingMutation}
                    >
                      {t('buttons.delete')}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {universities.length === 0 && !isLoading && (
          <div className={styles.noData}>{t('table.noData')}</div>
        )}
      </div>
    </div>
  );
}