---
layout: post
title: "Jekyll로 시작하는 AX Study"
description: "정적 HTML 테스트 페이지를 Markdown 기반의 학습 블로그로 바꿨습니다."
date: 2026-10-03 00:00:00 +0900
---
첫 번째 GitHub Pages 테스트를 마치고, 사이트를 Jekyll 기반으로 전환했습니다.
이제 Markdown으로 학습 내용을 기록할 수 있습니다.

## 무엇이 달라졌나요?

- 사이트 이름과 주소를 `_config.yml`에서 관리합니다.
- `_layouts/`의 공통 레이아웃을 홈, 소개, 글 페이지에 적용합니다.
- `_posts/`에 글을 추가하면 홈의 최근 학습 기록에 자동으로 표시됩니다.

## 다음 글을 작성하는 방법

`_posts/YYYY-MM-DD-title.md` 형식으로 파일을 만들고, 맨 위에 다음 정보를 넣습니다.

```yaml
---
layout: post
title: "새 학습 기록"
description: "이번 글에서 배운 내용을 한 줄로 정리합니다."
---
```

그 아래에 Markdown으로 본문을 작성합니다. 변경 사항을 `main` 브랜치에 푸시하면
GitHub Pages가 사이트를 다시 빌드하고 배포합니다.
