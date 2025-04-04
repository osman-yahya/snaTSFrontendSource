import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { pullWorksAsAdmin } from '../redux/worksSlice';
import { pullAllUsers } from '../redux/allUsersSlice';
import { format, parseISO, isWithinInterval } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

function WorksPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { worksList, status, error } = useSelector(state => state.works);
  const { users = [], Usersstatus, Userserror } = useSelector(state => state.allUsers);

  // State'ler
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await dispatch(pullAllUsers());
        await dispatch(pullWorksAsAdmin({user: "", company: "", date: ""}));
        setLoading(false);
      } catch (err) {
        console.error("Veri çekme hatası:", err);
        setLoading(false);
        navigate('/login');
      }
    };
    fetchData();
  }, [dispatch, navigate]);

  // İstatistikleri hesapla
  const calculateStatistics = () => {
    const stats = {
      companies: {
        1: { name: "Firma A", totalHours: 0 },
        2: { name: "Firma B", totalHours: 0 },
        3: { name: "Firma C", totalHours: 0 },
        4: { name: "Internal", totalHours: 0 },
        5: { name: "Resmi Tatil", totalHours: 0 },
        6: { name: "İzin", totalHours: 0 }
      },
      totalHours: 0,
      totalRecords: worksList.length,
      users: {}
    };

    worksList.forEach(work => {
      if (stats.companies[work.company]) {
        stats.companies[work.company].totalHours += work.work_hour;
      }

      stats.totalHours += work.work_hour;

      const user = users.find(u => u.id === work.user);
      if (user) {
        if (!stats.users[user.id]) {
          stats.users[user.id] = {
            name: `${user.first_name} ${user.last_name}`,
            totalHours: 0
          };
        }
        stats.users[user.id].totalHours += work.work_hour;
      }
    });

    return stats;
  };

  const stats = calculateStatistics();

  // Excel'e aktarma fonksiyonu
  const exportToExcel = () => {
    const excelData = filteredWorks.map(work => ({
      'Tarih': format(parseISO(work.date), 'dd.MM.yyyy'),
      'Kullanıcı': getUserName(work.user),
      'Firma': getCompanyName(work.company),
      'Açıklama': work.about,
      'Saat': work.work_hour
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "İş Kayıtları");
    const fileName = `İş_Kayıtları_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // Tarih aralığı kontrol fonksiyonu
  const isWithinDateRange = (workDate, start, end) => {
    if (!start && !end) return true;
    
    const date = parseISO(workDate);
    const startDateObj = start ? parseISO(start) : null;
    const endDateObj = end ? parseISO(end) : null;
    
    if (startDateObj && endDateObj) {
      return isWithinInterval(date, { start: startDateObj, end: endDateObj });
    } else if (startDateObj) {
      return date >= startDateObj;
    } else if (endDateObj) {
      return date <= endDateObj;
    }
    
    return true;
  };

  // Filtrelenmiş işler
  const filteredWorks = worksList.filter(work => {
    const userMatch = userFilter ? work.user === parseInt(userFilter) : true;
    const dateMatch = isWithinDateRange(work.date, startDate, endDate);
    const companyMatch = companyFilter ? work.company === parseInt(companyFilter) : true;
    const searchMatch = searchTerm ? 
      work.about.toLowerCase().includes(searchTerm.toLowerCase()) : true;

    return userMatch && dateMatch && companyMatch && searchMatch;
  });

  // Kullanıcı adını bulma fonksiyonu
  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.first_name} ${user.last_name}` : 'Bilinmeyen Kullanıcı';
  };

  // Firma adını döndürme
  const getCompanyName = (companyId) => {
    return stats.companies[companyId]?.name || 'Bilinmeyen';
  };

  // Yükleniyor durumu
  if (loading || Usersstatus === 'loading' || status === 'loading') {
    return (
      <div className="flex h-screen bg-gray-50 relative">
        <div className="w-64 bg-blue-800 text-white p-5"></div>
        <div className="flex-1 p-6 overflow-y-auto flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-3 text-lg">Yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  // Hata durumu
  if (Userserror || error) {
    return (
      <div className="flex h-screen bg-gray-50 relative">
        <div className="w-64 bg-blue-800 text-white p-5"></div>
        <div className="flex-1 p-6 overflow-y-auto flex items-center justify-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
            <strong>Hata!</strong> {Userserror || error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 relative">
      {/* Sidebar */}
      <div className="w-64 bg-blue-800 text-white p-5">
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold">İş Yönetimi</h2>
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
            <li className="px-3 py-2 rounded bg-blue-700 cursor-pointer">
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
        <h1 className="text-2xl font-bold mb-6">Tüm İş Kayıtları</h1>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border border-blue-100">
            <h3 className="text-gray-500 text-sm">Toplam Çalışma</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.totalHours} saat</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-blue-100">
            <h3 className="text-gray-500 text-sm">Toplam Kayıt</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.totalRecords} kayıt</p>
          </div>
          {Object.values(stats.companies).map(company => (
            <div key={company.name} className="bg-white p-4 rounded-lg shadow border border-blue-100">
              <h3 className="text-gray-500 text-sm">{company.name}</h3>
              <p className="text-2xl font-bold text-blue-600">{company.totalHours} saat</p>
            </div>
          ))}
        </div>

        {/* Filtreleme ve Excel butonu */}
        <div className="bg-white p-4 rounded-lg shadow border border-blue-100 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Filtreleme Seçenekleri</h2>
            <button
              onClick={exportToExcel}
              disabled={filteredWorks.length === 0}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Excel'e Aktar
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama Ara</label>
              <input
                type="text"
                placeholder="Açıklamada ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç Tarihi</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş Tarihi</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kullanıcı</label>
              <select
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tüm Kullanıcılar</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Firma</label>
              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tüm Firmalar</option>
                {Object.entries(stats.companies).map(([id, company]) => (
                  <option key={id} value={id}>{company.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* İş listesi */}
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarih
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kullanıcı
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Firma
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Açıklama
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Saat
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredWorks.length > 0 ? (
                filteredWorks.map(work => (
                  <tr key={work.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(parseISO(work.date), 'dd.MM.yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getUserName(work.user)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getCompanyName(work.company)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {work.about}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">
                      {work.work_hour} saat
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    Filtreleme kriterlerinize uygun iş bulunamadı
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default WorksPage;