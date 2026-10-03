import {useCallback, useEffect, useReducer, useRef} from 'react'
import { initialTodoState,todoReducer } from './reducers/todoReducer';
import { useLocalStorage } from './hooks/useLocalStorage';
import { fetchTodos } from './api/todosApi';
import { Routes, Route } from "react-router-dom";

import MainPage from "./pages/MainPage";
import TodoDetailPage from "./pages/TodoDetailPage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  const {loadValue, saveValue} = useLocalStorage("todo-data");
  const [state, dispatch] = useReducer(todoReducer, initialTodoState,
    (initialState) => {
      const savedTodos = loadValue([]);

      return {
        ...initialState,
        todos: savedTodos,
      };
    }
  );

  const todos = state.todos;
  const status = state.status;
  const error = state.error;

  const hasSavedTodos = useRef(
  state.todos.length > 0
);

useEffect(() => {
  saveValue(state.todos);
}, [state.todos, saveValue]);

const loadApiTodos = useCallback(
  async (signal) => {
    dispatch({
      type: "FETCH_START",
    });

    try {
      const apiTodos =
        await fetchTodos(signal);

      dispatch({
        type: "FETCH_SUCCESS",
        payload: apiTodos,
      });
    } catch (error) {
      if (error.name === "AbortError") {
        return;
      }

      dispatch({
        type: "FETCH_ERROR",
        payload:
          error.message ||
          "투두를 불러오지 못했습니다.",
      });
    }
  },
  []
);

useEffect(() => {
    if (hasSavedTodos.current) {
      return;
    }

    const controller =
      new AbortController();

    loadApiTodos(controller.signal);

    return () => {
      controller.abort();
    };
  }, [loadApiTodos]);


  //할 일 추가
  const addTodo = (text, category, priority) => {
    const newTodo = {
      id: Date.now(),
      text: text,
      done: false,
      category,
      priority,
    };

    dispatch({
      type: "ADD_TODO",
      payload: newTodo,
    });
  };

  //할 일 상태 업데이트
  const updateTodoStatus = (id) => {
    dispatch({type: "TOGGLE_TODO", payload: id,});
  };

  //할 일 삭제 
  const deleteTodo = (id) => {
    dispatch({type: "DELETE_TODO", payload: id,});
  };

  //할 일 수정
  const updateTodoText = (id, newText) => {
    dispatch({type: "UPDATE_TODO", payload: {id, newText},});
  }

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
              status={status}
              error={error}
              loadApiTodos={loadApiTodos}
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