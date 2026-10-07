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
        <span class="status-pill"><span class="status-dot"></span> 프로젝트 기획 단계</span>
      </div>
      <h1 id="hero-title">AI 학습 및<br><span>업무 적용 포트폴리오</span></h1>
      <p class="hero-description">AI 활용 프로젝트의 목적, 수행 방법 및 검증 결과를 관리합니다. 업무 자동화와 학습 과제를 중심으로 실험 계획 및 산출물을 공개합니다.</p>
      <div class="hero-actions">
        <a class="button button-primary" href="#projects">프로젝트 목록 <span aria-hidden="true">↘</span></a>
        <a class="text-link" href="#journal">학습 기록 <span aria-hidden="true">→</span></a>
      </div>
      <p class="hero-meta"><span>관심 주제</span> 생성형 AI · 검색 · 업무 자동화</p>
    </div>
    <aside class="current-project" aria-label="현재 준비 중인 실험">
      <div class="panel-topline"><span>NOW EXPLORING</span><span class="panel-index">01 / 03</span></div>
      <p class="panel-label">첫 번째 실험</p>
      <h2>인수인계 정보<br>누락 점검</h2>
      <p class="panel-description">업무 메모의 담당자, 기한, 완료 조건을 점검하고 추가 확인이 필요한 항목을 도출합니다.</p>
      <div class="panel-rule"></div>
      <div class="panel-plan"><span>실험 계획</span><strong>가상 업무 메모 10개</strong></div>
      <a href="{{ '/portfolio/' | relative_url }}" class="panel-link">기획과 검증 기준 보기 <span aria-hidden="true">↗</span></a>
      <span class="panel-orbit orbit-one" aria-hidden="true"></span>
      <span class="panel-orbit orbit-two" aria-hidden="true"></span>
    </aside>
  </section>

  <section class="shell metrics" aria-label="포트폴리오 현황">
    <div class="metric-card metric-highlight"><span class="metric-label">프로젝트 후보</span><strong>{{ site.data.experiments | size }}</strong><span class="metric-caption">기획 단계의 실험</span></div>
    <div class="metric-card"><span class="metric-label">구현 완료</span><strong>00</strong><span class="metric-caption">구현 예정</span></div>
    <div class="metric-card"><span class="metric-label">검증 완료</span><strong>00</strong><span class="metric-caption">측정 후 기록 예정</span></div>
    <div class="metric-card"><span class="metric-label">학습 기록</span><strong>{{ site.posts | size }}</strong><span class="metric-caption">실험과 제작 과정</span></div>
  </section>

  <section class="shell projects-section" id="projects" aria-labelledby="projects-title">
    <span id="experiments"></span>
    <div class="section-heading">
      <div><p class="eyebrow">IDEAS TO EXPERIMENTS</p><h2 id="projects-title">프로젝트 계획</h2></div>
      <a class="section-link" href="{{ '/portfolio/' | relative_url }}">전체 기획 보기 <span aria-hidden="true">↗</span></a>
    </div>
    <p class="section-intro">현재 프로젝트는 기획 단계입니다. 각 카드에서 추진 목적과 예정 산출물을 확인할 수 있습니다.</p>
    <div class="filter-bar" role="group" aria-label="프로젝트 분류">
      <button class="filter-button is-active" type="button" data-filter="all" aria-pressed="true">전체 <span>{{ site.data.experiments | size }}</span></button>
      <button class="filter-button" type="button" data-filter="personal" aria-pressed="false">개인 프로젝트 <span>{{ site.data.experiments | where: 'category', 'personal' | size }}</span></button>
      <button class="filter-button" type="button" data-filter="automation" aria-pressed="false">업무 자동화 <span>{{ site.data.experiments | where: 'category', 'automation' | size }}</span></button>
      <button class="filter-button" type="button" data-filter="learning" aria-pressed="false">학습·조사 <span>{{ site.data.experiments | where: 'category', 'learning' | size }}</span></button>
      <span class="filter-count" aria-live="polite">{{ site.data.experiments | size }}개 항목</span>
    </div>

    <div class="project-grid">
      {% for experiment in site.data.experiments %}
      <article class="project-card" data-category="{{ experiment.category }}">
        <div class="card-top"><span class="category-label label-{{ experiment.category }}">{{ experiment.category_label }}</span><span class="project-status">기획</span></div>
        <div><p class="project-number">PROJECT {{ experiment.number }}</p><h3>{{ experiment.title }}</h3></div>
        <p class="project-summary">{{ experiment.summary }}</p>
        <div class="card-tags">{% for tag in experiment.tags %}<span>{{ tag }}</span>{% endfor %}</div>
        <div class="card-bottom"><span>예정 산출물 <b>{{ experiment.artifact }}</b></span><a href="{{ '/portfolio/' | relative_url }}#{{ experiment.id }}">상세 계획 <span aria-hidden="true">↗</span></a></div>
      </article>
      {% endfor %}
    </div>
  </section>

  <section class="journal-section" id="journal" aria-labelledby="journal-title">
    <div class="shell">
      <div class="section-heading">
        <div><p class="eyebrow">NOTES FROM THE PROCESS</p><h2 id="journal-title">최근 학습 기록</h2></div>
        <span class="section-aside">학습 내용 및 프로젝트 진행 내역</span>
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
  <div class="shell closing-note"><span class="closing-mark" aria-hidden="true">✳</span><p>실행 결과와 검토 근거는 프로젝트 진행에 따라 업데이트합니다.</p><a href="https://github.com/hkkoo/ax-study">GitHub에서 변경 기록 보기 ↗</a></div>
</div>
