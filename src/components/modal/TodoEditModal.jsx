    import { useState } from "react";

    import {
    useBoard,
    } from "../../context/BoardContext";

    import Modal from "./Modal";

    function EditForm({
    todo,
    updateTodoText,
    closeModal,
    }) {
    const [editText, setEditText] =
        useState(todo.text);

    const trimmedText = editText.trim();
    const isEmpty = trimmedText === "";
    const isOverLimit =
        editText.length > 20;

    const saveTodo = () => {
        if (isEmpty || isOverLimit) {
        return;
        }

        updateTodoText(
        todo.id,
        trimmedText
        );

        closeModal();
    };

    return (
        <Modal.Root onClose={closeModal}>
        <Modal.Header>
            <h2>할 일 수정</h2>

            <button
            type="button"
            onClick={closeModal}
            >
            닫기
            </button>
        </Modal.Header>

        <Modal.Body>
            <input
            value={editText}
            maxLength={20}
            onChange={(event) =>
                setEditText(
                event.target.value
                )
            }
            />

            <span>
            {editText.length}/20
            </span>

            {isEmpty && (
            <p>
                할 일을 입력해 주세요.
            </p>
            )}
        </Modal.Body>

        <Modal.Footer>
            <button
            type="button"
            onClick={closeModal}
            >
            취소
            </button>

            <button
            type="button"
            onClick={saveTodo}
            disabled={
                isEmpty || isOverLimit
            }
            >
            저장
            </button>
        </Modal.Footer>
        </Modal.Root>
    );
    }

    export default function TodoEditModal() {
    const {
        state: {
        todos,
        modal,
        },

        actions: {
        updateTodoText,
        closeModal,
        },
    } = useBoard();

    if (
        !modal ||
        modal.type !== "edit"
    ) {
        return null;
    }

    const todo = todos.find(
        (todo) =>
        String(todo.id) ===
        String(modal.todoId)
    );

    if (!todo) {
        return null;
    }

    return (
        <EditForm
        key={todo.id}
        todo={todo}
        updateTodoText={
            updateTodoText
        }
        closeModal={closeModal}
        />
    );
    }