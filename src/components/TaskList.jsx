
export default function TaskList({todos, updateTodoStatus, deleteTodo}) {
    return (
        <div>
            <h2>할 일 목록</h2>

            <ul>
                {todos.map((todo) => (
                    <li key={todo.id}>
                        <span style={{textDecoration: todo.done ? "line-through" : "none"}}>{todo.text}</span>

                        <button onClick={() => updateTodoStatus(todo.id)}>
                            {todo.done ? "취소" : "완료"}
                        </button>

                        <button onClick={() => deleteTodo(todo.id)}>삭제</button>
                    </li>
                ))}
            </ul>
        </div>
    )
}
