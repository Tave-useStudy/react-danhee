# React 스터디 과제

React 스터디에서 진행한 주차별 과제를 기록하는 저장소입니다.

## 주차별 구현 내용

### 1주차 - 투두리스트 기본 기능

- `useState`를 활용한 todo 상태 관리
- props를 통한 부모·자식 컴포넌트 간 데이터 전달
- 할 일 추가, 완료 상태 변경, 삭제
- 20자 글자 수 확인과 조건부 경고 문구 표시
- 완료된 할 일에 취소선 적용
- Random User API를 활용한 사용자 정보 조회
- 로딩 상태 처리

### 2주차 - 투두리스트 기능 확장

- 할 일 편집 모드 진입 및 종료
- 조건부 렌더링을 활용한 text와 input 전환
- 수정 내용 저장 및 취소
- 카테고리와 우선순위 필드 추가
- 카테고리별 할 일 필터링
- 전체·완료·미완료 상태 필터
- 최신순·오래된순·우선순위순 정렬
- `toSorted()`를 활용한 불변 정렬
- derived state 기반의 필터 및 정렬 결과 계산
- React Router를 활용한 메인·상세·설정 페이지 분리
- `useParams`를 활용한 개별 todo 조회
- `useNavigate`를 활용한 페이지 이동
- 입력값 공백 제거, Enter 제출, API 오류 처리 개선

### 3주차 - 상태 관리 리팩토링 및 데이터 연동

- `useState` 기반 todo 상태를 `useReducer`로 전환
- 추가·수정·삭제·완료 상태 변경을 CRUD 액션으로 통합
- `localStorage`를 활용한 todo 저장 및 불러오기
- 지연 초기화를 적용해 저장된 todo를 초기 상태로 사용
- 데이터 버전을 포함한 localStorage 스키마 구성
- `useLocalStorage` 커스텀 훅으로 저장 로직 분리
- JSONPlaceholder Todo API 연동
- API 응답을 기존 todo 데이터 구조로 변환
- API 요청의 로딩·성공·실패 상태 관리
- 로딩 스피너, 에러 메시지, 재시도 버튼 구현
- `AbortController`를 활용한 API 요청 cleanup
- 숫자 ID와 API 문자열 ID를 함께 처리하도록 상세 조회와 정렬 개선

## 주요 기능

| 기능 | 설명 |
| --- | --- |
| 할 일 추가 | 내용, 카테고리, 우선순위를 선택해 새로운 할 일을 추가합니다. |
| 할 일 수정 | 수정 버튼을 누르면 input으로 전환되며 저장하거나 취소할 수 있습니다. |
| 완료 처리 | 완료 상태에 따라 취소선을 표시하고 완료·취소 버튼을 전환합니다. |
| 할 일 삭제 | 선택한 할 일을 목록에서 삭제합니다. |
| 카테고리 필터 | 전체, 공부, 일상, 운동 카테고리별로 목록을 확인합니다. |
| 상태 필터 | 전체, 완료, 미완료 상태별로 목록을 확인합니다. |
| 정렬 | 최신순, 오래된순, 우선순위순으로 목록을 정렬합니다. |
| 상세 페이지 | 선택한 todo의 내용, 카테고리, 우선순위, 완료 상태를 확인합니다. |
| 데이터 영속화 | todo를 localStorage에 저장해 새로고침 후에도 유지합니다. |
| 외부 Todo API | 저장된 todo가 없으면 JSONPlaceholder API에서 todo 10개를 불러옵니다. |
| 로딩·에러 처리 | API 요청 중 스피너를 표시하고 실패하면 에러 메시지와 재시도 버튼을 제공합니다. |
| 사용자 정보 | Random User API에서 프로필 사진, 이름, 이메일을 가져옵니다. |

## 페이지 구성

| 경로 | 페이지 | 설명 |
| --- | --- | --- |
| `/` | 메인 페이지 | todo 추가, 수정, 삭제, 필터링, 정렬을 처리합니다. |
| `/todos/:id` | 상세 페이지 | URL의 ID를 이용해 개별 todo 정보를 조회합니다. |
| `/settings` | 설정 페이지 | 투두리스트 설정 화면을 표시합니다. |

## 프로젝트 구조

```text
src/
├── api/
│   └── todosApi.js
├── components/
│   ├── TaskList.jsx
│   ├── TextInput.jsx
│   ├── TodoItem.jsx
│   └── UserProfile.jsx
├── hooks/
│   └── useLocalStorage.js
├── pages/
│   ├── MainPage.jsx
│   ├── MainPage.module.css
│   ├── SettingsPage.jsx
│   └── TodoDetailPage.jsx
├── reducers/
│   └── todoReducer.js
├── App.jsx
└── main.jsx
```

## 기술 스택

- React
- JavaScript
- Vite
- React Router
- CSS Modules
- Web Storage API
- JSONPlaceholder API
- Random User API

## 실행 방법

```bash
npm install
npm run dev
```

개발 서버 실행 후 터미널에 표시된 주소로 접속합니다.

## 학습 내용

- `useReducer`를 활용한 복잡한 상태와 CRUD 액션 관리
- reducer에서 `map()`, `filter()`, 스프레드 문법을 활용한 불변성 유지
- `useReducer` 지연 초기화를 활용한 localStorage 데이터 불러오기
- 데이터 버전을 포함한 localStorage 스키마 구성
- 커스텀 훅을 활용한 저장 로직 분리와 재사용
- `async/await`과 `try/catch`를 활용한 비동기 처리
- `response.ok`를 활용한 API 오류 확인
- API 응답을 화면에서 사용하는 데이터 구조로 변환
- 로딩·성공·실패 상태에 따른 조건부 렌더링
- `AbortController`를 활용한 비동기 요청 cleanup
- `toSorted()`를 활용한 불변 정렬
- 필터 결과를 별도 state로 저장하지 않는 derived state 구성
- React Router를 활용한 페이지와 URL 분리
- 숫자와 문자열 ID가 함께 존재하는 데이터 처리

자세한 agent-skill 적용 내용은 [AGENT_SKILLS.md](./AGENT_SKILLS.md)에서 확인할 수 있습니다.
