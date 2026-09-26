import {useState} from 'react'
import { useNavigate } from 'react-router-dom';

export default function TodoItem({todo, updateTodoStatus, deleteTodo, updateTodoText}) {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(todo.text);

    const navigate = useNavigate();

    const editOverLimit = editText.length > 20;

    //편집 모드
    const editTodo = () => {
        setEditText(todo.text);
        setIsEditing(true);
    };

    //수정 내용 저장
    const saveTodo = () => {
        const trimmedText = editText.trim();

        if (trimmedText === "") return;
        if (editOverLimit) return;
        
        updateTodoText(todo.id, trimmedText);
        setIsEditing(false);
    };

    //수정 취소
    const cancelTodo = () => {
        setEditText(todo.text);
        setIsEditing(false);
    };

    const goToDetail = () => {
        navigate(`/todos/${todo.id}`);
    };

        return (
        <li>
        {isEditing ? (
            <>
            <input value={editText} onChange={(e) => setEditText(e.target.value)}/>

            <span>{editText.length}/20</span>

            {editOverLimit && (<p>20자 이내로 입력해 주세요.</p>)}

            <button onClick={saveTodo} disabled={editOverLimit}>저장</button>

            <button onClick={cancelTodo}>취소</button>
            </>
        ) : (
            <>
            <span style={{textDecoration: todo.done ? "line-through" : "none", }}>{todo.text} </span>

            <button onClick={goToDetail}>상세</button>

            <button onClick={editTodo}>수정</button>

            <button onClick={() => updateTodoStatus(todo.id)}>{todo.done ? "취소" : "완료"}</button>

            <button onClick={() => deleteTodo(todo.id)}>삭제</button>
            </>
        )}
        </li>
    );
    }