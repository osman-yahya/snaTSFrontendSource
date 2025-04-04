import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero Section */}
      <header className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            SnA Timesheet Yönetim Sistemi
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Çalışanlarınızın zaman yönetimini kolaylaştıran modern çözüm
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              to="/login" 
              className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Giriş Yap
            </Link>
            <Link 
              to="/signup" 
              className="px-8 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Kayıt Ol
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gray-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Uygulama Özellikleri
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Zaman Takibi</h3>
              <p className="text-gray-600">
                Çalışanlar projelerde harcadıkları zamanı kolayca kaydedebilir ve yöneticiler analiz edebilir.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Rol Bazlı Erişim</h3>
              <p className="text-gray-600">
                Çalışan ve yönetici rolleriyle farklı yetkilendirme seviyeleri.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Geçmişe Dönük Kayıt</h3>
              <p className="text-gray-600">
                Unutulan zaman kayıtlarını geçmiş tarihlerle ekleyebilme imkanı.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Detaylı Raporlar</h3>
              <p className="text-gray-600">
                Excel çıktıları ve grafiklerle detaylı analiz imkanı.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Proje Hakkında
          </h2>
          
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-2/3">
              <p className="text-gray-700 mb-6">
                Bu proje, SnA Danışmanlık için geliştirilmiş bir timesheet yönetim sistemidir. 
                Modern web teknolojileri kullanılarak geliştirilmiş olup, çalışanların zaman 
                yönetimini kolaylaştırmayı ve yöneticilere detaylı analiz imkanı sunmayı amaçlamaktadır.
              </p>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-yellow-700">
                  <strong>Not:</strong> Uzun süre kullanılmadığında backend uykuya geçmektedir. 
                  Bu nedenle ilk giriş isteğinden sonra sistemin tam olarak hazır hale gelmesi 
                  yaklaşık 1 dakika sürebilir.
                </p>
              </div>
            </div>
            
            <div className="md:w-1/3 bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Geliştirici</h3>
              <p className="text-gray-700 mb-2">Osman Yahya Akıncı</p>
              <p className="text-blue-600 hover:text-blue-800">
                <a href="mailto:osmanyahyaakinci@icloud.com">osmanyahyaakinci@icloud.com</a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 bg-gray-800 text-white text-center">
        <div className="max-w-6xl mx-auto px-4">
          <p>© {new Date().getFullYear()} SnA Danışmanlık - Timesheet Yönetim Sistemi</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;