# AX Study

Jekyll과 GitHub Pages로 운영하는 한국어 학습 블로그입니다.
사이트: https://hkkoo.github.io/ax-study/

## 구성

- `_config.yml`: 사이트 이름, 주소, 글 URL 설정
- `index.md`, `about.md`: 홈과 소개
- `_posts/`: 날짜별 Markdown 학습 기록
- `_layouts/`: 공통 HTML 레이아웃
- `assets/css/`: 반응형 스타일
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
