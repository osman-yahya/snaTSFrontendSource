import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, Zoom } from "react-toastify"
import { useDispatch } from 'react-redux';
import UserService from '../../bridge/UserOps';
import { pullUserCredentials } from '../redux/userCredSlice';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)
    try {
      const response = await UserService.login(email, password)
      toast.success('Giriş Başarılı!', {
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
      setLoading(false)
      dispatch(pullUserCredentials()).then(()=>{
        navigate("/dash")
      })

    } catch (error) {
      toast.error(`Kullanıcı Bilgileri Hatalı`, {
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
      setLoading(false)
    }
  };

  return (
    <div className="bg-gray-100 h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-700">Giriş Yap</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-600">E-posta</label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="E-posta adresinizi girin"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-600">Şifre</label>
            <input
              type="password"
              id="password"
              name="password"
              className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Şifrenizi girin"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {
            loading ? <button 
            type="submit" 
            className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed" 
            disabled>
            Giriş Yap
          </button> : <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              Giriş Yap
            </button>
          }
        </form>
        <div className="mt-4 text-center text-sm text-gray-600">
          <span>Hesabınız yok mu?
            <button
              onClick={() => navigate('/signup')}
              className="text-blue-600 hover:text-blue-700">
              Kayıt Olun
            </button>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
