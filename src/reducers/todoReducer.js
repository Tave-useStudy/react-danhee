    export const initialTodoState = {
    todos: [],
    status: "idle",
    error: null,
    };

    export function todoReducer(state, action) {
    switch (action.type) {
        case "ADD_TODO":
        return {
            ...state,
            todos: [...state.todos, action.payload],
        };

        case "MOVE_TODO":
        return {
            ...state,
            todos: state.todos.map((todo) =>
            todo.id === action.payload.id
                ? {
                    ...todo,
                    status: action.payload.nextStatus,
                }
                : todo
            ),
        };

        case "DELETE_TODO":
        return {
            ...state,
            todos: state.todos.filter(
            (todo) => todo.id !== action.payload
            ),
        };

        case "UPDATE_TODO":
        return {
            ...state,
            todos: state.todos.map((todo) =>
            todo.id === action.payload.id
                ? {
                    ...todo,
                    text: action.payload.newText,
                }
                : todo
            ),
        };

    case "FETCH_START":
    return {
        ...state,
        status: "loading",
        error: null,
    };

    case "FETCH_SUCCESS":
    return {
        ...state,
        todos: action.payload,
        status: "success",
        error: null,
    };

    case "FETCH_ERROR":
    return {
        ...state,
        status: "error",
        error: action.payload,
    };

        default:
        return state;
    }
    }