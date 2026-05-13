'use client';

import 'react-toastify/dist/ReactToastify.css';

import { ToastContainer } from 'react-toastify';

// Root toast container — mount 1 lần ở RootLayout.
// Mặc định toast hiện ở góc dưới phải (bottom-right) theo yêu cầu UX.
export function ToastProvider() {
  return (
    <ToastContainer
      position="bottom-right"
      autoClose={3000}
      newestOnTop
      closeOnClick
      pauseOnFocusLoss={false}
      pauseOnHover
      draggable
      theme="light"
    />
  );
}
