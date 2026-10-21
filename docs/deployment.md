# main push → 서버 자동 배포

`main`에 push하면 GitHub에서 프런트엔드·백엔드 테스트를 실행하고, 모두 통과한 경우 서버의 self-hosted runner가 Docker 이미지를 빌드해 앱을 교체합니다. DB와 MinIO 데이터 볼륨은 유지합니다. 이 문서와 설정 파일을 추가하는 것만으로 서버가 만들어지거나 자동 배포가 활성화되지는 않습니다.

## 1. 서버 준비

권장 시작 구성은 Ubuntu 24.04 LTS, Linux x64, 2 vCPU 이상, RAM 4GB 이상입니다. 서버에서 Java·React 이미지를 빌드하므로 RAM 8GB 이상이면 여유가 있습니다. 저장 공간은 데이터와 Docker 이미지 크기를 고려해 40GB 이상으로 준비합니다.

- [Docker의 Ubuntu 설치 문서](https://docs.docker.com/engine/install/ubuntu/)에 따라 Docker Engine과 Compose plugin을 설치합니다.
- 서버 보안 그룹·방화벽에서 SSH와 웹 서비스용 80/443 포트만 필요한 범위에 허용합니다. MySQL·MinIO를 인터넷에 직접 공개할 필요가 없습니다.
- 운영 도메인이 있으면 DNS A 레코드를 서버 IP로 지정합니다. 도메인 없이 SSH 터널로 먼저 확인할 수도 있습니다.

서버 관리 계정에서 Git·Python과 배포 전용 계정을 준비합니다. 배포 스크립트는 Python으로 API 응답을 검증합니다.

```bash
sudo apt-get update
sudo apt-get install -y git curl python3
sudo adduser --disabled-password --gecos '' deploy
sudo usermod -aG docker deploy
sudo install -d -o deploy -g deploy -m 0700 /etc/myweb
sudo -iu deploy

docker version
docker compose version
```

Docker 그룹 권한은 서버 관리 권한에 준합니다. 이 계정과 runner에서는 신뢰하는 저장소의 배포 작업만 실행합니다. Docker 그룹 추가 뒤에는 새 로그인 세션을 사용해야 합니다.

## 2. 소스와 서버 환경 파일 준비

먼저 기존 게시판·테스트 변경 PR과 이 배포 설정을 `main`에 병합합니다. 그 뒤 서버의 `deploy` 계정으로 실행합니다.

```bash
git clone --branch main https://github.com/LeeMooho/myweb.git ~/myweb
cd ~/myweb
install -m 0600 deploy/.env.example /etc/myweb/.env.prod
nano /etc/myweb/.env.prod
```

비공개 저장소라면 최초 clone에는 읽기 전용 deploy key 등 GitHub가 지원하는 인증을 사용합니다. 비밀값을 명령행이나 채팅에 입력하지 않습니다.

`deploy/.env.example`의 `DB_PASS`, `DB_ROOT_PASS`, `MINIO_ROOT_PASSWORD`를 각각 긴 임의 값으로 바꿉니다. `DB_USER`는 root 이외의 앱 전용 계정을 사용합니다. `MAIL_USER`·`MAIL_PASS`는 메일 발송을 사용할 때 설정합니다. 파일은 서버에만 보관하고 Git에 추가하지 않습니다. DB 초기 계정·비밀번호는 최초 볼륨 초기화 때 설정됩니다. 이후 변경할 때는 환경 파일과 DB 내부 계정을 함께 갱신하며, 비밀번호 변경을 위해 데이터 볼륨을 삭제하지 않습니다. `REACT_APP_*`는 브라우저에 배포되는 공개 설정이므로 API 주소와 공개 클라이언트 ID만 넣습니다. Google client secret 같은 비밀값은 넣지 않습니다.

서버의 `.env.prod`를 직접 사용하므로 GitHub Actions Secrets에 DB·MinIO 비밀번호를 복사할 필요가 없습니다. 파일을 읽을 수 있는 계정은 배포 계정과 관리자에 한정합니다.

공개 운영 전에는 별도 앱 보안 정비가 필요합니다. 현재 저장소에는 SMTP·NCP 인증정보와 JWT 서명 키가 코드에 포함돼 있으므로 노출된 인증정보를 교체하고, JWT 키와 남아 있는 서비스 비밀값을 서버 측 설정으로 옮겨야 합니다. 사용하지 않는 기존 인증정보도 제거합니다. 이 배포 구성은 해당 앱 코드 정비를 대신하지 않습니다.

이 배포 구성은 별도의 `deploy/compose.yml`을 사용합니다. DB는 MySQL 8이며, MinIO는 `deploy/minio.Dockerfile`이 공식 소스 릴리스 `RELEASE.2025-10-15T17-29-55Z`에서 빌드합니다. 초기 버킷 설정에 쓰는 `mc`도 공식 릴리스 `RELEASE.2025-08-13T08-35-41Z`에서 함께 빌드합니다. 로컬 이미지 이름은 `myweb-minio:release20251015`이고, 사라졌거나 접근이 제한된 공개 MinIO 이미지에 의존하지 않습니다. 최초 빌드에는 소스·Go 의존성 다운로드 시간과 추가 디스크 공간이 필요합니다.

## 3. DB·파일 저장소 최초 실행

서버에서 다음 명령을 한 번 실행합니다.

```bash
cd ~/myweb
DEPLOY_ENV_FILE=/etc/myweb/.env.prod \
COMPOSE_PROJECT_NAME=myweb \
bash scripts/bootstrap.sh
```

`bootstrap.sh`는 MinIO 이미지를 빌드한 뒤 DB·MinIO를 시작하고 준비 상태를 확인합니다. 앱의 최초 배포와 구분되는 단계입니다. 이후 자동 배포는 DB·MinIO를 재시작하거나 다시 만들지 않습니다.

`bootstrap.sh`는 `mc`로 `mywebbucket` 버킷을 생성하고 익명 **읽기** 정책을 적용합니다. 이미 버킷이 있으면 다시 사용하므로 반복 실행할 수 있습니다. 익명 쓰기는 허용하지 않습니다. 현재 앱은 첨부파일을 공개 URL로 표시하므로 이 버킷의 파일은 공개 파일로 취급합니다. `mc`의 임시 인증 설정은 컨테이너 안에서 사용 후 삭제됩니다.

선택적으로 MinIO 관리 화면을 확인하려면 개인 PC에서 SSH 터널을 엽니다.

```bash
ssh -L 19001:127.0.0.1:19001 <SSH계정>@<서버주소>
```

개인 PC의 `http://localhost:19001`에서 서버 환경 파일에 지정한 MinIO 계정으로 로그인합니다. 버킷을 수동으로 만들 필요는 없습니다.

Compose 프로젝트 이름 `myweb`은 이후에도 동일하게 사용합니다. 프로젝트 이름을 바꾸면 기존 데이터가 연결되지 않은 새 볼륨·네트워크가 만들어질 수 있습니다. `docker compose down -v`는 데이터 볼륨을 삭제하므로 운영 갱신에 사용하지 않습니다.

## 4. 서버를 GitHub runner로 등록

GitHub 저장소에서 **Settings → Actions → Runners → New self-hosted runner → Linux → x64**를 선택합니다. 서버의 `deploy` 계정으로 전용 디렉터리를 만들고, 화면에서 제시하는 다운로드·검증·설정 명령을 그대로 실행합니다.

```bash
mkdir -p ~/actions-runner
cd ~/actions-runner
# GitHub 화면에 표시되는 다운로드·검증·config.sh 명령을 실행합니다.
```

등록 과정의 labels에 `myweb-production`을 추가합니다. 기본 `self-hosted`, `Linux`, `X64` 라벨도 유지합니다. 등록 토큰은 GitHub 화면에서 생성되는 단기 토큰을 사용하며 저장소나 문서에 복사하지 않습니다.

설정 후 서버 **관리 계정**으로 돌아와 runner를 서비스로 설치합니다. 배포 계정에 sudo 권한을 줄 필요는 없습니다.

```bash
sudo bash -c 'cd /home/deploy/actions-runner && ./svc.sh install deploy && ./svc.sh start && ./svc.sh status'
```

runner는 `deploy` 사용자로 실행되어야 하며 Docker와 `/etc/myweb/.env.prod`에 접근할 수 있어야 합니다. GitHub 화면에 runner가 **Idle**로 표시되는지 확인합니다.

이 runner는 신뢰하는 `main`의 배포에만 사용합니다. `main` 대상 PR도 테스트를 실행하지만 GitHub-hosted `ubuntu-latest`만 사용하며, PR·fork의 코드는 서버 runner에서 실행하지 않습니다. PR 검사와 운영 배포의 실행 그룹도 분리됩니다. 서버는 GitHub·패키지 저장소·컨테이너 레지스트리에 외부 연결이 가능해야 하며, GitHub가 서버로 들어오는 별도 SSH 연결은 필요하지 않습니다.

## 5. GitHub 설정과 활성화

저장소 **Settings → Environments**에서 `production` 환경을 만듭니다. 배포 가능 브랜치를 `main`으로 제한합니다. 필요하면 승인자를 지정할 수 있지만, 승인자를 설정하면 매 배포마다 승인 대기가 발생합니다.

**Settings → Secrets and variables → Actions → Variables**에서 다음 저장소 변수를 설정합니다.

| 변수 | 값 | 용도 |
| --- | --- | --- |
| `DEPLOY_ENABLED` | `true` | 서버 준비 후에만 자동 배포 활성화 |
| `DEPLOY_ENV_FILE` | `/etc/myweb/.env.prod` | 서버 환경 파일의 절대 경로. 생략 시 이 경로 사용 |
| `COMPOSE_PROJECT_NAME` | `myweb` | 최초 실행과 동일한 Compose 프로젝트 이름 |

서버 준비 전에는 `DEPLOY_ENABLED`를 만들지 않거나 `false`로 둡니다. 테스트가 통과해도 배포 작업은 건너뜁니다.

설정 PR을 병합하기 전에도 `main` 대상 PR의 테스트 결과를 GitHub에서 확인할 수 있습니다. 배포 작업은 PR에서 항상 건너뜁니다.

설정 파일이 포함된 `main`에서 **Actions → Test and deploy main → Run workflow**를 실행해 최초 배포를 확인합니다. 수동 실행도 `main`에서만 배포할 수 있습니다. 이후에는 `main` push마다 같은 흐름이 실행됩니다.

1. GitHub-hosted runner가 프런트엔드·백엔드 테스트를 실행합니다.
2. 테스트 성공 후 `production` 환경의 배포 작업이 실행됩니다.
3. 서버에서 `scripts/deploy.sh`가 프런트엔드·백엔드를 빌드·재생성합니다.
4. 컨테이너 준비 상태와 실제 웹·게시판 API 응답이 성공해야 배포 성공으로 처리합니다.

DB·MinIO가 중지된 경우 자동 배포가 대신 초기화하지 않습니다. 서버에서 원인을 확인하고 `bootstrap.sh`로 필요한 기반 서비스를 준비한 뒤 다시 배포합니다.

## 6. 접속과 HTTPS

앱의 내부 웹 진입점은 서버의 `127.0.0.1:8088`입니다. `/api/`는 백엔드로, `/storage/`는 MinIO로 전달됩니다. MinIO 관리 콘솔은 `127.0.0.1:19001`입니다. 관리 콘솔을 외부에 직접 공개하지 않습니다.

도메인 준비 전에는 개인 PC에서 다음 터널로 앱을 확인합니다.

```bash
ssh -L 8088:127.0.0.1:8088 <SSH계정>@<서버주소>
```

브라우저에서 `http://localhost:8088`을 엽니다. 게시판 조회와 새로고침, 첨부파일 접근도 확인합니다.

운영 도메인을 사용하려면 [Caddy 공식 설치 문서](https://caddyserver.com/docs/install)에 따라 호스트에 Caddy를 설치하고 `/etc/caddy/Caddyfile`에 다음처럼 설정합니다.

```caddyfile
example.com {
    reverse_proxy 127.0.0.1:8088
}
```

실제 도메인으로 바꾸고 DNS와 80/443 접근이 준비된 상태에서 적용합니다.

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

웹 API는 `/api`, 파일 URL은 `/storage/mywebbucket/`라는 상대 경로를 사용해 같은 HTTPS 도메인으로 접속합니다. `FRONTEND_PORT`를 바꾸면 Caddy의 대상 포트도 맞춥니다. 선택적인 `REACT_APP_FRONT_URL`·`REACT_APP_BACK_URL`과 소셜 로그인 제공자의 redirect URI는 현재 앱 구현에 맞춰 별도로 점검해야 합니다. React 설정은 빌드할 때 적용되므로 변경 후 다시 배포해야 합니다. 기존 소셜 로그인 코드에는 HTTP 주소와 client-secret 처리 제약이 있어, 이 배포 설정만으로 운영 OAuth 구성이 완료되지는 않습니다.

## 7. 실패 확인과 이전 버전 재배포

GitHub Actions 실행 화면에서 실패한 단계를 확인합니다. 서버에서는 해당 버전 checkout에서 다음 명령으로 상태를 확인할 수 있습니다. `docker compose config` 전체 출력에는 비밀번호가 포함될 수 있으므로 출력·공유하지 않습니다.

```bash
cd ~/myweb
docker compose --env-file /etc/myweb/.env.prod \
  -p myweb -f deploy/compose.yml ps
docker compose --env-file /etc/myweb/.env.prod \
  -p myweb -f deploy/compose.yml logs --tail=100 backend frontend
```

기본 점검 항목은 runner 서비스 상태, Docker 권한, 환경 파일 경로·읽기 권한, DB·MinIO의 실행 상태, 이미지 다운로드 가능 여부, 포트 사용 여부입니다. 비밀값이 포함된 환경 파일이나 전체 컨테이너 설정을 로그에 붙이지 않습니다.

이전 버전으로 되돌릴 때는 서버의 수동 checkout에서 **마지막으로 배포에 성공한 main 커밋의 전체 SHA**를 선택합니다. 진행 중인 자동 배포가 없는 때에 실행합니다.

```bash
cd ~/myweb
git fetch origin main
git checkout --detach <이전에-성공한-main-커밋-SHA>
DEPLOY_ENV_FILE=/etc/myweb/.env.prod \
COMPOSE_PROJECT_NAME=myweb \
bash scripts/deploy.sh
```

이 명령은 앱 버전만 되돌립니다. DB 스키마·데이터는 되돌리지 않으며 자동 데이터 복구도 하지 않습니다. 데이터 구조가 바뀌는 배포 전에는 DB·MinIO 백업과 복구 방법을 준비합니다. 장애 수습 뒤 `main`에도 수정 또는 revert를 반영해야 다음 push에서 문제가 다시 배포되지 않습니다.

단일 서버의 컨테이너 교체 방식이므로 배포 중 짧은 연결 중단이 발생할 수 있습니다. 무중단 배포와 자동 DB 마이그레이션·롤백은 이 구성에 포함되지 않습니다.
