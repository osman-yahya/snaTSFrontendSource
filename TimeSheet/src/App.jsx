import { Routes , Route} from "react-router"
import './App.css'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Dash from './pages/Dash'
import {ToastContainer} from "react-toastify"
import LogoutPage from './pages/LogoutPage'
import AdminPage from "./pages/AdminPage"
import WorksPage from "./pages/WorksPage"
import HomePage from "./pages/HomePage"
import NotFoundPage from "./pages/Notfound"

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/signup" element={<SignUp/>} />
        <Route path="/logout" element={<LogoutPage/>} />
        <Route path="/dash" element={<Dash/>} />
        <Route path="/dash/admin" element={<AdminPage/>} />
        <Route path="/dash/works" element={<WorksPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <ToastContainer />

    </>
  )
}

export default App
