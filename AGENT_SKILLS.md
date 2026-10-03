# Agent Skills 적용 기록

## 프로젝트 개요

기존 투두리스트에 할 일 수정, 카테고리·상태 필터링, 우선순위 정렬, React Router 페이지 분리 기능을 추가했다. 이후 todo 상태를 `useState`에서 `useReducer`로 전환하고, localStorage 데이터 영속화와 JSONPlaceholder Todo API 연동, 로딩·에러·재시도 처리까지 확장했다.

기능을 구현하면서 다음 열세 가지 agent-skill을 코드에 적용하거나 현재 구조와 비교했다.

1. `rerender-functional-setstate.md`
2. `rerender-move-effect-to-event.md`
3. `rendering-conditional-render.md`
4. `js-early-exit.md`
5. `js-tosorted-immutable.md`
6. `react19-no-forwardref.md`
7. `async-parallel.md`
8. `async-defer-await.md`
9. `rerender-derived-state-no-effect.md`
10. `rerender-lazy-state-init.md`
11. `client-localstorage-schema.md`
12. `rerender-dependencies.md`
13. `js-set-map-lookups.md`

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

직접 만든 숫자 ID와 `api-1` 형태의 문자열 ID를 함께 정렬하기 위해 비교값을 구하는 함수를 추가했다.

```jsx
function getTodoOrder(todo) {
  if (typeof todo.id === "number") {
    return todo.id;
  }

  const numberPart = String(todo.id).match(/\d+$/);
  return numberPart ? Number(numberPart[0]) : 0;
}
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
    return getTodoOrder(a) - getTodoOrder(b);
  }

  return getTodoOrder(b) - getTodoOrder(a);
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

## 7. 독립적인 비동기 작업의 병렬 처리 여부 확인

### 문제 (내 코드)

프로젝트에서는 JSONPlaceholder Todo API와 Random User API를 사용한다. 두 API가 존재하기 때문에 `Promise.all()`로 동시에 요청해야 하는지 확인할 필요가 있었다.

### 적용한 rule

`async-parallel.md`

서로 독립적이면서 하나의 작업을 완료하기 위해 모든 결과가 필요한 경우에는 `Promise.all()`을 사용한다. 반대로 서로 다른 컴포넌트가 각자 필요한 데이터를 요청한다면 하나의 `Promise.all()`로 억지로 묶지 않는다.

### 현재 코드

Todo API는 `App.jsx`에서 투두 목록을 불러오기 위해 사용한다.

```jsx
const apiTodos = await fetchTodos(signal);
```

Random User API는 `UserProfile.jsx`에서 사용자 정보를 불러오기 위해 사용한다.

```jsx
const response = await fetch(
  "https://randomuser.me/api/"
);
```

두 요청은 서로 다른 컴포넌트와 상태를 담당하므로 다음처럼 강제로 묶지 않았다.

```jsx
// 현재 구조에서는 사용하지 않음
const [todos, user] = await Promise.all([
  fetchTodos(),
  fetchUser(),
]);
```

### 결과

비동기 요청이 여러 개 있다는 이유만으로 `Promise.all()`을 사용하지 않았다. 추후 하나의 화면을 보여주기 위해 두 API 결과가 모두 필요한 기능이 추가된다면 병렬 요청을 적용할 수 있다.

---

## 8. 결과가 필요한 시점에 await 사용

### 문제 (내 코드)

Todo API 요청에서는 서버 응답을 받은 뒤 응답 상태를 확인하고, 그다음 JSON 데이터를 변환해야 한다. 각 작업은 이전 작업의 결과가 필요하므로 실행 순서를 명확하게 관리해야 했다.

### 적용한 rule

`async-defer-await.md`

Promise의 결과가 실제로 필요한 위치에서 `await`한다. 다만 다음 작업이 이전 비동기 작업의 결과에 의존한다면 순차적으로 기다린다.

### 적용 코드

```jsx
export async function fetchTodos(signal) {
  const response = await fetch(
    "https://jsonplaceholder.typicode.com/todos",
    { signal }
  );

  if (!response.ok) {
    throw new Error(
      `투두를 불러오지 못했습니다. (${response.status})`
    );
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error(
      "올바르지 않은 투두 데이터입니다."
    );
  }

  return data.slice(0, 10).map((todo) => ({
    id: `api-${todo.id}`,
    text: todo.title,
    category: "daily",
    priority: "medium",
    done: todo.completed,
  }));
}
```

### 결과

`fetch()`의 결과가 있어야 `response.ok`를 검사할 수 있고, `response`가 있어야 JSON을 변환할 수 있으므로 두 작업을 순차적으로 처리했다. API 데이터가 필요한 시점에만 기다리고 성공 여부와 데이터 구조를 확인한 뒤 상태를 변경하게 되었다.

---

## 9. 필터와 정렬 결과를 Effect 없이 계산

### 문제 (내 코드)

카테고리 필터, 완료 상태 필터, 정렬 결과는 모두 원본 `todos`와 사용자가 선택한 조건으로부터 계산할 수 있다. 이를 별도의 state로 저장하면 원본 데이터가 변경될 때마다 Effect로 다시 동기화해야 한다.

### Before

```jsx
const [filteredTodos, setFilteredTodos] =
  useState([]);

useEffect(() => {
  setFilteredTodos(
    todos.filter((todo) => todo.done)
  );
}, [todos]);
```

### 적용한 rule

`rerender-derived-state-no-effect.md`

기존 props나 state로 계산할 수 있는 값은 새로운 state와 Effect에 저장하지 않고 렌더링 과정에서 바로 계산한다.

### After

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

  if (sortType === "oldest") {
    return getTodoOrder(a) - getTodoOrder(b);
  }

  return getTodoOrder(b) - getTodoOrder(a);
});
```

### 결과

화면에 보여줄 목록은 `todos → categoryFilteredTodos → statusFilteredTodos → sortedTodos` 순서로 계산된다. 필터와 정렬 결과를 별도 state에 저장하지 않아 원본 데이터와 파생 데이터가 달라지는 문제와 불필요한 렌더링을 예방했다.

---

## 10. 지연 초기화로 localStorage를 처음 한 번만 읽기

### 문제 (내 코드)

새로고침 후에도 todo를 유지하려면 앱을 처음 실행할 때 localStorage의 데이터를 불러와야 한다. 렌더링 본문에서 직접 `loadValue()`를 실행하면 컴포넌트가 다시 렌더링될 때마다 저장소를 읽을 수 있다.

### Before

```jsx
const savedTodos = loadValue([]);

const [state, dispatch] = useReducer(
  todoReducer,
  {
    ...initialTodoState,
    todos: savedTodos,
  }
);
```

### 적용한 rule

`rerender-lazy-state-init.md`

초기 상태를 만드는 비용이 있거나 저장소에서 값을 불러와야 할 때는 `useReducer`의 세 번째 인자인 지연 초기화 함수를 사용한다.

### After

```jsx
const [state, dispatch] = useReducer(
  todoReducer,
  initialTodoState,
  (initialState) => {
    const savedTodos = loadValue([]);

    return {
      ...initialState,
      todos: savedTodos,
    };
  }
);
```

### 결과

localStorage는 reducer의 초기 상태를 만들 때만 읽는다. 컴포넌트가 다시 렌더링되어도 저장 데이터를 반복해서 읽지 않으며, 저장된 todo가 없으면 빈 배열을 사용한다.

---

## 11. 버전을 포함한 localStorage 스키마 구성

### 문제 (내 코드)

todo 배열만 바로 저장하면 이후 데이터 구조가 변경됐을 때 기존 데이터와 새로운 데이터를 구분하기 어렵다. localStorage에는 사용자가 직접 수정한 값이나 잘못된 JSON이 저장될 수도 있다.

### Before

```jsx
localStorage.setItem(
  "todo-data",
  JSON.stringify(todos)
);
```

### 적용한 rule

`client-localstorage-schema.md`

localStorage 데이터에는 버전을 포함하고, 불러올 때 예상한 구조인지 검증한다. JSON 파싱에 실패하거나 스키마가 다르면 안전한 기본값을 사용한다.

### After

저장:

```jsx
const value = {
  version: 1,
  todos,
};

localStorage.setItem(
  key,
  JSON.stringify(value)
);
```

불러오기:

```jsx
const parsedValue = JSON.parse(savedValue);

if (
  parsedValue.version !== 1 ||
  !Array.isArray(parsedValue.todos)
) {
  return fallbackValue;
}

return parsedValue.todos;
```

### 결과

localStorage에는 `{ version: 1, todos: [...] }` 구조로 데이터가 저장된다. 데이터가 없거나 JSON 파싱에 실패하거나 `todos`가 배열이 아니면 기본값을 사용해 잘못된 저장 데이터 때문에 앱이 중단되는 문제를 예방했다.

---

## 12. Effect와 Callback의 의존성 명시

### 문제 (내 코드)

localStorage 저장 Effect와 API 호출 Effect는 외부에서 선언된 함수와 상태를 사용한다. 의존성 배열에서 이를 누락하면 Effect가 이전 값을 참조하거나 실행 시점을 파악하기 어려울 수 있다.

### 적용한 rule

`rerender-dependencies.md`

Effect와 Callback 내부에서 사용하는 반응형 값을 의존성 배열에 명시하고, Effect에서 사용하는 함수는 필요할 때 `useCallback`으로 참조를 안정화한다.

### 적용 코드

localStorage 저장:

```jsx
useEffect(() => {
  saveValue(state.todos);
}, [state.todos, saveValue]);
```

API 요청 함수:

```jsx
const loadApiTodos = useCallback(
  async (signal) => {
    dispatch({ type: "FETCH_START" });

    try {
      const apiTodos = await fetchTodos(signal);

      dispatch({
        type: "FETCH_SUCCESS",
        payload: apiTodos,
      });
    } catch (error) {
      if (error.name === "AbortError") return;

      dispatch({
        type: "FETCH_ERROR",
        payload: error.message,
      });
    }
  },
  []
);
```

API 호출 Effect:

```jsx
useEffect(() => {
  if (hasSavedTodos.current) return;

  const controller = new AbortController();
  loadApiTodos(controller.signal);

  return () => {
    controller.abort();
  };
}, [loadApiTodos]);
```

### 결과

localStorage 저장은 `state.todos`가 변경될 때 실행되고 API Effect는 안정된 `loadApiTodos` 함수를 사용한다. Effect에서 사용하는 값과 의존성 배열의 관계가 명확해졌으며 요청 취소도 cleanup에서 처리했다.

---

## 13. Set과 Map 사용 여부 비교

### 문제 (내 코드)

API todo와 사용자가 만든 todo가 함께 존재하기 때문에 ID 조회나 중복 제거에 `Set` 또는 `Map`을 사용해야 하는지 검토했다.

### 적용한 rule

`js-set-map-lookups.md`

ID 포함 여부를 반복해서 검사하거나 같은 배열에서 여러 번 조회한다면 `Set` 또는 `Map`을 사용할 수 있다. 데이터가 적고 조회가 한 번뿐이라면 `find()`, `filter()`, `map()`이 더 단순하다.

### 현재 코드

API에서는 todo를 10개만 불러온다.

```jsx
return data.slice(0, 10).map((todo) => ({
  id: `api-${todo.id}`,
  text: todo.title,
  category: "daily",
  priority: "medium",
  done: todo.completed,
}));
```

저장된 todo가 있으면 API 요청을 생략하기 때문에 기존 목록과 API 목록을 병합하며 중복을 제거하는 작업도 없다.

```jsx
if (hasSavedTodos.current) {
  return;
}
```

상세 페이지에서는 하나의 todo만 찾기 때문에 `find()`를 유지했다.

```jsx
const todo = todos.find(
  (todo) => String(todo.id) === String(id)
);
```

추후 두 목록을 병합한다면 다음처럼 `Set`을 사용할 수 있다.

```jsx
const existingIds = new Set(
  state.todos.map((todo) => String(todo.id))
);

const uniqueApiTodos = apiTodos.filter(
  (todo) => !existingIds.has(String(todo.id))
);
```

### 결과

현재는 todo 개수가 적고 두 목록을 병합하지 않으므로 `Set`이나 `Map`을 추가하지 않았다. 자료구조를 무조건 사용하는 대신 데이터 크기와 반복 조회 여부를 기준으로 필요성을 판단했다.

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

  if (sortType === "oldest") {
    return getTodoOrder(a) - getTodoOrder(b);
  }

  return getTodoOrder(b) - getTodoOrder(a);
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
  (todo) => String(todo.id) === String(id)
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

## 5. useReducer로 CRUD와 API 상태 통합

### 문제 (내 코드)

추가, 완료 변경, 수정, 삭제 기능에 API 로딩과 에러 상태까지 더해지면서 여러 상태 변경 규칙을 한곳에서 관리할 필요가 생겼다.

### Before

```jsx
const [todos, setTodos] = useState([]);
```

각 함수가 `setTodos`를 사용해 배열을 직접 변경하고 있었다.

### After

```jsx
export const initialTodoState = {
  todos: [],
  status: "idle",
  error: null,
};
```

```jsx
const [state, dispatch] = useReducer(
  todoReducer,
  initialTodoState,
  (initialState) => {
    const savedTodos = loadValue([]);

    return {
      ...initialState,
      todos: savedTodos,
    };
  }
);
```

컴포넌트에서는 실행할 작업과 필요한 데이터만 전달한다.

```jsx
dispatch({
  type: "UPDATE_TODO",
  payload: { id, newText },
});
```

reducer는 액션에 따라 새로운 상태를 반환한다.

```jsx
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
```

API 상태도 같은 reducer에서 처리했다.

```jsx
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
```

### 결과

CRUD와 API 상태 변경 규칙이 `todoReducer`에 모였다. 컴포넌트는 어떤 작업을 실행할지만 전달하고 reducer가 실제 상태 변경을 담당하게 되어 상태 흐름을 한곳에서 확인할 수 있게 되었다.

---

## 6. useLocalStorage 커스텀 훅으로 데이터 영속화

### 문제 (내 코드)

React state는 새로고침하면 초기화되므로 사용자가 만든 todo가 사라졌다. 저장과 불러오기 코드를 `App.jsx`에 모두 작성하면 컴포넌트의 역할도 복잡해진다.

### After

`useLocalStorage` 커스텀 훅에서 저장과 불러오기 함수를 제공하도록 분리했다.

```jsx
const { loadValue, saveValue } =
  useLocalStorage("todo-data");
```

앱을 처음 실행할 때 저장된 todo를 reducer 초기값으로 사용한다.

```jsx
const [state, dispatch] = useReducer(
  todoReducer,
  initialTodoState,
  (initialState) => {
    const savedTodos = loadValue([]);

    return {
      ...initialState,
      todos: savedTodos,
    };
  }
);
```

todo가 변경되면 localStorage에 저장한다.

```jsx
useEffect(() => {
  saveValue(state.todos);
}, [state.todos, saveValue]);
```

### 결과

추가, 수정, 완료 변경, 삭제 결과가 localStorage에 저장되어 새로고침 후에도 유지된다. 실제 저장 로직은 커스텀 훅으로 이동하고 `App.jsx`는 저장 시점만 결정하도록 역할을 분리했다.

---

## 7. JSONPlaceholder Todo API 연동

### 문제 (내 코드)

서버에서 데이터를 가져오는 비동기 처리와 서버 데이터 구조를 현재 프로젝트 구조에 맞추는 과정이 필요했다.

### After

API 요청 코드를 `src/api/todosApi.js`로 분리했다.

```jsx
const response = await fetch(TODOS_API_URL, {
  signal,
});

if (!response.ok) {
  throw new Error(
    `투두를 불러오지 못했습니다. (${response.status})`
  );
}

const data = await response.json();
```

API 응답을 현재 todo 구조로 변환했다.

```jsx
return data.slice(0, 10).map((todo) => ({
  id: `api-${todo.id}`,
  text: todo.title,
  category: "daily",
  priority: "medium",
  done: todo.completed,
}));
```

저장된 todo가 있을 때는 사용자의 데이터를 API 결과로 덮어쓰지 않도록 요청을 생략했다.

```jsx
const hasSavedTodos = useRef(
  state.todos.length > 0
);

if (hasSavedTodos.current) {
  return;
}
```

### 결과

저장된 데이터가 없을 때 JSONPlaceholder에서 todo 10개를 불러오며, `title`, `completed` 값을 기존 코드에서 사용하는 `text`, `done` 구조로 변환해 기존 컴포넌트를 그대로 사용할 수 있게 되었다.

---

## 8. 로딩·에러·재시도와 요청 cleanup

### 문제 (내 코드)

API 요청 중이거나 요청에 실패했을 때 아무 화면도 보여주지 않으면 사용자는 현재 상태를 알 수 없다. 또한 컴포넌트가 사라진 뒤에도 요청이 계속 진행될 수 있다.

### After

로딩 상태에서는 스피너를 표시했다.

```jsx
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
```

실패 상태에서는 에러 메시지와 재시도 버튼을 표시했다.

```jsx
if (status === "error") {
  return (
    <div role="alert">
      <p>{error}</p>
      <button
        type="button"
        onClick={() => loadApiTodos()}
      >
        다시 시도
      </button>
    </div>
  );
}
```

Effect cleanup에서는 진행 중인 요청을 취소했다.

```jsx
const controller = new AbortController();
loadApiTodos(controller.signal);

return () => {
  controller.abort();
};
```

정상적인 요청 취소는 API 오류로 처리하지 않았다.

```jsx
if (error.name === "AbortError") {
  return;
}
```

### 결과

API 요청 중에는 로딩 스피너가 나오고, 실패하면 오류 메시지와 재시도 버튼이 표시된다. 사용자가 재시도 버튼을 누르면 이벤트 핸들러에서 API 요청을 다시 실행하며, 컴포넌트가 사라질 때는 진행 중인 요청을 정리한다.

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
- `useState` 기반 todo 상태를 `useReducer`로 전환했다.
- CRUD와 API 상태 변경을 reducer 액션으로 통합했다.
- localStorage에 데이터 버전과 todo 배열을 함께 저장했다.
- `useReducer` 지연 초기화로 저장 데이터를 처음 한 번만 불러왔다.
- `useLocalStorage` 커스텀 훅으로 저장 로직을 분리했다.
- JSONPlaceholder API 데이터를 기존 todo 구조로 변환했다.
- `async/await`, `try/catch`, `response.ok`로 비동기 요청과 오류를 처리했다.
- 로딩 스피너, 에러 메시지와 재시도 버튼을 구현했다.
- `AbortController`로 API 요청 cleanup을 처리했다.
- Effect와 Callback의 의존성 배열을 명확하게 작성했다.
- 현재 구조에 불필요한 `Promise.all()`, `Set`, `Map`은 억지로 추가하지 않았다.
- 숫자 ID와 API 문자열 ID를 상세 조회와 정렬에서 함께 처리했다.
