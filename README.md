# AX Study

AI 학습과 업무 적용 실험을 기록하는 포트폴리오입니다. Jekyll과 GitHub Pages로 운영합니다.
사이트: https://hkkoo.github.io/ax-study/

## 구성

- `_config.yml`: 사이트 이름, 주소, 글 URL 설정
- `index.md`, `about.md`: 프로젝트 현황·분류 필터·학습 기록으로 구성한 홈과 소개
- `_data/experiments.json`: 홈과 상세 노트에 함께 사용하는 실험 기획
- `portfolio.md`: 가상 입력, 기대 결과, 비교 방법을 담은 실험 설계 노트
- `docs/`: 프로젝트·학습 기록 작성 양식 (사이트 빌드에서 제외)
- `_posts/`: 날짜별 Markdown 학습 기록
- `_layouts/`: 공통 HTML 레이아웃
- `assets/css/`: 반응형 스타일
- `assets/js/site.js`: 프로젝트 분류 및 저장되는 밝은/어두운 테마
- `_site/`: 빌드 결과 (Git에서 제외)

## 로컬 실행

Ruby 3.3과 Bundler 2.x를 준비합니다.

```bash
gem install bundler -v '~> 2.0'
bundle install
bundle exec jekyll serve
```

설치 명령은 로컬 의존성을 추가합니다. 개발 서버는 `_site/`를 생성하고
변경된 파일을 다시 빌드합니다. http://localhost:4000/ax-study/ 를 엽니다.

```bash
bundle exec jekyll build
git diff --check
```

첫 명령은 `_site/`에 사이트를 생성하고, 두 번째는 파일을 수정하지 않고
공백 오류를 검사합니다. 별도 자동 테스트 프레임워크는 사용하지 않습니다.
변경 후 홈, 소개, 글 링크와 모바일 레이아웃을 확인합니다.

### 이 Linux 작업 서버에서 실행

관리자 권한 없이 Ruby 3.3과 Bundler를 `$HOME/.local/opt/ax-study-ruby`에,
프로젝트 의존성을 `$HOME/.local/share/ax-study-bundle`에 설치했습니다.
기존 셸 설정이나 Hermes 실행 환경은 변경하지 않습니다.

```bash
bash docs/jekyll-local.sh build
bash docs/jekyll-local.sh serve --host 127.0.0.1 --port 4174
```

두 번째 명령이 실행 중인 상태에서 다른 터미널로 브라우저 검사를 실행합니다.
Playwright와 Chromium은 이 서버의 사용자 전용 디렉터리에 설치되어 있습니다.

```bash
PLAYWRIGHT_MODULE="$HOME/.local/share/ax-study-qa/node_modules/playwright" \
  QA_OUTPUT="$HOME/.local/share/ax-study-qa/results" \
  node docs/check-site.cjs
```

다른 환경에서는 별도 디렉터리에 `npm install playwright` 후
`npx playwright install chromium`을 실행하고 `PLAYWRIGHT_MODULE`에 설치 경로를 지정합니다.
`SITE_URL`로 검사 주소를, `QA_OUTPUT`으로 스크린샷 저장 위치를 바꿀 수 있습니다.
분류 필터, 데이터별 항목 수, 테마 유지, 키보드 본문 이동, 내부 링크 및
1440·768·390·320px 화면의 가로 넘침을 검사합니다.

## 글 추가

`_posts/YYYY-MM-DD-title.md` 파일을 만들고 다음 머리말 뒤에 본문을 작성합니다.
날짜는 게시할 날짜로 지정합니다.

```yaml
---
layout: post
title: "글 제목"
description: "글 소개"
---
```

## 배포

Settings → Pages에서 Source는 **Deploy from a branch**, Branch는 **main**,
Folder는 **/ (root)**로 설정합니다. `main`에 푸시하면 GitHub Pages가
Jekyll 빌드와 배포를 실행합니다. Actions에서 성공 여부를 확인합니다.

프로젝트 주소의 `/ax-study` 경로를 유지하도록 내부 링크는
Liquid의 `relative_url` 필터를 사용합니다.
