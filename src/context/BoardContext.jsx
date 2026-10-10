    import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useReducer,
    useRef,
    useState,
    } from "react";

    import {
    initialTodoState,
    todoReducer,
    } from "../reducers/todoReducer";

    import {
    useLocalStorage,
    } from "../hooks/useLocalStorage";

    import {
    fetchTodos,
    } from "../api/todosApi";

    export const BoardContext =
    createContext(null);

    export function BoardProvider({
    children,
    }) {
    const {
        loadValue,
        saveValue,
    } = useLocalStorage("todo-data");

    const [state, dispatch] = useReducer(
        todoReducer,
        initialTodoState,
        (initialState) => {
        const savedTodos = loadValue([]);

        const normalizedTodos =
            savedTodos.map(
            ({ done, ...todo }) => ({
                ...todo,

                status:
                todo.status ??
                (done
                    ? "done"
                    : "todo"),
            })
            );

        return {
            ...initialState,
            todos: normalizedTodos,
        };
        }
    );

    const [modal, setModal] =
        useState(null);

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
            if (
            error.name === "AbortError"
            ) {
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

        loadApiTodos(
        controller.signal
        );

        return () => {
        controller.abort();
        };
    }, [loadApiTodos]);

    const addTodo = (
        text,
        category,
        priority
    ) => {
        const newTodo = {
        id: Date.now(),
        text,
        status: "todo",
        category,
        priority,
        };

        dispatch({
        type: "ADD_TODO",
        payload: newTodo,
        });
    };

    const moveTodo = (
        id,
        nextStatus
    ) => {
        dispatch({
        type: "MOVE_TODO",
        payload: {
            id,
            nextStatus,
        },
        });
    };

    const deleteTodo = (id) => {
        dispatch({
        type: "DELETE_TODO",
        payload: id,
        });
    };

    const updateTodoText = (
        id,
        newText
    ) => {
        dispatch({
        type: "UPDATE_TODO",
        payload: {
            id,
            newText,
        },
        });
    };

    const openModal = (
        type,
        todoId
    ) => {
        setModal({
        type,
        todoId,
        });
    };

    const closeModal = () => {
        setModal(null);
    };

    const boardValue = {
        state: {
        todos: state.todos,
        status: state.status,
        error: state.error,
        modal,
        },

        actions: {
        addTodo,
        moveTodo,
        deleteTodo,
        updateTodoText,
        loadApiTodos,
        openModal,
        closeModal,
        },
    };

    return (
        <BoardContext value={boardValue}>
        {children}
        </BoardContext>
    );
    }

    export function useBoard() {
    const context =
        useContext(BoardContext);

    if (!context) {
        throw new Error(
        "useBoard는 BoardProvider 안에서 사용해야 합니다."
        );
    }

    return context;
    }