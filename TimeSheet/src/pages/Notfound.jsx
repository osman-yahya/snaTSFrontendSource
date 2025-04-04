import React from 'react';
import { Button, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate("/") 
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <Container maxWidth="sm" className="text-center">
        <Typography variant="h2" className="text-red-600 font-bold mb-4">
          404 - Page Not Found
        </Typography>
        <Typography variant="body1" className="mb-6">
          Aradığınız bu sayfa bulunmamaktadır.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleRedirect}
          className="py-2 px-4"
        >
          Ana Sayfaya Dön
        </Button>
      </Container>
    </div>
  );
};

export default NotFoundPage;
