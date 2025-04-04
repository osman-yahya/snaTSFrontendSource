import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { pullWorksAsAdmin } from '../redux/worksSlice';
import { format, parseISO } from 'date-fns';
import { toast, Zoom } from "react-toastify";
import { pullAllUsers, toggleUserRole } from '../redux/allUsersSlice';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

function AdminPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { worksList, status, error } = useSelector(state => state.works);
  const { users = [], Usersstatus, Userserror } = useSelector(state => state.allUsers);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(pullAllUsers());
      } catch (err) {
        console.error("Veri çekme hatası:", err);
        navigate('/login');
      }
    };
    fetchData();
  }, [dispatch, navigate]);

  // State'ler
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyManagers, setShowOnlyManagers] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserWorksPopup, setShowUserWorksPopup] = useState(false);

  // Filtrelenmiş kullanıcılar
  const filteredUsers = users.filter(user => {
    const first_name = user.first_name || '';
    const last_name = user.last_name || '';
    const nameMatch = `${first_name} ${last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    const managerMatch = showOnlyManagers ? user.isManager : true;
    return nameMatch && managerMatch;
  });

  // Tarihe göre gruplama
  const groupedWorks = worksList.reduce((acc, work) => {
    const date = work.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(work);
    return acc;
  }, {});

  // Excel'e aktarma fonksiyonu
const exportUserWorksToExcel = () => {
  console.log("BURDAA")
  if (!selectedUser || worksList.length === 0) return;

  // Excel verisini hazırla
  const excelData = worksList.map(work => ({
    'Tarih': format(parseISO(work.date), 'dd.MM.yyyy'),
    'Firma': work.company === 1 ? "Firma A" :
             work.company === 2 ? "Firma B" :
             work.company === 3 ? "Firma C" :
             work.company === 4 ? "Internal" :
             work.company === 5 ? "Resmi Tatil" :
             work.company === 6 ? "İzin" : "Bilinmiyor",
    'Açıklama': work.about,
    'Saat': work.work_hour
  }));

  // Çalışma sayfası oluştur
  const ws = XLSX.utils.json_to_sheet(excelData);
  
  // Çalışma kitabı oluştur
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "İş Kayıtları");
  
  // Excel dosyasını indir
  const fileName = `${selectedUser.first_name}_${selectedUser.last_name}_İş_Kayıtları_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`;
  XLSX.writeFile(wb, fileName);
};
  

  // Kullanıcı rolünü değiştirme fonksiyonu
  // Kullanıcı rolünü değiştirme fonksiyonu (düzeltilmiş versiyon)
  const handleToggleRole = async (userId) => {
    try {
      await dispatch(toggleUserRole({ id: userId })).unwrap();
      toast.success('Kullanıcı rolü başarıyla güncellendi!', {
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
      dispatch(pullAllUsers()); // Kullanıcı listesini yenile

      // Popup'taki kullanıcıyı güncelle
      if (selectedUser?.id === userId) {
        setSelectedUser(prev => ({
          ...prev,
          isManager: !prev.isManager
        }));
      }
    } catch (err) {
      console.error('Rol değiştirme hatası:', err);
      toast.error(err.message || 'Rol değiştirilirken bir hata oluştu!', {
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
    }
  };

  // Kullanıcı işlerini görüntüleme fonksiyonu
  const handleViewUserWorks = async (userId) => {
    toast.info('Kullanıcı Bilgileri yükleniyor...', {
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
    try {
      const user = users.find(u => u.id === userId);
      setSelectedUser(user);
      await dispatch(pullWorksAsAdmin({ user: userId })).unwrap();
      setShowUserWorksPopup(true);
    } catch (err) {
      console.error('Kullanıcı işleri yüklenirken hata:', err);
      toast.error('Bilgiler yüklenirken bir hata oluştu!', {
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
    }
  };

  // Avatar harflerini güvenli şekilde oluştur
  const getAvatarLetters = (user) => {
    const firstChar = user?.first_name?.[0] || '';
    const lastChar = user?.last_name?.[0] || '';
    return `${firstChar}${lastChar}`;
  };

  return (
    <div className="flex h-screen bg-gray-50 relative">
      {/* Sidebar */}
      <div className="w-64 bg-blue-800 text-white p-5">
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold">Kullanıcı Yönetimi</h2>
          <p className="text-sm text-blue-200">Admin Paneli</p>
        </div>
        <hr className="border-blue-600 mb-4" />
        <nav>
          <ul className="space-y-2">
            <li className="px-3 py-2 rounded hover:bg-blue-700 cursor-pointer">
              <Link to="/dash" className="block">Dashboard</Link>
            </li>
            <li className="px-3 py-2 rounded hover:bg-blue-700 cursor-pointer">
              <Link to="/dash/admin" className="block">Kullanıcılar</Link>
            </li>
            <li className="px-3 py-2 rounded hover:bg-blue-700 cursor-pointer">
              <Link to="/dash/works" className="block">Tüm İşler</Link>
            </li>
            <li className="px-3 py-2 rounded hover:bg-blue-700 cursor-pointer">
              <Link to="/logout" className="block">Çıkış Yap</Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Ana içerik */}
      <div className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6">Kullanıcı Listesi</h1>

        {/* Filtreleme alanı */}
        <div className="bg-white p-4 rounded-lg shadow border border-blue-100 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">İsim Ara</label>
              <input
                type="text"
                placeholder="İsim veya soyisim girin..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnlyManagers}
                  onChange={() => setShowOnlyManagers(!showOnlyManagers)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Sadece yöneticileri göster</span>
              </label>
            </div>
          </div>
        </div>

        {/* Kullanıcı listesi */}
        {Usersstatus === 'loading' ? (
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-md"></div>
            ))}
          </div>
        ) : Userserror ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Hata!</strong> {Userserror}
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ad Soyad
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            {getAvatarLetters(user)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.first_name || ''} {user.last_name || ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email || ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isManager ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                          {user.isManager ? 'Yönetici' : 'Kullanıcı'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewUserWorks(user.id)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          İncele
                        </button>
                        
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                      Kullanıcı bulunamadı
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Kullanıcı Çalışmaları Popup */}
      {showUserWorksPopup && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ease-in-out">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
            onClick={() => setShowUserWorksPopup(false)}
          ></div>

          {/* Popup Container */}
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
      <div className="flex-1">
        <h2 className="text-xl font-semibold">
          {selectedUser.first_name || ''} {selectedUser.last_name || ''} - Çalışma Kayıtları
        </h2>
        <div className="text-sm text-gray-500">
          ID: {selectedUser.id || ''} | Email: {selectedUser.email || ''}
        </div>
      </div>
      <div className="flex items-center">
        {/* Excel'e Aktar Butonu */}
        <button
          onClick={() => exportUserWorksToExcel()}
          disabled={worksList.length === 0}
          className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed mr-2"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Excel'e Aktar
        </button>
        
        <button
          onClick={() => setShowUserWorksPopup(false)}
          className="text-gray-500 hover:text-gray-700 transition-colors ml-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

              {/* Rol Değiştirme Butonu */}
              <div className="mb-6">
                <button
                  onClick={() => handleToggleRole(selectedUser.id)}
                  className={`px-4 py-2 rounded-md text-white ${selectedUser.isManager ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}
                >
                  {selectedUser.isManager ? 'Yönetici Rolünü Kaldır' : 'Yönetici Rolü Ver'}
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  Mevcut rol: {selectedUser.isManager ? 'Yönetici' : 'Standart Kullanıcı'}
                </p>
              </div>

              {/* Loading/Error States */}
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
                            <div key={work.id} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow relative">
                              <h3 className="font-medium">{work.about}</h3>
                              <p className="text-gray-600 text-sm mt-1">
                                {work.company === 1 ? "Firma A" :
                                  work.company === 2 ? "Firma B" :
                                    work.company === 3 ? "Firma C" :
                                      work.company === 4 ? "Internal" :
                                        work.company === 5 ? "Resmi Tatil" :
                                          work.company === 6 ? "İzin" :
                                            "Bilinmiyor"}
                              </p>
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
        </div>
      )}
    </div>
  );
}

export default AdminPage;