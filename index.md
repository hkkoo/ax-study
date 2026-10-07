---
layout: default
title: 홈
---
<section class="hero">
  <p class="eyebrow">LEARN · BUILD · VERIFY</p>
  <h1>AI를 배우고 만들며,<br>결과로 기록합니다.</h1>
  <p>{{ site.description | escape }}</p>
  <a class="button" href="{{ '/portfolio/' | relative_url }}">AI 포트폴리오 보기 →</a>
</section>
<section aria-labelledby="posts-heading">
  <h2 id="posts-heading">최근 학습 기록</h2>
  {% for post in site.posts %}
  <article class="post-card">
    <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: '%Y.%m.%d' }}</time>
    <h3><a href="{{ post.url | relative_url }}">{{ post.title | escape }}</a></h3>
    <p>{{ post.description | escape }}</p>
  </article>
  {% else %}
  <p>첫 번째 학습 기록을 준비하고 있습니다.</p>
  {% endfor %}
</section>
