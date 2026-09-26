import {useState} from 'react'
import { Routes, Route } from "react-router-dom";

import MainPage from "./pages/MainPage";
import TodoDetailPage from "./pages/TodoDetailPage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  const [todos, setTodos] = useState([]);

  //할 일 추가
  const addTodo = (text, category, priority) => {
    const newTodo = {
      id: Date.now(),
      text: text,
      done: false,
      category,
      priority,
    };

    setTodos((previousTodos) => [...previousTodos, newTodo]);
  };

  //할 일 상태 업데이트
  const updateTodoStatus = (id) => {
    setTodos((previousTodos) => previousTodos.map((todo) => todo.id === id ? { ...todo, done: !todo.done} : todo
      )
    )
  };

  //할 일 삭제 
  const deleteTodo = (id) => {
    setTodos((previousTodos) => previousTodos.filter((todo) => todo.id !== id))
  };

  //할 일 수정
  const updateTodoText = (id, newText) => {
    setTodos((previousTodos) => previousTodos.map((todo) => todo.id === id ? {...todo, text: newText} : todo))
  };

    return (
      <Routes>
        <Route
          path="/"
          element={
          <MainPage
              todos={todos}
              addTodo={addTodo}
              updateTodoStatus={updateTodoStatus}
              deleteTodo={deleteTodo}
              updateTodoText={updateTodoText}
            />
          }
        />

        <Route
          path="/todos/:id"
          element={<TodoDetailPage todos={todos} />}
        />

        <Route
          path="/settings"
          element={<SettingsPage />}
        />
      </Routes>
    );
  }