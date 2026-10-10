import { useBoard } from "../../context/BoardContext";

    export default function Card({ todo }) {
    const {
        actions: {
        moveTodo,
        deleteTodo,
        openModal,
        },
    } = useBoard();

    return (
        <article className="card">
        <h3>{todo.text}</h3>

        <p>카테고리: {todo.category}</p>
        <p>우선순위: {todo.priority}</p>

        <button type="button" onClick={() => openModal("detail", todo.id)}>상세</button>
        <button type="button" onClick={() => openModal("edit", todo.id)}>수정</button>

        {todo.status === "todo" && (
            <button
            type="button"
            onClick={() =>
                moveTodo(todo.id, "doing")
            }
            >
            진행 중으로
            </button>
        )}

        {todo.status === "doing" && (
            <>
            <button
                type="button"
                onClick={() =>
                moveTodo(todo.id, "todo")
                }
            >
                할 일로
            </button>

            <button
                type="button"
                onClick={() =>
                moveTodo(todo.id, "done")
                }
            >
                완료로
            </button>
            </>
        )}

        {todo.status === "done" && (
            <button
            type="button"
            onClick={() =>
                moveTodo(todo.id, "doing")
            }
            >
            진행 중으로
            </button>
        )}

        <button
            type="button"
            onClick={() => deleteTodo(todo.id)}
        >
            삭제
        </button>
        </article>
    );
    }