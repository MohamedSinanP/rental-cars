import { useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo';
import { FileQuestion } from 'lucide-react';

const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center justify-center space-y-6 rounded-lg bg-white p-8 shadow-lg">
        <Logo />

        <div className="mt-8 flex flex-col items-center">
          <div className="text-6xl font-bold text-gray-200">404</div>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <FileQuestion className="h-10 w-10 text-gray-500" />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-gray-900">Page Not Found</h1>
          <p className="mt-2 text-center text-gray-600">
            Sorry, the page you are looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex w-full space-x-4">
          <button
            className="mt-6 w-full rounded-md bg-teal-500 px-6 py-3 text-center font-medium text-white hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            onClick={() => navigate('/')}
          >
            Go Home
          </button>
        </div>
      </div>

      <p className="mt-8 text-sm text-gray-500">
        &copy; {new Date().getFullYear()} OwnCars. All rights reserved.
      </p>
    </div>
  );
};

export default NotFoundPage;