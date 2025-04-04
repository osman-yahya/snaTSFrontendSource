import React, { useState } from 'react';
import {useNavigate} from "react-router-dom"
import UserService from '../../bridge/UserOps';
import {toast , Zoom} from "react-toastify"

const SignUp = () => {
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false)


    const handleSubmit = async (e) => {
        setLoading(true)
        e.preventDefault();
        try {
            const response = await UserService.register(firstName,lastName,username,email,password)
            toast.success('Kullanıcı Kaydı Başarılı, Yönlendiriliyor', {
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
            console.log(response);
            setTimeout(()=>{
                navigate("/login")
            },3000)
        } catch (error) {
            toast.error(`Bir Hata Oluştu : ${error.response.data.message}`, {
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
    const navigate = useNavigate();

    return (
        <div className="bg-gray-100 h-screen flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-semibold text-center mb-6 text-gray-700">Kayıt Ol</h2>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="username" className="block text-sm font-medium text-gray-600">Kullanıcı Adı</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Kullanıcı adınızı girin"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-600">İsim</label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="İsminizi girin"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-600">Soyisim</label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Soyadınızı girin"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                        />
                    </div>

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
                            Kayıt Ol
                        </button>
                    }
                    
                </form>

                <div className="mt-4 text-center text-sm text-gray-600">
                    <span>Hesabınız mı var?
                        <button
                            onClick={() => navigate('/login')}
                            className="text-blue-600 hover:text-blue-700">
                            Oturum Aç
                        </button>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
