import {useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { lazy, Suspense } from "react";
import { initialTodoState,todoReducer } from './reducers/todoReducer';
import { useLocalStorage } from './hooks/useLocalStorage';
import { fetchTodos } from './api/todosApi';
import { Routes, Route } from "react-router-dom";

const MainPage = lazy(() => import("./pages/MainPage"));
const TodoDetailPage = lazy(() => import("./pages/TodoDetailPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));


export default function App() {
    return (
      <Suspense fallback={<p>페이지 불러오는 중...</p>}>
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
      </Suspense>
    );
  }