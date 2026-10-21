# 기능을 추가하기 위한 모듈 구조

현재 애플리케이션은 기능별 경계를 가진 모듈형 모놀리스입니다. 프런트엔드는 하나의 React 앱으로, 백엔드는 하나의 Spring Boot 앱으로 빌드하고 배포합니다. 기능이 늘어날 때 각 기능의 코드와 테스트를 독립된 디렉터리에 추가하고, 앱의 조립 지점에서 등록하는 방식입니다. 실행 중 플러그인을 내려받거나 서비스를 여러 개로 분리하는 구조는 아닙니다.

기존 URL, 게시판·회원 응답 형식과 DB 테이블 이름은 유지합니다. 디렉터리를 옮겼다는 이유로 API나 데이터를 이전할 필요는 없습니다.

## 프런트엔드

```text
frontend/src/
  app/
    modules.js             # 사용할 기능을 등록하는 목록
    featureRegistry.js     # 기능 정의 검증 및 조립
    routes.js              # 등록된 기능의 라우트 조립
    store.js               # 등록된 reducer·영속화·listener 조립
    layout/                # 공통 화면 틀, 헤더, 푸터
  features/
    board/
      api/                 # 게시판 서버 요청
      model/               # 상태, 선택자, listener
      components/          # 게시판 안에서 사용하는 UI
      pages/               # 목록·상세·작성 화면
      index.js             # 외부에서 사용할 공개 API와 기능 정의
    auth/
      api/
      model/
      pages/
      legacy/              # 아직 연결하지 않은 이전 OAuth 화면
      index.js
    home/
      index.js
  shared/
    api/
      request.js           # 공통 요청·인증 헤더·오류 정규화
      tokenStorage.js      # 세션 토큰 접근
```

`app`은 기능을 선택하고 연결합니다. 각 기능은 자신의 화면·API·상태·테스트를 소유합니다. `shared`는 특정 기능을 알지 못하는 공통 코드를 담습니다. 공통 레이아웃은 인증 상태와 내비게이션을 조합하므로 `app/layout`에 둡니다.

다른 기능이 필요할 때는 해당 기능의 `index.js`에서 공개한 선택자나 API를 사용합니다. 예를 들어 게시판은 인증 모듈의 로그인 사용자 선택자를 사용할 수 있지만, 인증 모듈의 reducer 파일이나 내부 상태 모양을 직접 참조하지 않습니다. `shared`에서 `features`나 `app`을 import하지 않습니다.

### 기능 등록

각 기능은 `index.js`에서 기능 정의를 공개합니다.

| 필드 | 역할 |
| --- | --- |
| `id` | 기능의 고유 식별자 |
| `routes` | 기능이 제공하는 경로와 화면 |
| `navigation` | 공통 헤더에 추가할 메뉴의 `path`와 번역 키 `labelKey` |
| `reducers` | Redux 루트 키와 reducer의 연결 |
| `persistedReducers` | 새로고침 뒤 복원할 reducer 키 |
| `registerListeners` | 기능의 상태 변화에 따른 부수 효과 등록 |

`app/modules.js`의 목록을 `createFeatureRegistry(...)`에 전달하면 라우터·스토어·헤더 메뉴가 같은 등록 정보를 사용합니다. 기능을 등록하면서 라우터와 스토어를 따로 수정하는 실수를 줄이는 조립 지점입니다. 이 정의는 앱 빌드에 포함되는 정적 JavaScript 코드입니다.

예를 들어 댓글 화면과 상태를 만든 뒤 다음처럼 공개합니다. 아래 코드는 확장 예시이며 댓글 기능을 새로 구현한 것은 아닙니다.

```jsx
// features/comment/index.js
import CommentPage from './pages/CommentPage';
import commentReducer from './model/commentSlice';

export const commentModule = {
    id: 'comment',
    routes: [{ path: '/comments', element: <CommentPage /> }],
    navigation: [{ path: '/comments', labelKey: 'comment.menu' }],
    reducers: { comments: commentReducer },
    persistedReducers: []
};
```

번역 키를 추가하고 `app/modules.js`에서 `commentModule`을 import해 등록 목록에 넣으면 라우트·상태·메뉴가 함께 연결됩니다.

기존 활성 경로는 `/`, `/join`, `/login`, `/board-list`, `/post`, `/board/:boardNo`입니다. 이전 Google·Kakao 콜백 화면은 `auth/legacy`에 보관하며 등록하지 않습니다. 이 구조 변경으로 OAuth가 활성화되거나 운영 인증 설정이 완료되지는 않습니다.

### 상태와 부수 효과

게시판 상태는 루트의 `boards`, 인증 상태는 루트의 `auth`에 둡니다. 새 기능은 고유한 reducer 키를 사용합니다. 인증 여부·로그인 사용자 ID는 인증 모듈의 공개 선택자로 읽고, 토큰은 `shared/api/tokenStorage.js`를 통해 접근합니다.

reducer는 상태 변경만 수행합니다. 알림, 페이지 이동, 토큰 저장 같은 작업은 기능의 listener 또는 화면에서 처리합니다. listener의 알림·이동·세션 의존성은 주입할 수 있게 두어, 테스트에서 브라우저 동작 없이 검증합니다.

기존 브라우저 저장 데이터에는 `boards` 안에 인증 필드가 들어 있습니다. 스토어의 마이그레이션이 이 필드를 `auth`로 옮기고 목록의 진행 상태·오류·요청 ID는 초기화합니다. 영속 상태의 모양을 변경할 때는 이 마이그레이션과 기존 세션 복원 테스트도 함께 갱신합니다. 진행 중인 네트워크 요청이나 오류 객체를 저장 대상으로 추가하지 않습니다.

### 서버 요청

화면은 기능의 API를 호출하고, 기능 API가 공통 요청 계층을 사용합니다. URL과 응답 해석은 각 기능 안에 둡니다. 공통 요청 계층은 인증 헤더, 취소 신호, 직렬화 가능한 오류 형태를 담당합니다.

새 기능에서 Axios 호출과 세션 토큰 접근을 화면마다 복제하지 않습니다. 파일 업로드의 `FormData`는 브라우저가 multipart boundary를 만들도록 전달합니다. 게시판 목록의 요청 ID 검사와 취소 처리는 유지해, 늦게 도착한 응답이 최신 화면을 덮어쓰지 않게 합니다.

## 백엔드

```text
backend/src/main/java/com/bit/boardapp/
  board/
    api/                   # 게시판 HTTP 컨트롤러
    application/           # 게시판 서비스·변환·첨부파일 조정
      dto/                 # 기능의 입력·출력 계약
    domain/                # 게시글·첨부파일 엔티티
    persistence/           # 저장소와 검색 쿼리
  user/
    api/
    application/
      dto/                 # 회원 입력·출력 계약
    domain/
    persistence/
    security/              # 회원 정보 기반 인증 어댑터
    infrastructure/mail/   # 메일 발송 구현
  shared/
    api/                   # 공통 응답 형식
    domain/                # 공통 감사 필드
    security/              # JWT 생성·검증과 필터
    configuration/         # 앱 공통 Spring 설정
    storage/               # 파일 저장 계약과 저장소 구현
```

각 기능은 자신의 HTTP 계약, 처리 흐름, 엔티티와 검색 쿼리를 함께 소유합니다. DTO는 기능의 `application/dto`에 두고, `BoardMapper`·`UserMapper`가 변환을 맡습니다. 컨트롤러와 서비스는 이 계약을 사용하고, 엔티티에서는 DTO를 만들지 않습니다. 공통 코드를 추가할 때는 두 기능 이상에서 필요한지 먼저 확인합니다. 한 기능의 업무 규칙을 편의상 `shared`로 옮기지 않습니다.

JWT 생성은 회원 엔티티 전체가 아니라 사용자 ID를 받습니다. 이 때문에 공통 보안 코드가 회원 도메인에 의존하지 않습니다. 회원 조회와 Spring Security의 사용자 정보 변환은 `user/security`가 담당합니다.

파일 저장에는 `shared/storage`의 `FileStorage`와 `StoredFile` 계약을 사용합니다. 게시판의 `BoardAttachmentService`가 업로드 결과를 게시판 첨부파일로 변환하므로, 게시판 컨트롤러는 MinIO SDK의 설정이나 객체를 다루지 않습니다. `FileStorage.store(file, directory)`는 저장 성공 후 파일 이름·경로·원래 이름·콘텐츠 형식을 담은 `StoredFile`을 반환합니다. MinIO 구현은 `MinioFileStorage`가 맡고 저장 실패는 `FileStorageException`으로 전달합니다. 저장소 제공자를 바꿀 때는 이 계약의 구현과 설정을 교체하고, 게시판 API와 파일 변환 규칙은 유지합니다. 공개 파일 URL의 기준 경로는 프런트엔드의 `FILE_BASE_URL`로 분리했습니다. 배포 환경 파일의 `PUBLIC_FILE_BASE_URL`을 바꾸면 다음 이미지 빌드에 반영됩니다. 기존 `REACT_APP_MINIO_API_URL`도 이전 설정을 위한 대체값으로 읽습니다. `storage.provider`가 없거나 `minio`일 때만 MinIO 설정과 구현이 활성화됩니다. 새 제공자를 추가할 때는 `FileStorage` 구현과 해당 Spring bean을 만들고 이 설정값을 변경합니다. 다른 제공자를 선택하면 MinIO bean과 자격증명 요구도 함께 제외되지만, 로컬·S3 구현이 이미 제공된다는 뜻은 아닙니다.

현재 배포 템플릿은 MinIO 컨테이너·상태 점검·프록시를 포함합니다. 다른 저장소를 도입할 때는 구현과 공개 URL뿐 아니라 배포 템플릿의 인프라 의존성·필요 환경 변수도 함께 조정합니다. 제공자 값만 바꾼다고 S3·로컬 저장소가 새로 구현되지는 않습니다.

`PUBLIC_FILE_BASE_URL`에는 마지막 `/`를 포함합니다. 예를 들어 `/storage/mywebbucket/` 또는 `https://files.example.com/bucket/`처럼 지정하면 저장 결과의 디렉터리·파일 이름을 뒤에 붙여 사용합니다.

새 기능에서 다른 기능의 persistence 구현이나 컨트롤러를 호출하지 않습니다. 필요한 작업을 application의 공개 계약으로 연결하고, 기능 간 전달 값은 식별자나 명확한 계약으로 한정합니다. `shared`가 특정 기능의 엔티티·DTO를 import하면 경계를 다시 검토합니다. QueryDSL 타입은 Gradle annotation processing이 `build/generated` 아래에 생성합니다. 새 엔티티의 Q 클래스를 직접 작성하거나 추적 소스 디렉터리에 복사하지 않습니다.

## 예: 댓글 기능을 추가하는 순서

다음은 확장 위치를 설명하는 절차입니다. 현재 댓글 API나 화면이 구현되어 있다는 뜻은 아닙니다.

1. 백엔드에 `comment/api`, `comment/application`, `comment/domain`, `comment/persistence`를 만들고 댓글의 요청·응답·저장·처리 규칙을 그 안에 둡니다.
2. 게시글과의 연결에는 게시글 식별자를 사용하고, 게시글 확인이 필요하면 게시판 application의 공개 계약을 사용합니다. 게시판 저장소 구현을 댓글에 복사하지 않습니다.
3. 프런트엔드에 `features/comment`를 만들고 API, 상태, UI와 테스트를 함께 둡니다. 작성자 정보가 필요하면 인증 모듈의 공개 선택자를 사용합니다.
4. `features/comment/index.js`에서 필요한 화면·reducer·listener와 공개 API를 정의합니다. 별도 경로가 없는 기능은 라우트를 추가할 필요가 없습니다.
5. `app/modules.js`에 댓글 기능을 등록합니다. 메뉴가 필요한 경우 댓글 모듈의 `navigation`에 경로와 번역 키를 추가합니다. 루트 라우터·스토어·헤더에 기능별 조건문을 따로 추가하지 않습니다.
6. 상태를 저장할 필요가 있을 때만 `persistedReducers`에 포함합니다. 저장 형식을 바꾸면 기존 세션을 위한 마이그레이션을 추가합니다.
7. 새 기능 테스트와 전체 회귀 테스트를 실행하고 PR로 검토합니다. 배포 단위는 기존 프런트엔드·백엔드 앱을 그대로 사용합니다.

## 검증

프런트엔드에서 기능의 공개 API·reducer·listener·화면을 검증하고, 등록 충돌과 기존 저장 데이터 복원도 확인합니다. 백엔드에서는 기능 서비스·컨트롤러·실제 애플리케이션 통합 테스트를 실행합니다. 저장소 계약의 테스트는 외부 MinIO 없이도 게시판의 파일 변환과 실패 전달을 검증할 수 있어야 합니다.

```bash
cd frontend
CI=true npm test -- --watchAll=false --runInBand
npm run build
```

```bash
cd backend
# Java 17을 사용합니다.
bash gradlew test bootJar
```

GitHub Actions는 같은 테스트와 빌드를 수행합니다. 서버 구성과 `main` 자동 배포는 [배포 가이드](deployment.md)를 참고합니다. 기능 분리만으로 외부 메일·OAuth 연결이나 운영 비밀값 설정이 완료되는 것은 아닙니다.
