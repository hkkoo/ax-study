---
layout: default
title: 홈
---
<section class="hero">
  <p class="eyebrow">LEARN · EXPERIMENT · SHARE</p>
  <h1>배우고 실험하며,<br>작은 변화를 기록합니다.</h1>
  <p>{{ site.description | escape }}</p>
  <a class="button" href="{{ '/about/' | relative_url }}">AX Study 소개 →</a>
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
