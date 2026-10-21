# Myweb

React 프런트엔드와 Spring Boot 백엔드로 구성한 게시판·회원 애플리케이션입니다. 기능별 모듈을 하나의 앱에서 조립하고 배포합니다.

- [모듈 구조와 새 기능 추가 방법](docs/architecture.md): 기능 등록, 공개 계약, 상태·저장소 확장, 테스트 실행
- [서버 구성과 자동 배포](docs/deployment.md): 최초 서버 준비, GitHub Actions, 환경 변수, 배포·복구
- [운영 환경 변수 예시](deploy/.env.example)

프런트엔드는 `frontend/src/features`, 백엔드는 `backend/src/main/java/com/bit/boardapp`의 기능별 패키지에 코드와 테스트를 추가합니다. 세부 절차와 댓글 기능을 추가하는 예시는 모듈 구조 문서를 참고하세요.

## 테스트와 빌드

Node.js 22와 Java 17을 사용합니다.

```bash
cd frontend
npm ci
CI=true npm test -- --watchAll=false --runInBand
npm run build
```

```bash
cd backend
bash gradlew test bootJar
```

PR에서는 테스트와 빌드를 실행합니다. `main`의 자동 배포는 서버·runner·환경 파일을 준비하고 `DEPLOY_ENABLED=true`를 설정한 뒤 활성화됩니다.
