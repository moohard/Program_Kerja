import 'flatpickr/dist/flatpickr.css';
import 'swiper/swiper-bundle.css';
import '@/assets/css/style.css';
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS
import { ToastContainer } from 'react-toastify';
import ProvidersWrapper from './components/ProvidersWrapper';
import AppRoutes from './routes';
import NotificationHandler from './components/NotificationHandler';

const App = () => {
  return (
    <ProvidersWrapper>
      <NotificationHandler />
      <AppRoutes />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </ProvidersWrapper>
  );
};
export default App;