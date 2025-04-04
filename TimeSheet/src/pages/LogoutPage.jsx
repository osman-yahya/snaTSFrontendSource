import React, { useEffect } from 'react';
import { Button, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import UserService from '../../bridge/UserOps';

const LogoutPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const logoutUser = async () => {
      try {
        await UserService.logout();
        console.log("DONE")

      } catch (error) {
        navigate("/"); // Hata durumunda da ana sayfaya yönlendirme
      }
    };

    logoutUser(); // Asenkron logout işlemini başlat
  }, [navigate]);

  const handleRedirect = () => {
    navigate("/"); // Kullanıcı butona tıkladığında ana sayfaya yönlendir
  };

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center">
      <Container maxWidth="sm" className="text-center p-8 bg-white shadow-lg rounded-lg">
        <Typography variant="h4" className="text-green-600 font-bold mb-4">
          Görüşmek Üzere!
        </Typography>
        <Typography variant="body1" className="mb-6">
          Başarıyla Çıkış Yapıldı
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleRedirect}
          className="py-2 px-6"
        >
          Go to Home
        </Button>
      </Container>
    </div>
  );
};

export default LogoutPage;
