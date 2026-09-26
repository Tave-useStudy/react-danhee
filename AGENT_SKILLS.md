# Agent Skills 적용 기록

## 프로젝트 개요

기존 투두리스트에 할 일 수정, 카테고리 필터링, 우선순위 정렬, 완료 상태 필터, React Router 페이지 분리 기능을 추가했다.

기능을 구현하면서 다음 여섯 가지 agent-skill을 코드에 적용하거나 기존 방식과 비교했다.

1. `rerender-functional-setstate.md`
2. `rerender-move-effect-to-event.md`
3. `rendering-conditional-render.md`
4. `js-early-exit.md`
5. `js-tosorted-immutable.md`
6. `react19-no-forwardref.md`

---

## 1. 함수형 setState를 수정 기능까지 확장

### 문제 (내 코드)

할 일 추가, 완료 상태 변경, 수정, 삭제는 모두 기존 `todos` 배열을 기준으로 다음 상태를 만들어야 한다. GitHub의 1주차 코드에서는 추가·완료·삭제에 이미 함수형 setState를 사용하고 있었다. 2주차에 수정 기능을 추가하면서도 같은 방식으로 상태를 안전하게 업데이트해야 했다.

### Before

GitHub 1주차 코드에서도 다음과 같이 함수형 업데이트를 사용했다.

```jsx
const addTodo = (text) => {
  const newTodo = {
    id: Date.now(),
    text: text,
    done: false,
  };

  setTodos((previousTodos) => [
    ...previousTodos,
    newTodo,
  ]);
};
```

### 적용한 rule

`rerender-functional-setstate.md`

이전 state를 이용해 다음 state를 만들 때는 함수형 업데이트를 사용했다.

### After

할 일 추가:

```jsx
setTodos((previousTodos) => [
  ...previousTodos,
  newTodo,
]);
```

완료 상태 변경:

```jsx
setTodos((previousTodos) =>
  previousTodos.map((todo) =>
    todo.id === id
      ? { ...todo, done: !todo.done }
      : todo
  )
);
```

할 일 수정:

```jsx
setTodos((previousTodos) =>
  previousTodos.map((todo) =>
    todo.id === id
      ? { ...todo, text: newText }
      : todo
  )
);
```

할 일 삭제:

```jsx
setTodos((previousTodos) =>
  previousTodos.filter((todo) => todo.id !== id)
);
```

### 결과

1주차부터 사용하던 함수형 업데이트를 새로 추가한 수정 기능에도 동일하게 적용했다. React가 전달하는 최신 `todos`를 기준으로 상태를 변경하며, `map()`, `filter()`, 스프레드 문법으로 기존 배열과 객체를 직접 수정하지 않았다.

기능이 늘어나도 동일한 상태 업데이트 규칙을 유지해 stale closure 가능성을 줄이고 배열 state의 불변성을 유지할 수 있게 되었다.

---

## 2. 제출과 버튼 클릭 로직을 이벤트에서 처리

### 문제 (내 코드)

할 일 추가와 수정 저장은 컴포넌트가 렌더링되어서 실행되는 작업이 아니다. 사용자가 폼을 제출하거나 저장 버튼을 클릭했을 때 실행되어야 하는 작업이다.

처음에는 추가 버튼의 `onClick`만 사용했기 때문에 버튼 클릭에만 로직이 연결되어 있었다.

### Before

```jsx
<button onClick={createTodo} disabled={overLimit}>
  추가
</button>
```

### 적용한 rule

`rerender-move-effect-to-event.md`

사용자의 행동으로 발생하는 로직은 `useEffect`가 아니라 이벤트 핸들러에서 직접 실행했다. 할 일 추가는 `form`의 `onSubmit`, 수정 저장은 저장 버튼의 `onClick`에서 처리했다.

### After

```jsx
const createTodo = (e) => {
  e.preventDefault();

  if (isEmpty) return;

  addTodo(trimmedValue, category, priority);
  setValue("");
};
```

```jsx
<form onSubmit={createTodo}>
  <input
    placeholder="할 일을 입력해 주세요."
    value={value}
    maxLength={20}
    onChange={(e) => setValue(e.target.value)}
  />

  <button type="submit" disabled={isEmpty}>
    추가
  </button>
</form>
```

수정 저장도 클릭 이벤트에서 처리했다.

```jsx
<button onClick={saveTodo} disabled={editOverLimit}>
  저장
</button>
```

### 결과

사용자의 행동과 실행되는 함수가 직접 연결되어 코드의 실행 흐름이 명확해졌다. `form`의 `onSubmit`을 사용해 추가 버튼 클릭과 Enter 키 입력을 같은 `createTodo` 함수로 처리할 수 있게 되었다.

`UserProfile`의 API 호출은 사용자의 클릭이 아니라 컴포넌트가 처음 화면에 나타날 때 실행되어야 하므로 `useEffect`에 유지했다.

---

## 3. 조건부 렌더링으로 편집 화면 전환

### 문제 (내 코드)

일반 상태에서는 todo의 텍스트와 수정·완료·삭제 버튼이 보여야 한다. 편집 상태에서는 input과 저장·취소 버튼이 보여야 한다.

DOM을 직접 찾아서 요소를 숨기거나 내용을 변경하는 방식 대신 React state에 따라 화면을 전환할 필요가 있었다.

### Before

```jsx
<span
  style={{
    textDecoration: todo.done ? "line-through" : "none",
  }}
>
  {todo.text}
</span>
```

항상 텍스트만 렌더링하기 때문에 편집 화면으로 전환할 수 없었다.

### 적용한 rule

`rendering-conditional-render.md`

두 화면 중 하나를 선택해야 하므로 `&&`가 아니라 삼항 연산자를 사용했다.

### After

```jsx
const [isEditing, setIsEditing] = useState(false);
const [editText, setEditText] = useState(todo.text);
```

```jsx
{isEditing ? (
  <>
    <input
      value={editText}
      onChange={(e) => setEditText(e.target.value)}
    />

    <span>{editText.length}/20</span>

    {editOverLimit && (
      <p>20자 이내로 입력해 주세요.</p>
    )}

    <button onClick={saveTodo} disabled={editOverLimit}>
      저장
    </button>

    <button onClick={cancelTodo}>취소</button>
  </>
) : (
  <>
    <span
      style={{
        textDecoration: todo.done
          ? "line-through"
          : "none",
      }}
    >
      {todo.text}
    </span>

    <button onClick={goToDetail}>상세</button>
    <button onClick={editTodo}>수정</button>

    <button onClick={() => updateTodoStatus(todo.id)}>
      {todo.done ? "취소" : "완료"}
    </button>

    <button onClick={() => deleteTodo(todo.id)}>
      삭제
    </button>
  </>
)}
```

### 결과

`isEditing` 값만 변경하면 React가 현재 상태에 맞는 화면을 선언적으로 렌더링하게 되었다. `document.querySelector`, `innerText`, `classList` 등의 DOM 직접 조작 없이 input과 text를 전환할 수 있게 되었다.

두 화면 중 하나를 선택할 때는 삼항 연산자를 사용했다. 경고 문구처럼 하나의 요소를 보여주거나 숨길 때는 `editOverLimit && (...)`를 사용했다.

---

## 4. Early Exit로 validation 단순화

### 문제 (내 코드)

GitHub의 1주차 `TextInput`은 빈 문자열을 검사할 때 이미 early exit를 사용하고 있었다. 2주차에는 수정 저장과 필터 분기가 추가되었기 때문에 기존 방식을 새로운 로직에도 일관되게 적용할 필요가 있었다.

### Before

GitHub 1주차 코드:

```jsx
const createTodo = () => {
  if (value.trim() === "") {
    return;
  }

  addTodo(value);
  setValue("");
};
```

### 적용한 rule

`js-early-exit.md`

잘못된 입력을 함수 앞부분에서 검사하고 조건에 맞지 않으면 바로 `return`하도록 작성했다.

### After

할 일 추가:

```jsx
const trimmedValue = value.trim();
const isEmpty = trimmedValue === "";

const createTodo = (e) => {
  e.preventDefault();

  if (isEmpty) return;

  addTodo(trimmedValue, category, priority);
  setValue("");
};
```

할 일 수정:

```jsx
const saveTodo = () => {
  const trimmedText = editText.trim();

  if (trimmedText === "") return;
  if (editOverLimit) return;

  updateTodoText(todo.id, trimmedText);
  setIsEditing(false);
};
```

카테고리 필터:

```jsx
const categoryFilteredTodos = todos.filter((todo) => {
  if (categoryFilter === "all") {
    return true;
  }

  return todo.category === categoryFilter;
});
```

### 결과

1주차부터 사용하던 early exit를 할 일 수정과 카테고리 필터에도 확장했다. 잘못된 입력과 특별한 조건을 함수 앞부분에서 먼저 처리해 중첩을 줄였고 함수의 실행 순서를 쉽게 확인할 수 있게 되었다.

입력값은 `trim()`을 적용한 뒤 저장하기 때문에 할 일 앞뒤에 불필요한 공백이 저장되지 않는다.

---

## 5. toSorted로 불변 정렬

### 문제 (내 코드)

카테고리와 완료 상태 필터를 적용한 후 todo를 최신순, 오래된순, 우선순위순으로 정렬해야 했다.

GitHub의 1주차 코드에는 정렬 기능이 없었고 `todos`를 그대로 `map()`으로 렌더링하고 있었다. 2주차에 정렬 기능을 새로 추가하면서 원본 배열을 변경하지 않는 방법이 필요했다.

### Before

GitHub 1주차 코드에는 별도의 정렬 과정이 없었다.

```jsx
{todos.map((todo) => (
  <li key={todo.id}>
    <span
      style={{
        textDecoration: todo.done
          ? "line-through"
          : "none",
      }}
    >
      {todo.text}
    </span>
  </li>
))}
```

### 적용한 rule

`js-tosorted-immutable.md`

정렬 기능을 추가할 때 `sort()`와 `toSorted()`를 비교하고, 원본 배열을 직접 변경하지 않는 `toSorted()`를 선택했다.

### After

```jsx
const priorityOrder = {
  high: 1,
  medium: 2,
  low: 3,
};
```

```jsx
const sortedTodos = statusFilteredTodos.toSorted((a, b) => {
  if (sortType === "priority") {
    return (
      priorityOrder[a.priority] -
      priorityOrder[b.priority]
    );
  }

  if (sortType === "oldest") {
    return a.id - b.id;
  }

  return b.id - a.id;
});
```

정렬 결과를 실제 목록에 전달했다.

```jsx
<TaskList
  todos={sortedTodos}
  updateTodoStatus={updateTodoStatus}
  deleteTodo={deleteTodo}
  updateTodoText={updateTodoText}
/>
```

### 결과

필터링된 배열을 직접 변경하지 않고 정렬된 새로운 배열을 만들게 되었다.

화면에 표시할 todo는 다음 순서로 계산된다.

```text
todos
→ categoryFilteredTodos
→ statusFilteredTodos
→ sortedTodos
→ TaskList
```

필터와 정렬 결과를 별도의 state에 다시 저장하지 않고 현재 `todos`와 필터 조건을 바탕으로 계산하는 derived state 방식도 유지했다.

---

## 6. React 19의 ref 전달 방식 비교

### 문제 (내 코드)

GitHub의 1주차 코드와 현재 코드 모두 `TextInput` 내부에서 input을 직접 렌더링한다. 부모 컴포넌트가 자식 input의 DOM 요소를 제어하지 않기 때문에 현재 기능에서는 `ref` 전달이 필요하지 않았다.

다만 자식 컴포넌트에 `ref`를 전달해야 하는 경우 React 18 이전 방식과 React 19 방식에 차이가 있으므로 두 방식을 비교했다.

### Before

GitHub 1주차 코드:

```jsx
<input
  placeholder="할 일을 입력해 주세요."
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

별도의 자식 input 컴포넌트나 `ref` 전달 코드는 없었다.

### 적용한 rule

`react19-no-forwardref.md`

현재 코드에는 `ref`가 필요하지 않아 구조를 변경하지 않았다. 대신 React 19에서는 함수 컴포넌트가 `ref`를 prop으로 받을 수 있다는 변화를 기존 `forwardRef` 방식과 비교했다.

### After (필요할 경우의 React 19 방식)

```jsx
function TodoTextInput({ ref, ...props }) {
  return <input ref={ref} {...props} />;
}
```

### 결과

현재 투두리스트에는 부모가 자식 input의 DOM 요소를 제어하는 기능이 없으므로 `ref`나 `forwardRef`를 추가하지 않았다. 필요하지 않은 컴포넌트와 로직을 억지로 추가하지 않아 현재 구조를 단순하게 유지했다.

추후 input 자동 포커스처럼 `ref` 전달이 필요한 기능을 추가한다면 React 19의 ref prop 방식을 사용할 수 있다. 따라서 이 항목은 실제 기능 적용이 아니라 React 18 방식과 React 19 방식의 차이를 학습하고 비교한 기록이다.

---

# 기능 구현 과정에서 추가로 개선한 내용

## 1. 입력값 공백 제거와 20자 제한

### 문제 (내 코드)

공백 입력 여부를 검사했지만 GitHub 1주차 코드에서 `addTodo(value)`를 호출했기 때문에 공백이 포함된 원래 값이 저장될 수 있었다. 버튼 비활성화만으로 글자 수를 제한하면 사용자는 20자가 넘는 내용을 계속 입력할 수도 있었다.

### Before

```jsx
addTodo(value);
```

### After

```jsx
const trimmedValue = value.trim();
const isEmpty = trimmedValue === "";
```

```jsx
<input
  value={value}
  maxLength={20}
  onChange={(e) => setValue(e.target.value)}
/>
```

```jsx
addTodo(trimmedValue, category, priority);
```

### 결과

공백만 입력한 todo가 추가되지 않고 앞뒤 공백을 제거한 값이 저장된다. `maxLength={20}`을 사용해 input 단계에서 20자를 초과해 입력할 수 없게 되었다.

---

## 2. API 에러 처리

### 문제 (내 코드)

랜덤 사용자 API 요청에 실패하면 `user`가 계속 `null`로 남아 로딩 문구만 표시될 수 있었다.

### Before

```jsx
const response = await fetch("https://randomuser.me/api/");
const data = await response.json();
setUser(data.results[0]);
```

### After

```jsx
const [error, setError] = useState("");
```

```jsx
try {
  const response = await fetch(
    "https://randomuser.me/api/"
  );

  if (!response.ok) {
    throw new Error("사용자 요청 실패");
  }

  const data = await response.json();
  setUser(data.results[0]);
} catch {
  setError("사용자 정보를 불러오지 못했습니다.");
}
```

```jsx
if (error) {
  return <p>{error}</p>;
}

if (user === null) {
  return <p>사용자 정보를 불러오는 중...</p>;
}
```

### 결과

네트워크 요청이 실패하면 무한 로딩 대신 오류 메시지를 보여줄 수 있게 되었다. 로딩, 오류, 성공 상태에 따라 서로 다른 화면을 렌더링한다.

---

## 3. Derived State 기반 필터링

### 문제 (내 코드)

카테고리 필터 결과, 완료 상태 필터 결과, 정렬 결과를 각각 state로 저장하면 원본 `todos`와 여러 state를 계속 맞춰야 한다.

### Before

GitHub 1주차에는 필터 state가 없었고 원본 `todos`를 바로 전달했다.

```jsx
<TaskList
  todos={todos}
  updateTodoStatus={updateTodoStatus}
  deleteTodo={deleteTodo}
/>
```

### After

```jsx
const [categoryFilter, setCategoryFilter] = useState("all");
const [statusFilter, setStatusFilter] = useState("all");
const [sortType, setSortType] = useState("latest");
```

```jsx
const categoryFilteredTodos = todos.filter((todo) => {
  if (categoryFilter === "all") return true;
  return todo.category === categoryFilter;
});

const statusFilteredTodos = categoryFilteredTodos.filter(
  (todo) => {
    if (statusFilter === "completed") return todo.done;
    if (statusFilter === "active") return !todo.done;
    return true;
  }
);

const sortedTodos = statusFilteredTodos.toSorted((a, b) => {
  if (sortType === "priority") {
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  }

  if (sortType === "oldest") return a.id - b.id;
  return b.id - a.id;
});
```

### 결과

원본 데이터는 `todos` 하나로 유지하고, 화면에 보여줄 목록은 현재 필터와 정렬 조건으로 계산하게 되었다. 별도의 결과 state가 없어 데이터가 서로 달라지는 문제를 예방할 수 있다.

---

## 4. React Router로 페이지 분리

### 문제 (내 코드)

모든 기능이 하나의 화면에 모여 있었고 개별 todo를 별도의 주소에서 확인할 수 없었다.

### Before

GitHub 1주차에는 페이지가 분리되지 않았고 `App.jsx`에서 모든 컴포넌트를 바로 렌더링했다.

```jsx
return (
  <div>
    <h1>투두리스트</h1>

    <UserProfile />
    <TextInput addTodo={addTodo} />
    <TaskList
      todos={todos}
      updateTodoStatus={updateTodoStatus}
      deleteTodo={deleteTodo}
    />
  </div>
);
```

### After

```text
/           → MainPage
/todos/:id  → TodoDetailPage
/settings   → SettingsPage
```

`TodoItem.jsx`에서 상세 페이지로 이동:

```jsx
const navigate = useNavigate();

const goToDetail = () => {
  navigate(`/todos/${todo.id}`);
};
```

`TodoDetailPage.jsx`에서 개별 todo 조회:

```jsx
const { id } = useParams();

const todo = todos.find(
  (todo) => todo.id === Number(id)
);
```

todo가 없는 경우도 조건부로 처리했다.

```jsx
if (!todo) {
  return (
    <div>
      <h1>할 일을 찾을 수 없습니다.</h1>
      <button onClick={() => navigate("/")}>
        메인으로
      </button>
    </div>
  );
}
```

### 결과

메인, 상세, 설정 페이지의 역할이 분리되었다. 각 todo는 `/todos/:id` 형태의 고유한 상세 주소를 가지며, `useParams`로 주소의 ID를 읽고 `useNavigate`로 페이지를 이동할 수 있게 되었다.

---

# 최종 정리

이번 과제를 통해 다음 내용을 적용했다.

- 함수형 setState로 최신 상태를 기준으로 todo 배열을 업데이트했다.
- `map()`, `filter()`, 스프레드 문법으로 불변성을 유지했다.
- 사용자 행동으로 실행되는 코드는 이벤트 핸들러에서 처리했다.
- 조건부 렌더링으로 일반 화면과 편집 화면을 전환했다.
- early exit로 validation과 분기 로직을 단순화했다.
- `toSorted()`로 기존 배열을 변경하지 않고 정렬했다.
- 필터와 정렬 결과를 derived state로 계산했다.
- 입력값의 공백, 길이 제한과 API 실패 상황을 처리했다.
- React Router로 메인, 상세, 설정 페이지를 분리했다.
- React 19의 ref prop 방식과 기존 `forwardRef` 방식의 차이를 학습했다.
