import {useState} from "react";
import { useNavigate } from "react-router-dom";
import { useBoard } from "../context/BoardContext";

import TextInput from "../components/TextInput";
import Board from "../components/board/Board";
import UserProfile from "../components/UserProfile";
import TodoDetailModal from "../components/modal/TodoDetailModal";
import TodoEditModal from "../components/modal/TodoEditModal";

import styles from "./MainPage.module.css";

    function getTodoOrder(todo) {
    if (typeof todo.id === "number") {
        return todo.id;
    }

    const numberPart = String(todo.id).match(
        /\d+$/
    );

    if (!numberPart) {
        return 0;
    }

    return Number(numberPart[0]);
    }

    export default function MainPage() {
    const {
        state: { todos, status, error },

        actions: { addTodo,loadApiTodos },
    } = useBoard();

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

    //우선순위 기준
    const priorityOrder = {
        high: 1,
        medium: 2,
        low: 3,
    };

    //정렬
    const sortedTodos =
    categoryFilteredTodos.toSorted((a, b) => {
        if (sortType === "priority") {
            const aPriority =
            priorityOrder[a.priority] ?? 999;

            const bPriority =
            priorityOrder[b.priority] ?? 999;

            return aPriority - bPriority;
        }

        if (sortType === "oldest") {
            return (
            getTodoOrder(a) - getTodoOrder(b)
            );
        }

        if (sortType === "latest") {
            return (
            getTodoOrder(b) - getTodoOrder(a)
            );
        }

        return 0;
        });

    if (status === "loading") {
    return (
        <div className={styles.loadingContainer}>
        <div
            className={styles.spinner}
            aria-hidden="true"
        />

        <p>투두를 불러오는 중입니다...</p>
        </div>
    );
    }

    if (status === "error") {
    return (
        <div
        className={styles.errorContainer}
        role="alert"
        >
        <p>
            {error ||
            "투두를 불러오지 못했습니다."}
        </p>

        <button
            type="button"
            onClick={() => loadApiTodos()}
        >
            다시 시도
        </button>
        </div>
    );
    }

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

        <h3>정렬</h3>

        <select value={sortType} onChange={(e) => setSortType(e.target.value)}>
            <option value="latest">최신순</option>
            <option value="oldest">오래된순</option>
            <option value="priority">우선순위순</option>
        </select>

    <Board>
    <Board.Column
        title="할 일"
        status="todo"
        todos={sortedTodos}
    />

    <Board.Column
        title="진행 중"
        status="doing"
        todos={sortedTodos}
    />

    <Board.Column
        title="완료"
        status="done"
        todos={sortedTodos}
    />
    </Board>

    <TodoDetailModal />
    <TodoEditModal />

        </div>
    );
    }