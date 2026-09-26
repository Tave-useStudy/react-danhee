import { useNavigate, useParams } from "react-router-dom";

export default function TodoDetailPage({todos}) {
    const { id } = useParams();
    const navigate = useNavigate();

    const todo = todos.find((todo) => todo.id ===Number(id));
    
    if (!todo) {
        return (
            <div>
                <h1>할 일을 찾을 수 없습니다.</h1>

                <button onClick={() => navigate("/")}>메인으로</button>
            </div>
        );
    }

    return (
        <div>
        <h1>할 일 상세 페이지</h1>

        <p>내용: {todo.text}</p>
        <p>카테고리: {todo.category}</p>
        <p>우선순위: {todo.priority}</p>
        <p>상태: {todo.done ? "완료" : "미완료"}</p>
        <button onClick={() => navigate("/")}>메인으로</button>
        </div>
    );
}