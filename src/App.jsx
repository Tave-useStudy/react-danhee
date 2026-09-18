import {useState} from 'react'
import TextInput from './components/TextInput'
import TaskList from './components/TaskList'
import UserProfile from './components/UserProfile';

export default function App() {
  const [todos, setTodos] = useState([]);

  //할 일 추가
  const addTodo = (text) => {
    const newTodo = {
      id: Date.now(),
      text: text,
      done: false,
    };

    setTodos((previousTodos) => [...previousTodos, newTodo]);
  }

  //할 일 상태 업데이트
  const updateTodoStatus = (id) => {
    setTodos((previousTodos) => previousTodos.map((todo) => todo.id === id ? { ...todo, done: !todo.done} : todo
      )
    )
  }

  //할 일 삭제 
  const deleteTodo = (id) => {
    setTodos((previousTodos) => previousTodos.filter((todo) => todo.id !== id))
  }

  return (
    <div>
      <h1>투두리스트</h1>

      <UserProfile/>
      <TextInput addTodo={addTodo} />
      <TaskList todos={todos} updateTodoStatus={updateTodoStatus} deleteTodo={deleteTodo} />
    </div>
  )
}
