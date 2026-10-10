import {useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { initialTodoState,todoReducer } from './reducers/todoReducer';
import { useLocalStorage } from './hooks/useLocalStorage';
import { fetchTodos } from './api/todosApi';
import { Routes, Route } from "react-router-dom";

import MainPage from "./pages/MainPage";
import TodoDetailPage from "./pages/TodoDetailPage";
import SettingsPage from "./pages/SettingsPage";


export default function App() {
    return (
      <Routes>
      <Route
        path="/"
        element={<MainPage />}
      />

      <Route
        path="/todos/:id"
        element={<TodoDetailPage />}
      />

      <Route
        path="/settings"
        element={<SettingsPage />}
      />
      </Routes>
    );
  }