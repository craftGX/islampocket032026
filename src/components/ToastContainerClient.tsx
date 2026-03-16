"use client";

import { ToastContainer } from "react-toastify";

export default function ToastContainerClient() {
  return (
    <ToastContainer
      position="top-center"
      autoClose={2500}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      draggable
      pauseOnHover
      theme="colored"
    />
  );
}
