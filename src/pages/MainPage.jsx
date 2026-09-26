import {useState} from "react";
import { useNavigate } from "react-router-dom";

import TextInput from "../components/TextInput";
import TaskList from "../components/TaskList";
import UserProfile from "../components/UserProfile";

    export default function MainPage({todos, addTodo, updateTodoStatus, deleteTodo, updateTodoText}) {
        const [categoryFilter, setCategoryFilter] = useState("all");
        const [statusFilter, setStatusFilter] = useState("all");
        const [sortType, setSortType] = useState("latest");

        const navigate = useNavigate();

    //카테고리 필터
    const categoryFilteredTodos = todos.filter((todo) => {
        if(categoryFilter === "all") {
            return true;
        }

        return todo.category === categoryFilter;
    });

    //완료 상태 필터
    const statusFilteredTodos = categoryFilteredTodos.filter((todo) => {
        if(statusFilter === "completed") {
            return todo.done;
        }

        if (statusFilter === "active") {
            return !todo.done;
        }

        return true;
    });

    //우선순위 기준
    const priorityOrder = {
        high: 1,
        medium: 2,
        low: 3,
    };

    //정렬
    const sortedTodos = statusFilteredTodos.toSorted(
        (a,b) => {
            if (sortType === "priority") {
                return (
                    priorityOrder[a.priority] - priorityOrder[b.priority]
                );
            }

            if (sortType === "oldest") {
                return a.id - b.id;
            }

            return b.id - a.id;
        }
    );

    return (
        <div>
        <h1>투두리스트</h1>

        <button onClick={() => navigate("/settings")}>설정</button>

        <UserProfile></UserProfile>

        <TextInput addTodo={addTodo}></TextInput>

        <h3>카테고리</h3>

        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="all">전체</option>
            <option value="study">공부</option>
            <option value="daily">일상</option>
            <option value="exercise">운동</option>
        </select>

        <h3>완료 상태</h3>

        <button onClick={() => setStatusFilter("all")}>
            전체
        </button>

        <button
            onClick={() => setStatusFilter("completed")}
        >
            완료
        </button>

        <button onClick={() => setStatusFilter("active")}>
            미완료
        </button>

        <h3>정렬</h3>

        <select value={sortType} onChange={(e) => setSortType(e.target.value)}>
            <option value="latest">최신순</option>
            <option value="oldest">오래된순</option>
            <option value="priority">우선순위순</option>
        </select>

        <TaskList todos={sortedTodos} updateTodoStatus={updateTodoStatus} deleteTodo={deleteTodo} updateTodoText={updateTodoText}></TaskList>

        </div>
    );
    }