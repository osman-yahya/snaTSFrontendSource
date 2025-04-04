
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { pullWorks, addNewWork, deleteWork } from '../redux/worksSlice';
import { pullUserCredentials } from '../redux/userCredSlice';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { toast, Zoom } from "react-toastify"
import { Link } from 'react-router-dom';


function Dash() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { firstName, lastName, email, isManager } = useSelector(state => state.userCred);
    const { worksList, status, error, addStatus, addError } = useSelector(state => state.works);

    // Form state
    const [formData, setFormData] = useState({
        company: '',
        work_hour: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        about: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [showForm, setShowForm] = useState(false);

    const handleDeleteWork = async (workId) => {
        try {
            await dispatch(deleteWork(workId)).unwrap();
            toast.success('İş silindi!', {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Zoom,
            });
            dispatch(pullWorks());

        } catch (err) {
            console.error('Silme hatası:', err);
        }
    };

    // Veri çekme
    useEffect(() => {
        const fetchData = async () => {
            try {
                await dispatch(pullUserCredentials());
                dispatch(pullWorks());
            } catch (err) {
                console.error("Veri çekme hatası:", err);
                navigate('/login');
            }
        };
        fetchData();
    }, [dispatch, navigate]);

    // Tarihe göre gruplama
    const groupedWorks = worksList.reduce((acc, work) => {
        const date = work.date;
        if (!acc[date]) acc[date] = [];
        acc[date].push(work);
        return acc;
    }, {});

    // Basit validasyon
    const validateForm = () => {
        const errors = {};
        if (!formData.company) errors.company = 'Şirket adı gerekli';
        if (!formData.work_hour || isNaN(formData.work_hour) || formData.work_hour > 8 || formData.work_hour < 1)
            errors.work_hour = 'Geçerli saat girin';
        if (!formData.date) errors.date = 'Tarih gerekli';
        if (!formData.about) errors.about = 'Açıklama gerekli';
        return errors;
    };

    // Form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            await dispatch(addNewWork({
                ...formData,
                work_hour: Number(formData.work_hour)
            })).unwrap();

            setShowForm(false);
            setFormData({
                company: '',
                work_hour: '',
                date: format(new Date(), 'yyyy-MM-dd'),
                about: ''
            });
            setFormErrors({});
            dispatch(pullWorks());
        } catch (err) {
            console.error('Ekleme hatası:', err);
        }
    };

    // Company seçimine göre otomatik doldurma
    useEffect(() => {
        if (formData.company === 'Resmi Tatil' || formData.company === 'İzinli Gün') {
            setFormData(prev => ({
                ...prev,
                work_hour: '0',
                about: `${prev.company}`
            }));
        }
    }, [formData.company]);

    // Toplam çalışma saati
    const totalHours = worksList.reduce((sum, work) => sum + work.work_hour, 0);

    return (
        <div className="flex h-screen bg-gray-50 relative">
            {/* Sidebar */}
            <div className="w-64 bg-blue-800 text-white p-5">
                <div className="text-center mb-4">
                    <h2 className="text-lg font-bold">{firstName} {lastName}</h2>
                    <p className="text-sm text-blue-200">{email}</p>
                </div>
                <hr className="border-blue-600 mb-4" />
                <nav>
                    <ul className="space-y-2">
                        <li className="px-3 py-2 rounded bg-blue-700 cursor-pointer">
                            Dashboard
                        </li>
                        <li
                            className="px-3 py-2 rounded hover:bg-blue-700 cursor-pointer"
                            onClick={() => setShowForm(true)}
                        >
                            Yeni İş Ekle
                        </li>
                        {isManager && <li className="px-3 py-2 rounded hover:bg-blue-700 cursor-pointer">
                            <Link to="/dash/admin" className="block">Kullanıcılar</Link>
                        </li>}
                        {isManager && <li className="px-3 py-2 rounded hover:bg-blue-700 cursor-pointer">
                            <Link to="/dash/admin" className="block">Tüm İşler</Link>
                        </li>}
                        <li className="px-3 py-2 rounded hover:bg-blue-700 cursor-pointer">
                            <Link to="/logout" className="block">Çıkış Yap</Link>
                        </li>
                    </ul>
                </nav>
            </div>

            {/* Ana içerik */}
            <div className="flex-1 p-6 overflow-y-auto">
                <h1 className="text-2xl font-bold mb-6">Çalışma Takip Paneli</h1>

                {/* Özet kartları */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow border border-blue-100">
                        <h3 className="text-gray-500 text-sm">Toplam Çalışma</h3>
                        <p className="text-2xl font-bold text-blue-600">{totalHours} saat</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow border border-blue-100">
                        <h3 className="text-gray-500 text-sm">Kayıtlı Gün</h3>
                        <p className="text-2xl font-bold text-blue-600">{worksList.length} gün</p>
                    </div>
                </div>

                {/* Çalışma listesi */}
                {status === 'loading' ? (
                    <div className="animate-pulse space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-20 bg-gray-200 rounded-md"></div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        <strong>Hata!</strong> {error}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {Object.keys(groupedWorks)
                            .sort((a, b) => new Date(b) - new Date(a))
                            .map(date => (
                                <div key={date} className="mb-8">
                                    <h2 className="text-xl font-semibold mb-4">
                                        {format(parseISO(date), 'dd MMMM yyyy')}
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {groupedWorks[date].map(work => (
                                            <div key={work.id} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow relative"> {/* relative ekledik */}
                                                {/* Silme butonu */}
                                                <button
                                                    onClick={() => handleDeleteWork(work.id)}
                                                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition-colors"
                                                    title="Sil"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>

                                                <h3 className="font-medium">{work.about}</h3>
                                                <p className="text-gray-600 text-sm mt-1">{
                                                    work.company === 1 ? "Firma A" :
                                                        work.company === 2 ? "Firma B" :
                                                            work.company === 3 ? "Firma C" :
                                                                work.company === 4 ? "Internal" :
                                                                    work.company === 5 ? "Resmi Tatil" :
                                                                        work.company === 6 ? "İzin" :
                                                                            "Bilinmiyor"
                                                }</p>
                                                <p className="text-blue-600 font-semibold mt-2">{work.work_hour} saat</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>

            {/* Popup Form */}
            <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ease-in-out ${showForm ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}>
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
                    onClick={() => setShowForm(false)}
                ></div>

                {/* Form Container */}
                <div className={`relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 transform transition-all duration-300 ${showForm ? 'scale-100' : 'scale-95'
                    }`}>
                    <div className="p-6">
                        {/* Form Header */}
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Yeni Çalışma Ekle</h2>
                            <button
                                onClick={() => setShowForm(false)}
                                className="text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Form Error Message */}
                        {addError && (
                            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 rounded">
                                <p>{addError}</p>
                            </div>
                        )}

                        {/* Form Success Message */}
                        {addStatus === 'succeeded' && (
                            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 mb-4 rounded">
                                <p>Çalışma başarıyla eklendi!</p>
                            </div>
                        )}

                        {/* Form Content */}
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                {/* Company Select */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Şirket*</label>
                                    <select
                                        name="company"
                                        value={formData.company}
                                        onChange={(e) => {
                                            setFormData({ ...formData, company: e.target.value });
                                            if (formErrors.company) setFormErrors({ ...formErrors, company: '' });
                                        }}
                                        className={`w-full p-2 border rounded-md transition-colors ${formErrors.company ? 'border-red-500' : 'border-gray-300 hover:border-blue-400'
                                            } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                    >
                                        <option value="">Şirket Seçin</option>
                                        <option value="1">Firma A</option>
                                        <option value="2">Firma B</option>
                                        <option value="3">Firma C</option>
                                        <option value="4">Internal</option>
                                        <option value="5">Resmi Tatil</option>
                                        <option value="6">İzin</option>
                                    </select>
                                    {formErrors.company && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.company}</p>
                                    )}
                                </div>

                                {/* Work Hour */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Çalışma Saati*</label>
                                    <input
                                        type="number"
                                        name="work_hour"
                                        min="0"
                                        max="24"
                                        value={formData.work_hour}
                                        onChange={(e) => {
                                            setFormData({ ...formData, work_hour: e.target.value });
                                            if (formErrors.work_hour) setFormErrors({ ...formErrors, work_hour: '' });
                                        }}
                                        className={`w-full p-2 border rounded-md transition-colors ${formErrors.work_hour ? 'border-red-500' : 'border-gray-300 hover:border-blue-400'
                                            } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                    />
                                    {formErrors.work_hour && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.work_hour}</p>
                                    )}
                                </div>

                                {/* Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tarih*</label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={(e) => {
                                            setFormData({ ...formData, date: e.target.value });
                                            if (formErrors.date) setFormErrors({ ...formErrors, date: '' });
                                        }}
                                        className={`w-full p-2 border rounded-md transition-colors ${formErrors.date ? 'border-red-500' : 'border-gray-300 hover:border-blue-400'
                                            } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                    />
                                    {formErrors.date && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.date}</p>
                                    )}
                                </div>

                                {/* About */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama*</label>
                                    <textarea
                                        name="about"
                                        rows={3}
                                        value={formData.about}
                                        onChange={(e) => {
                                            setFormData({ ...formData, about: e.target.value });
                                            if (formErrors.about) setFormErrors({ ...formErrors, about: '' });
                                        }}
                                        className={`w-full p-2 border rounded-md transition-colors ${formErrors.about ? 'border-red-500' : 'border-gray-300 hover:border-blue-400'
                                            } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                    />
                                    {formErrors.about && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.about}</p>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={addStatus === 'loading'}
                                        className={`w-full py-2 px-4 rounded-md text-white transition-colors ${addStatus === 'loading'
                                            ? 'bg-blue-400 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-700'
                                            }`}
                                    >
                                        {addStatus === 'loading' ? (
                                            <span className="flex items-center justify-center">
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Ekleniyor...
                                            </span>
                                        ) : 'Kaydet'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dash;















/* import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { pullWorks, addNewWork } from '../redux/worksSlice';
import { pullUserCredentials } from '../redux/userCredSlice';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';

function Dash() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { firstName, lastName, email } = useSelector(state => state.userCred);
  const { worksList, status, error } = useSelector(state => state.works);

  // Form state
  const [formData, setFormData] = useState({
    company: '',
    work_hour: '',
    date: '',
    about: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Veri çekme
  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(pullUserCredentials());
        dispatch(pullWorks());
      } catch (err) {
        console.error("Veri çekme hatası:", err);
        navigate('/login');
      }
    };
    fetchData();
  }, [dispatch, navigate]);

  // Tarihe göre gruplama
  const groupedWorks = worksList.reduce((acc, work) => {
    const date = work.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(work);
    return acc;
  }, {});



  // Basit validasyon
  const validateForm = () => {
    const errors = {};
    if (!formData.company) errors.company = 'Şirket adı gerekli';
    if (!formData.work_hour || isNaN(formData.work_hour)) 
      errors.work_hour = 'Geçerli saat girin';
    if (!formData.date) errors.date = 'Tarih gerekli';
    if (!formData.about) errors.about = 'Açıklama gerekli';
    return errors;
  };

  // Form submit
  

  // Toplam çalışma saati
  const totalHours = worksList.reduce((sum, work) => sum + work.work_hour, 0);

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 bg-blue-800 text-white p-5">
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold">{firstName} {lastName}</h2>
          <p className="text-sm text-blue-200">{email}</p>
        </div>
        <hr className="border-blue-600 mb-4" />
        <nav>
          <ul className="space-y-2">
            <li className="px-3 py-2 rounded hover:bg-blue-700 cursor-pointer">
              Dashboard
            </li>
            <li className="px-3 py-2 rounded hover:bg-blue-700 cursor-pointer">
              Yeni İş Ekle
            </li>
          </ul>
        </nav>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6">Çalışma Takip Paneli</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border border-blue-100">
            <h3 className="text-gray-500 text-sm">Toplam Çalışma</h3>
            <p className="text-2xl font-bold text-blue-600">{totalHours} saat</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-blue-100">
            <h3 className="text-gray-500 text-sm">Kayıtlı Gün</h3>
            <p className="text-2xl font-bold text-blue-600">{worksList.length} gün</p>
          </div>
        </div>

        {status === 'loading' ? (
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-md"></div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Hata!</strong> {error}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.keys(groupedWorks)
              .sort((a, b) => new Date(b) - new Date(a))
              .map(date => (
                <div key={date} className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">
                    {format(parseISO(date), 'dd MMMM yyyy')}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupedWorks[date].map(work => (
                      <div key={work.id} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
                        <h3 className="font-medium">{work.about}</h3>
                        <p className="text-gray-600 text-sm mt-1">{work.company}</p>
                        <p className="text-blue-600 font-semibold mt-2">{work.work_hour} saat</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}

        
      </div>
    </div>
  );
}

export default Dash; */







/* import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { pullWorks } from '../redux/worksSlice';
import { pullUserCredentials } from '../redux/userCredSlice';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
function Dash() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { firstName, lastName, username, email, status: userStatus } = useSelector(state => state.userCred);
    const { worksList, status: worksStatus, error } = useSelector(state => state.works);

    const [groupedWorks, setGroupedWorks] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                await dispatch(pullUserCredentials());
                dispatch(pullWorks());
            } catch (err) {
                console.error("Veri çekme hatası:", err);
                navigate('/login');
            }
        };

        fetchData();
    }, [dispatch, navigate]);

    useEffect(() => {
        if (worksList.length > 0) {
            const worksByDate = worksList.reduce((acc, work) => {
                const date = work.date;
                if (!acc[date]) {
                    acc[date] = [];
                }
                acc[date].push(work);
                return acc;
            }, {});
            setGroupedWorks(worksByDate);
        }
    }, [worksList]);

    return (
        <div className="flex h-screen bg-gray-100">
         
            <div className="w-64 bg-blue-800 text-white p-5">
                <div className="text-center mb-4">
                    <h2 className="text-lg font-bold">{firstName} {lastName}</h2>
                    <p>{username}</p>
                    <p>{email}</p>
                </div>
                <hr className="border-white mb-4" />
                <div>
                    <ul>
                        <li className="py-2 hover:bg-blue-700 cursor-pointer">Dashboard</li>
                        <li className="py-2 hover:bg-blue-700 cursor-pointer">Settings</li>
                        <li className="py-2 hover:bg-blue-700 cursor-pointer">Logout</li>
                    </ul>
                </div>
            </div>

         
            <div className="flex-1 p-8">
                <h1 className="text-3xl font-semibold mb-6">Dashboard</h1>
                {worksStatus === 'loading' ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p>Error: {error}</p>
                ) : (
                    <div className="space-y-6">
                        {Object.keys(groupedWorks).map(date => (
                            <div key={date}>
                                <h2 className="text-2xl font-bold mb-4">{date}</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {groupedWorks[date].map(work => (
                                        <div key={work.id} className="bg-white p-4 rounded shadow-md">
                                            <h3 className="font-semibold">{work.about}</h3>
                                            <p>{work.work_hour} hours</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

          
                <div className="mt-6 max-w-md mx-auto">
                    <h2 className="text-xl font-semibold mb-3">Add New Work</h2>
                    <form className="bg-white p-4 rounded shadow-md">
                        <div className="mb-3">
                            <label className="block mb-1">Company</label>
                            <input type="text" className="w-full px-4 py-2 border rounded-md" placeholder="Company Name" />
                        </div>
                        <div className="mb-3">
                            <label className="block mb-1">Work Hour</label>
                            <input type="number" className="w-full px-4 py-2 border rounded-md" placeholder="Work Hours" />
                        </div>
                        <div className="mb-3">
                            <label className="block mb-1">Date</label>
                            <input type="date" className="w-full px-4 py-2 border rounded-md" />
                        </div>
                        <div className="mb-3">
                            <label className="block mb-1">About</label>
                            <textarea className="w-full px-4 py-2 border rounded-md" placeholder="Describe the work" />
                        </div>
                        <button className="w-full bg-blue-600 text-white py-2 rounded-md">Add Work</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Dash;
 












 import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom'; // Yönlendirme için
import { pullWorks } from '../redux/worksSlice';
import { pullUserCredentials } from '../redux/userCredSlice';

function Dash() {
    const dispatch = useDispatch();
    const navigate = useNavigate(); // Yönlendirme için kullanıyoruz
    const { worksList, status, error } = useSelector(state => state.works);

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log("0000")
                //await UserService.refresh(); // Token refresh işlemi
                console.log("1111")
                await dispatch(pullUserCredentials()); // Kullanıcı bilgilerini al
                dispatch(pullWorks()); // Çalışma bilgilerini al
            } catch (err) {
                console.error("Veri çekme hatası:", err);
                navigate('/login'); // Hata alırsak giriş sayfasına yönlendir
            }
        };

        fetchData();
    }, [dispatch, navigate]); 

    return (
        <div>
            {status === 'loading' && <p>Loading...</p>}
            {error && <p>Error: {error}</p>}
            <ul>
                {worksList.map((work, index) => (
                    <li key={index}>
                        {work.work_hour} hours, About: {work.about}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Dash;
 */