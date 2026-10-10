import { useNavigate, useParams } from "react-router-dom";
import { useBoard } from "../context/BoardContext";

export default function TodoDetailPage() {
    const { state: { todos } } = useBoard();
    const { id } = useParams();
    const navigate = useNavigate();

    const todo = todos.find((todo) => String(todo.id) ===String(id));
    
    const statusText = {
    todo: "할 일",
    doing: "진행 중",
    done: "완료",
    }[todo.status];

    if (!todo) {
        return (
            <div>
                <h1>할 일을 찾을 수 없습니다.</h1>

                <button type="button" onClick={() => navigate("/")}>메인으로</button>
            </div>
        );
    }

    return (
        <div>
        <h1>할 일 상세 페이지</h1>

        <p>내용: {todo.text}</p>
        <p>카테고리: {todo.category}</p>
        <p>우선순위: {todo.priority}</p>
        <p>상태: {statusText}</p>
        <button onClick={() => navigate("/")}>메인으로</button>
        </div>
    );
}