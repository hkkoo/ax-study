# AX Study

GitHub Pages 동작을 확인하기 위한 간단한 정적 페이지입니다.

## 로컬 확인

```bash
python3 -m http.server 8000
```

브라우저에서 http://localhost:8000 을 엽니다.

## GitHub Pages 설정

저장소의 **Settings → Pages → Build and deployment**에서 다음을 선택합니다.

- Source: **Deploy from a branch**
- Branch: **main**
- Folder: **/ (root)**

**Save**를 누르고 배포가 완료되면 https://hkkoo.github.io/ax-study/ 를 확인합니다.
