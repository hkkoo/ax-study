---
layout: default
title: 홈
description: AI 학습과 개인 프로젝트, 업무 자동화 실험을 과정과 검증 결과까지 기록합니다.
---
<div class="portfolio-home">
  <section class="hero shell" aria-labelledby="hero-title">
    <div class="hero-copy">
      <div class="hero-kickers">
        <span class="eyebrow">AX STUDY · OPEN LEARNING LOG</span>
        <span class="status-pill"><span class="status-dot"></span> 첫 실험 준비 중</span>
      </div>
      <h1 id="hero-title">AI를 배우고,<br>작게 만들어,<br><span>확인한 만큼 기록합니다.</span></h1>
      <p class="hero-description">개인 프로젝트와 반복 업무의 작은 불편을 AI로 풀어봅니다. 결과뿐 아니라 선택한 방법, 실패와 수정, 직접 검증한 내용도 함께 남깁니다.</p>
      <div class="hero-actions">
        <a class="button button-primary" href="#projects">프로젝트 살펴보기 <span aria-hidden="true">↘</span></a>
        <a class="text-link" href="#journal">학습 기록 읽기 <span aria-hidden="true">→</span></a>
      </div>
      <p class="hero-meta"><span>관심 주제</span> 생성형 AI · 검색 · 업무 자동화</p>
    </div>
    <aside class="current-project" aria-label="현재 준비 중인 실험">
      <div class="panel-topline"><span>NOW EXPLORING</span><span class="panel-index">01 / 03</span></div>
      <p class="panel-label">첫 번째 실험</p>
      <h2>내 학습 노트<br>Q&amp;A</h2>
      <p class="panel-description">내가 정리한 Markdown 노트에서 답을 찾고, 근거가 된 문장을 함께 보여줄 수 있을까?</p>
      <div class="panel-rule"></div>
      <div class="panel-plan"><span>실험 계획</span><strong>노트 10개 · 질문 20개</strong></div>
      <a href="{{ '/portfolio/' | relative_url }}" class="panel-link">기획과 검증 기준 보기 <span aria-hidden="true">↗</span></a>
      <span class="panel-orbit orbit-one" aria-hidden="true"></span>
      <span class="panel-orbit orbit-two" aria-hidden="true"></span>
    </aside>
  </section>

  <section class="shell metrics" aria-label="포트폴리오 현황">
    <div class="metric-card metric-highlight"><span class="metric-label">프로젝트 후보</span><strong>03</strong><span class="metric-caption">작게 시작할 실험</span></div>
    <div class="metric-card"><span class="metric-label">구현 완료</span><strong>00</strong><span class="metric-caption">아직 공개 전</span></div>
    <div class="metric-card"><span class="metric-label">검증 완료</span><strong>00</strong><span class="metric-caption">측정 후 기록 예정</span></div>
    <div class="metric-card"><span class="metric-label">학습 기록</span><strong>{{ site.posts | size }}</strong><span class="metric-caption">실험과 제작 과정</span></div>
  </section>

  <section class="shell projects-section" id="projects" aria-labelledby="projects-title">
    <div class="section-heading">
      <div><p class="eyebrow">IDEAS TO EXPERIMENTS</p><h2 id="projects-title">만들어 볼 것들</h2></div>
      <a class="section-link" href="{{ '/portfolio/' | relative_url }}">전체 기획 보기 <span aria-hidden="true">↗</span></a>
    </div>
    <p class="section-intro">완성된 성과 목록이 아니라, 다음에 직접 만들어 검증할 아이디어입니다.</p>
    <div class="filter-bar" role="group" aria-label="프로젝트 분류">
      <button class="filter-button is-active" type="button" data-filter="all" aria-pressed="true">전체 <span>04</span></button>
      <button class="filter-button" type="button" data-filter="personal" aria-pressed="false">개인 프로젝트 <span>02</span></button>
      <button class="filter-button" type="button" data-filter="automation" aria-pressed="false">업무 자동화 <span>01</span></button>
      <button class="filter-button" type="button" data-filter="learning" aria-pressed="false">학습·조사 <span>01</span></button>
      <span class="filter-count" aria-live="polite">4개 항목</span>
    </div>

    <div class="project-grid">
      <article class="project-card card-featured" data-category="personal">
        <div class="card-top"><span class="category-label label-personal">개인 프로젝트</span><span class="project-status">기획</span></div>
        <div><p class="project-number">PROJECT 01</p><h3>내 학습 노트 Q&amp;A</h3></div>
        <p class="project-summary">쌓여가는 학습 노트에서 답을 찾고, 답변마다 참고한 문단을 확인하는 작은 검색 도구.</p>
        <div class="card-tags"><span>Markdown</span><span>검색 비교</span><span>출처 확인</span></div>
        <div class="card-bottom"><span>예정 결과물 <b>질문·답변 평가표</b></span><a href="{{ '/portfolio/' | relative_url }}">기획 보기 <span aria-hidden="true">↗</span></a></div>
      </article>

      <article class="project-card" data-category="automation">
        <div class="card-top"><span class="category-label label-automation">업무 자동화</span><span class="project-status">기획</span></div>
        <div><p class="project-number">PROJECT 02</p><h3>링크에서 학습 브리핑 만들기</h3></div>
        <p class="project-summary">공개 글 몇 편의 공통점과 차이를 출처 링크와 함께 정리하고, 사람이 검토하는 시간을 측정합니다.</p>
        <div class="card-tags"><span>요약</span><span>출처 추적</span><span>시간 비교</span></div>
        <div class="card-bottom"><span>예정 결과물 <b>브리핑 예시</b></span><a href="{{ '/portfolio/' | relative_url }}">기획 보기 <span aria-hidden="true">↗</span></a></div>
      </article>

      <article class="project-card" data-category="personal">
        <div class="card-top"><span class="category-label label-personal">개인 프로젝트</span><span class="project-status">기획</span></div>
        <div><p class="project-number">PROJECT 03</p><h3>학습 노트를 설명 카드로</h3></div>
        <p class="project-summary">하나의 노트를 짧은 설명 카드로 바꿔보고, 사실 정확성과 모바일 가독성을 직접 점검합니다.</p>
        <div class="card-tags"><span>콘텐츠 제작</span><span>한글 가독성</span><span>사람의 수정</span></div>
        <div class="card-bottom"><span>예정 결과물 <b>수정 전·후 카드</b></span><a href="{{ '/portfolio/' | relative_url }}">기획 보기 <span aria-hidden="true">↗</span></a></div>
      </article>

      <article class="project-card card-journal" data-category="learning">
        <div class="card-top"><span class="category-label label-learning">학습·조사</span><span class="project-status status-done">기록 완료</span></div>
        <div><p class="project-number">FIELD NOTE 01</p><h3>Reddit 사례로 포트폴리오 방향 잡기</h3></div>
        <p class="project-summary">프로젝트 소개 사례를 살펴보고, 결과물·방법·실패를 함께 공개하는 기록 기준을 정했습니다.</p>
        <div class="card-tags"><span>사례 조사</span><span>기록 설계</span></div>
        <div class="card-bottom"><span>학습 기록 <b>2026.10.07</b></span><a href="{{ '/posts/ai-portfolio-plan/' | relative_url }}">기록 읽기 <span aria-hidden="true">↗</span></a></div>
      </article>
    </div>
  </section>

  <section class="journal-section" id="journal" aria-labelledby="journal-title">
    <div class="shell">
      <div class="section-heading">
        <div><p class="eyebrow">NOTES FROM THE PROCESS</p><h2 id="journal-title">최근 학습 기록</h2></div>
        <span class="section-aside">배운 내용과 만든 과정을 차곡차곡</span>
      </div>
      <div class="journal-list">
        {% for post in site.posts %}
        <a class="journal-row" href="{{ post.url | relative_url }}">
          <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: '%Y.%m.%d' }}</time>
          <span class="journal-copy"><strong>{{ post.title | escape }}</strong><small>{{ post.description | escape }}</small></span>
          <span class="journal-arrow" aria-hidden="true">↗</span>
        </a>
        {% else %}
        <p class="empty-state">첫 학습 기록을 준비하고 있습니다.</p>
        {% endfor %}
      </div>
    </div>
  </section>
  <div class="shell closing-note"><span class="closing-mark" aria-hidden="true">✳</span><p>작은 실험 하나씩, 결과와 근거를 더해갑니다.</p><a href="https://github.com/hkkoo/ax-study">GitHub에서 변경 기록 보기 ↗</a></div>
</div>
