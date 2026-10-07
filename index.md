---
layout: default
title: 작업대
description: 일하다 남은 물음표들을 발견하고, AI로 실험하고, 다시 읽을 수 있는 노트로 남기는 개인 작업실.
---
<div class="studio-shell">
  <aside class="studio-rail" aria-label="작업대 목차">
    <a class="rail-name" href="#opening">FIELD<br>NOTES<span>by AX Study</span></a>
    <p class="rail-caption">일의 틈을 관찰하는<br>AI 작업실</p>
    <nav class="rail-nav" aria-label="첫 페이지 목차">
      <a href="#opening"><span>00</span> 작업실 입구</a>
      <a href="#experiments"><span>01</span> 펼쳐 보는 실험</a>
      <a href="#method"><span>02</span> 기록하는 방식</a>
      <a href="#journal"><span>03</span> 남겨 둔 노트</a>
    </nav>
    <p class="rail-footnote">작은 질문을 오래 들여다보는 중.</p>
  </aside>

  <div class="studio-content">
    <header class="studio-opening" id="opening">
      <div class="studio-overline"><span>PERSONAL WORKBENCH</span><span class="studio-state">실험 설계 중</span></div>
      <h1>일하다 남은<br><em>물음표들.</em></h1>
      <p class="studio-lead">“지난번처럼”의 지난번은 언제일까?<br>며칠 전 멈춘 일은 어디서 다시 시작해야 할까?</p>
      <p class="studio-intro">별것 아닌 듯 지나친 불편을 하나씩 꺼내봅니다. AI를 곁에 두고 다른 방법을 시도하며, 도움이 된 순간과 직접 고쳐야 했던 부분을 기록하려 합니다.</p>
      <div class="studio-margin-note"><span aria-hidden="true">↳</span><p>지금은 세 가지 실험을 설계하고 있습니다.<br>완성된 결과는 확인한 순서대로 이 작업대에 놓겠습니다.</p></div>
      <a class="studio-scroll" href="#experiments">첫 노트 펼치기 <span aria-hidden="true">↓</span></a>
      <span class="studio-question" aria-hidden="true">?</span>
    </header>

    <section class="studio-section" id="experiments" aria-labelledby="experiments-heading">
      <div class="studio-section-label"><span>01 / OPEN QUESTIONS</span><span>접힌 제목을 눌러 펼쳐보세요</span></div>
      <h2 id="experiments-heading">답보다 먼저,<br>질문을 다듬는 시간.</h2>
      <p class="studio-section-intro">실험마다 가상의 입력을 먼저 만들었습니다. 무엇을 얻고 싶은지, 무엇이 나오면 실패인지 함께 적어둡니다.</p>
      <div class="experiment-folds">
        {% for experiment in site.data.experiments %}
        <details class="experiment-fold"{% if forloop.first %} open{% endif %}>
          <summary><span class="fold-number">{{ experiment.number }}</span><span class="fold-title"><strong>{{ experiment.title }}</strong><small>{{ experiment.category_label }} · 기획</small></span><span class="fold-sign" aria-hidden="true">+</span></summary>
          <div class="fold-content">
            <h3>{{ experiment.question }}</h3>
            <p>{{ experiment.summary }}</p>
            <blockquote><span>가상의 입력 한 조각</span><p>{{ experiment.input }}</p></blockquote>
            <dl class="fold-notes"><div><dt>확인하고 싶은 것</dt><dd>{{ experiment.hypothesis }}</dd></div><div><dt>남길 결과물</dt><dd>{{ experiment.artifact }}</dd></div></dl>
            <a class="text-link" href="{{ '/portfolio/' | relative_url }}#{{ experiment.id }}">기대 결과와 실패 기준 읽기 <span aria-hidden="true">↗</span></a>
          </div>
        </details>
        {% endfor %}
      </div>
    </section>

    <section class="studio-section method-section" id="method" aria-labelledby="method-heading">
      <div class="studio-section-label"><span>02 / WORKING METHOD</span></div>
      <div class="method-layout">
        <h2 id="method-heading">멋진 답이 나와도<br>한 번 더.</h2>
        <div class="method-copy"><p>잘 읽히는 문장이 실제로 쓸 수 있는 답인지 확인해보려 합니다. 입력과 출력 사이에 무엇이 달라졌는지, 사람이 어디에 손을 댔는지를 살펴봅니다.</p>
          <ol class="method-steps"><li><strong>멈칫한 장면 고르기</strong><span>되묻거나 다시 찾게 되는 순간에서 시작합니다.</span></li><li><strong>같은 입력을 나란히 놓기</strong><span>기존 방식과 AI의 제안을 비교합니다.</span></li><li><strong>고친 흔적까지 남기기</strong><span>실패한 출력과 수정 이유를 다음 실험의 재료로 씁니다.</span></li></ol>
        </div>
      </div>
    </section>

    <section class="studio-section studio-journal" id="journal" aria-labelledby="journal-heading">
      <div class="studio-section-label"><span>03 / NOTEBOOK</span><span>{{ site.posts | size }}개의 기록</span></div>
      <h2 id="journal-heading">생각이 바뀐 자리에도<br>표시를 남깁니다.</h2>
      <ol class="note-timeline">
        {% for post in site.posts %}
        <li class="note-entry">
          <div class="note-date"><time datetime="{{ post.date | date_to_xmlschema }}"><span>{{ post.date | date: '%m.%d' }}</span><small>{{ post.date | date: '%Y' }}</small></time></div>
          <article class="note-body"><p class="note-index">NOTE {{ forloop.index }}</p><h3><a href="{{ post.url | relative_url }}">{{ post.title | escape }} <span aria-hidden="true">↗</span></a></h3><p>{{ post.description | escape }}</p></article>
        </li>
        {% else %}
        <li class="note-empty">첫 관찰을 적을 노트를 펼쳐두었습니다.</li>
        {% endfor %}
      </ol>
    </section>
    <aside class="studio-endnote"><span aria-hidden="true">↳</span><p>다음 실험의 재료는,<br><strong>오늘 다시 물었던 질문 하나.</strong></p><a href="https://github.com/hkkoo/ax-study">변경 이력 보기 ↗</a></aside>
  </div>
</div>
