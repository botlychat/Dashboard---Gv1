import React, { useState, useMemo, useEffect } from 'react';
import { Unit, UnitGroup, currencySymbols, Bedroom } from '../types';
import { useAccount, useLanguage } from '../App';

interface AddUnitFormProps {
  unitGroups: UnitGroup[];
  onSave: (unit: Omit<Unit, 'id'>, id?: number) => void;
  onClose: () => void;
  editingUnit: Unit | null;
}

const MAX_VIDEO_SIZE_MB = 50;
const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;

const initialFormData = {
    // Basic Info
    name: '',
    groupId: 0,
    status: 'Active',
    hasPool: false,
    poolSpecs: '',
    hasGarden: false,
    gardenSpecs: '',
    entertainmentAreas: '',
    area: '',
    maxGuests: '',
    parkingAvailable: false,
    checkInHour: '15',
    checkOutHour: '11',
    shortDescription: '',
    longDescription: '',

    // Pricing
    baseRate: '',
    weekdayPrices: {
      sunday: '', monday: '', tuesday: '', wednesday: '',
      thursday: '', friday: '', saturday: ''
    },

    // Amenities
    hasKitchen: false,
    bedrooms: [] as Bedroom[],
    bathrooms: '',
    otherAmenities: '',

    // Media
    featuredImage: null as string | null,
    gallery: [] as (string | null)[],
    videos: [] as string[],

    // Policy
    cancellationPolicy: ''
};


const AddUnitForm: React.FC<AddUnitFormProps> = ({ unitGroups, onSave, onClose, editingUnit }) => {
  const { t } = useLanguage();
  const TABS = [t('basicInfo'), t('pricing'), t('amenitiesAndFeatures'), t('media'), t('cancellationAndRefund')];

  const [activeTab, setActiveTab] = useState(TABS[0]);
  const { accountSettings } = useAccount();
  const currencySymbol = currencySymbols[accountSettings.currency];
  
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (editingUnit) {
        setFormData({
            name: editingUnit.name,
            groupId: editingUnit.groupId,
            status: editingUnit.status,
            shortDescription: editingUnit.shortDescription,
            longDescription: editingUnit.longDescription,
            area: String(editingUnit.area),
            maxGuests: String(editingUnit.maxGuests),
            parkingAvailable: editingUnit.parkingAvailable,
            checkInHour: String(editingUnit.checkInHour),
            checkOutHour: String(editingUnit.checkOutHour),
            
            hasPool: editingUnit.amenities.hasPool,
            poolSpecs: editingUnit.amenities.poolSpecs || '',
            hasGarden: editingUnit.amenities.hasGarden,
            gardenSpecs: editingUnit.amenities.gardenSpecs || '',
            hasKitchen: editingUnit.amenities.hasKitchen,
            bedrooms: editingUnit.amenities.bedrooms,
            bathrooms: String(editingUnit.amenities.bathrooms),
            entertainmentAreas: editingUnit.amenities.entertainmentAreas.join(', '),
            otherAmenities: editingUnit.amenities.other.join(', '),

            baseRate: String(editingUnit.pricing.baseRate),
            weekdayPrices: {
                sunday: String(editingUnit.pricing.weekdayPrices.sunday),
                monday: String(editingUnit.pricing.weekdayPrices.monday),
                tuesday: String(editingUnit.pricing.weekdayPrices.tuesday),
                wednesday: String(editingUnit.pricing.weekdayPrices.wednesday),
                thursday: String(editingUnit.pricing.weekdayPrices.thursday),
                friday: String(editingUnit.pricing.weekdayPrices.friday),
                saturday: String(editingUnit.pricing.weekdayPrices.saturday),
            },

            featuredImage: editingUnit.media.featuredImage,
            gallery: editingUnit.media.gallery,
            videos: editingUnit.media.videos,
            
            cancellationPolicy: editingUnit.cancellationPolicy,
        });
    } else {
        setFormData({
            ...initialFormData,
            bedrooms: [],
            videos: [],
            gallery: [],
            groupId: unitGroups[0]?.id || 0,
        });
    }
  }, [editingUnit, unitGroups]);

  const selectedGroup: UnitGroup | undefined = useMemo(() => 
    unitGroups.find(g => g.id === Number(formData.groupId)), 
  [formData.groupId, unitGroups]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleWeekdayPriceChange = (day: string, value: string) => {
    setFormData(prev => ({
        ...prev,
        weekdayPrices: { ...prev.weekdayPrices, [day]: value }
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, isMultiple: boolean) => {
      if (e.target.files) {
          const files = Array.from(e.target.files);
          const readerPromises = files.map(file => new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(file);
          }));

          Promise.all(readerPromises).then(base64Strings => {
              if (isMultiple) {
                  setFormData(prev => ({ ...prev, gallery: [...prev.gallery, ...base64Strings]}));
              } else {
                  setFormData(prev => ({ ...prev, featuredImage: base64Strings[0] }));
              }
          });
      }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => {
            if (file.size > MAX_VIDEO_SIZE_BYTES) {
                alert(`File "${file.name}" is too large. Maximum size is ${MAX_VIDEO_SIZE_MB}MB.`);
                return false;
            }
            return true;
        });

        const readerPromises = validFiles.map(file => new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
        }));

        Promise.all(readerPromises).then(base64Strings => {
            setFormData(prev => ({ ...prev, videos: [...prev.videos, ...base64Strings] }));
        });
    }
  };
  
  const handleRemoveMedia = (index: number, type: 'gallery' | 'videos') => {
    setFormData(prev => ({
        ...prev,
        [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup) {
        alert("Please select a valid group.");
        return;
    }

    const unitData: Omit<Unit, 'id'> = {
      name: formData.name,
      groupId: Number(formData.groupId),
      type: selectedGroup.type,
      status: formData.status as 'Active' | 'Inactive',
      shortDescription: formData.shortDescription,
      longDescription: formData.longDescription,
      area: Number(formData.area),
      maxGuests: Number(formData.maxGuests),
      parkingAvailable: formData.parkingAvailable,
      checkInHour: Number(formData.checkInHour),
      checkOutHour: Number(formData.checkOutHour),
      amenities: {
        hasPool: formData.hasPool,
        poolSpecs: formData.poolSpecs,
        hasGarden: formData.hasGarden,
        gardenSpecs: formData.gardenSpecs,
        hasKitchen: formData.hasKitchen,
        bedrooms: formData.bedrooms,
        bathrooms: Number(formData.bathrooms),
        entertainmentAreas: formData.entertainmentAreas.split(',').map(s => s.trim()).filter(Boolean),
        other: formData.otherAmenities.split(',').map(s => s.trim()).filter(Boolean),
      },
      pricing: {
        baseRate: Number(formData.baseRate),
        weekdayPrices: {
          sunday: Number(formData.weekdayPrices.sunday) || Number(formData.baseRate),
          monday: Number(formData.weekdayPrices.monday) || Number(formData.baseRate),
          tuesday: Number(formData.weekdayPrices.tuesday) || Number(formData.baseRate),
          wednesday: Number(formData.weekdayPrices.wednesday) || Number(formData.baseRate),
          thursday: Number(formData.weekdayPrices.thursday) || Number(formData.baseRate),
          friday: Number(formData.weekdayPrices.friday) || Number(formData.baseRate),
          saturday: Number(formData.weekdayPrices.saturday) || Number(formData.baseRate),
        },
        specialDateOverrides: editingUnit?.pricing.specialDateOverrides || [],
      },
      media: {
        featuredImage: formData.featuredImage,
        gallery: formData.gallery,
        videos: formData.videos,
      },
      cancellationPolicy: formData.cancellationPolicy,
    };
    
    onSave(unitData, editingUnit ? editingUnit.id : undefined);
  };

  const renderContent = () => {
    switch (activeTab) {
        case t('basicInfo'): return <BasicInfoTab formData={formData} handleChange={handleChange} unitGroups={unitGroups} t={t} />;
        case t('pricing'): return <PricingTab formData={formData} handleChange={handleChange} handleWeekdayPriceChange={handleWeekdayPriceChange} currencySymbol={currencySymbol} t={t} />;
        case t('amenitiesAndFeatures'): return <AmenitiesTab formData={formData} setFormData={setFormData} t={t} />;
        case t('media'): return <MediaTab formData={formData} handleImageChange={handleImageChange} handleVideoChange={handleVideoChange} handleRemoveMedia={handleRemoveMedia} t={t}/>;
        case t('cancellationAndRefund'): return <CancellationTab formData={formData} handleChange={handleChange} t={t} />;
        default: return null;
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <style>{`
            .form-label { display: block; margin-bottom: 0.25rem; font-size: 0.875rem; font-weight: 500; color: #374151; }
            html.dark .form-label { color: #f3f4f6; }
            .form-input { display: block; width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; background-color: #ffffff; color: #111827; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }
            html.dark .form-input { background-color: #1f2937; border-color: #4b5563; color: #f3f4f6; }
            .form-input:focus { outline: 2px solid transparent; outline-offset: 2px; border-color: #fb923c; ring: 1px solid #fb923c; }
            .form-checkbox { height: 1.25rem; width: 1.25rem; border-radius: 0.25rem; border-color: #d1d5db; color: #f97316; }
            html.dark .form-checkbox { background-color: #374151; border-color: #6b7280;}
      `}</style>
      <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
          <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
              {TABS.map(tab => (
                  <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === tab ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'}`}
                  >
                      {tab}
                  </button>
              ))}
          </nav>
      </div>

      <div className="space-y-4">{renderContent()}</div>

      <div className="flex justify-end space-x-3 pt-6 mt-6 border-t dark:border-gray-700">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
              {t('cancel')}
          </button>
          <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-orange-500 border border-transparent rounded-md shadow-sm hover:bg-orange-600">
              {editingUnit ? t('saveChanges') : t('addUnit')}
          </button>
      </div>
    </form>
  );
};

// Sub-components for each tab
const BasicInfoTab = ({ formData, handleChange, unitGroups, t }: any) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
        <div className="md:col-span-2">
            <label htmlFor="name" className="form-label">{t('unitName')}</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="form-input" required />
        </div>
        <div>
            <label htmlFor="groupId" className="form-label">{t('group')}</label>
            <select name="groupId" id="groupId" value={formData.groupId} onChange={handleChange} className="form-input" required>
                {unitGroups.map((group: UnitGroup) => (
                    <option key={group.id} value={group.id}>{group.name} ({group.type})</option>
                ))}
            </select>
        </div>
        <div>
            <label htmlFor="status" className="form-label">{t('status')}</label>
            <select name="status" id="status" value={formData.status} onChange={handleChange} className="form-input" required>
                <option>Active</option>
                <option>Inactive</option>
            </select>
        </div>
        <div>
            <label htmlFor="area" className="form-label">Unit Area (m²)</label>
            <input type="number" name="area" id="area" value={formData.area} onChange={handleChange} className="form-input" required />
        </div>
        <div>
            <label htmlFor="maxGuests" className="form-label">{t('maxGuests')}</label>
            <input type="number" name="maxGuests" id="maxGuests" value={formData.maxGuests} onChange={handleChange} className="form-input" required />
        </div>
        <div className="md:col-span-3">
            <label htmlFor="entertainmentAreas" className="form-label">Entertainment Areas</label>
            <input type="text" name="entertainmentAreas" id="entertainmentAreas" value={formData.entertainmentAreas} onChange={handleChange} className="form-input" placeholder="BBQ area, lounge, game room" />
            <p className="text-xs text-gray-500 mt-1">Separate with commas.</p>
        </div>
        <div>
            <label htmlFor="checkInHour" className="form-label">Check-In Hour (24h)</label>
            <input type="number" name="checkInHour" id="checkInHour" min="0" max="23" value={formData.checkInHour} onChange={handleChange} className="form-input" />
        </div>
        <div>
            <label htmlFor="checkOutHour" className="form-label">Check-Out Hour (24h)</label>
            <input type="number" name="checkOutHour" id="checkOutHour" min="0" max="23" value={formData.checkOutHour} onChange={handleChange} className="form-input" />
        </div>
         <div className="flex items-center pt-5">
            <input type="checkbox" name="parkingAvailable" id="parkingAvailable" checked={formData.parkingAvailable} onChange={handleChange} className="form-checkbox" />
            <label htmlFor="parkingAvailable" className="ms-2 form-label !mb-0">Parking Available</label>
        </div>
        <div className="md:col-span-3">
            <label htmlFor="shortDescription" className="form-label">Short Description</label>
            <textarea name="shortDescription" id="shortDescription" value={formData.shortDescription} onChange={handleChange} rows={2} className="form-input"></textarea>
        </div>
        <div className="md:col-span-3">
            <label htmlFor="longDescription" className="form-label">Long Description</label>
            <textarea name="longDescription" id="longDescription" value={formData.longDescription} onChange={handleChange} rows={4} className="form-input"></textarea>
        </div>
    </div>
);

const PricingTab = ({ formData, handleChange, handleWeekdayPriceChange, currencySymbol, t }: any) => {
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayKeys = ['daySun', 'dayMon', 'dayTue', 'dayWed', 'dayThu', 'dayFri', 'daySat'];
    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="baseRate" className="form-label">{t('baseRate')} ({currencySymbol})</label>
                <input type="number" name="baseRate" id="baseRate" value={formData.baseRate} onChange={handleChange} className="form-input" placeholder="e.g., 650" required />
                <p className="text-xs text-gray-500 mt-1">This will be used if a specific day's price isn't set.</p>
            </div>
            <div className="pt-2">
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Weekday Pricing Overrides (per night)</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    {weekdays.map((day, i) => (
                         <div key={day}>
                            <label htmlFor={day} className="form-label capitalize">{t(dayKeys[i])}</label>
                            <input
                                type="number"
                                name={day}
                                id={day}
                                value={formData.weekdayPrices[day]}
                                onChange={(e) => handleWeekdayPriceChange(day, e.target.value)}
                                className="form-input"
                                placeholder={formData.baseRate || '...'}
                            />
                        </div>
                    ))}
                </div>
            </div>
             <div className="pt-2 text-gray-500">
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Special Date Overrides</h4>
                <p className="text-sm">Create and manage specific date overrides from the main Calendar page by clicking the '+' on a date.</p>
            </div>
        </div>
    )
};

const AmenitiesTab = ({ formData, setFormData, t }: any) => {

    const handleBedroomTypeChange = (id: number, newType: string) => {
        setFormData((prev: any) => ({
            ...prev,
            bedrooms: prev.bedrooms.map((b: Bedroom) => b.id === id ? { ...b, type: newType } : b)
        }));
    };
    const handleAddBedroom = () => {
        setFormData((prev: any) => ({
            ...prev,
            bedrooms: [...prev.bedrooms, { id: Date.now(), type: '1 King Bed' }]
        }));
    };
    const handleRemoveBedroom = (id: number) => {
        setFormData((prev: any) => ({
            ...prev,
            bedrooms: prev.bedrooms.filter((b: Bedroom) => b.id !== id)
        }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev: any) => ({...prev, [name]: type === 'checkbox' ? checked : value}));
    };

    return (
    <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center">
                <input type="checkbox" name="hasKitchen" id="hasKitchen" checked={formData.hasKitchen} onChange={handleChange} className="form-checkbox" />
                <label htmlFor="hasKitchen" className="ms-2 form-label !mb-0">Has Kitchen</label>
            </div>
            <div className="flex items-center">
                <input type="checkbox" name="hasPool" id="hasPool" checked={formData.hasPool} onChange={handleChange} className="form-checkbox" />
                <label htmlFor="hasPool" className="ms-2 form-label !mb-0">Has Pool</label>
            </div>
            <div className="flex items-center">
                <input type="checkbox" name="hasGarden" id="hasGarden" checked={formData.hasGarden} onChange={handleChange} className="form-checkbox" />
                <label htmlFor="hasGarden" className="ms-2 form-label !mb-0">Has Garden</label>
            </div>
        </div>
         {formData.hasPool && (
            <div>
                <label htmlFor="poolSpecs" className="form-label">Pool Specifications</label>
                <input type="text" name="poolSpecs" id="poolSpecs" value={formData.poolSpecs} onChange={handleChange} className="form-input" placeholder="e.g., 10m x 5m, heated, infinity edge"/>
            </div>
        )}
        {formData.hasGarden && (
            <div>
                <label htmlFor="gardenSpecs" className="form-label">Garden Specifications</label>
                <input type="text" name="gardenSpecs" id="gardenSpecs" value={formData.gardenSpecs} onChange={handleChange} className="form-input" placeholder="e.g., 50sqm, private, with BBQ"/>
            </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
                <label htmlFor="bathrooms" className="form-label">Bathrooms</label>
                <input type="number" name="bathrooms" id="bathrooms" min="0" value={formData.bathrooms} onChange={handleChange} className="form-input" />
            </div>
        </div>
        <div>
            <label className="form-label">Bedrooms ({formData.bedrooms.length})</label>
            <div className="space-y-2 p-3 border dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900/50">
                {formData.bedrooms.map((bed: Bedroom, index: number) => (
                    <div key={bed.id} className="flex items-center space-x-2">
                        <span className="text-gray-500 font-medium">{index + 1}.</span>
                        <input
                            type="text"
                            value={bed.type}
                            onChange={(e) => handleBedroomTypeChange(bed.id, e.target.value)}
                            className="form-input flex-grow"
                            placeholder="e.g., 1 King Bed, 2 Twin Beds"
                        />
                        <button type="button" onClick={() => handleRemoveBedroom(bed.id)} className="text-red-500 hover:text-red-700 p-1">
                            <i className="fas fa-trash"></i>
                        </button>
                    </div>
                ))}
                <button type="button" onClick={handleAddBedroom} className="w-full text-sm py-2 text-orange-600 font-semibold hover:bg-orange-50 dark:hover:bg-gray-700 rounded-md">
                    <i className="fas fa-plus me-2"></i>Add Bedroom
                </button>
            </div>
        </div>
        <div>
            <label htmlFor="otherAmenities" className="form-label">Other Amenities</label>
            <input type="text" name="otherAmenities" id="otherAmenities" value={formData.otherAmenities} onChange={handleChange} className="form-input" placeholder="e.g., WiFi, AC, TV, Fireplace" />
            <p className="text-xs text-gray-500 mt-1">Separate with commas.</p>
        </div>
    </div>
)};

const MediaTab = ({ formData, handleImageChange, handleVideoChange, handleRemoveMedia, t }: any) => (
    <div className="space-y-6">
        <div>
            <label className="form-label">{t('homePagePicture')}</label>
            <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, false)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"/>
            {formData.featuredImage && <img src={formData.featuredImage} alt="Featured preview" className="mt-2 h-32 w-auto rounded-md object-cover"/>}
        </div>
        <div>
            <label className="form-label">Gallery Images</label>
            <input type="file" accept="image/*" multiple onChange={(e) => handleImageChange(e, true)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"/>
            {formData.gallery.length > 0 && (
                <div className="mt-2 grid grid-cols-3 md:grid-cols-5 gap-2">
                    {formData.gallery.map((img: string, index: number) => (
                        <div key={index} className="relative group">
                            <img src={img} alt={`Gallery preview ${index+1}`} className="h-24 w-full rounded-md object-cover"/>
                            <button type="button" onClick={() => handleRemoveMedia(index, 'gallery')} className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100">&times;</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
         <div>
            <label className="form-label">Unit Videos (Max {MAX_VIDEO_SIZE_MB}MB each)</label>
            <input type="file" accept="video/*" multiple onChange={handleVideoChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"/>
            {formData.videos.length > 0 && (
                <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                    {formData.videos.map((videoSrc: string, index: number) => (
                         <div key={index} className="relative group">
                            <video src={videoSrc} controls className="h-32 w-full rounded-md object-cover bg-black"></video>
                             <button type="button" onClick={() => handleRemoveMedia(index, 'videos')} className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100">&times;</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
);


const CancellationTab = ({ formData, handleChange, t }: any) => (
    <div>
        <label htmlFor="cancellationPolicy" className="form-label">{t('cancellationAndRefund')}</label>
        <textarea name="cancellationPolicy" id="cancellationPolicy" value={formData.cancellationPolicy} onChange={handleChange} rows={10} className="form-input"></textarea>
    </div>
);

export default AddUnitForm;
