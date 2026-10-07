---
layout: default
title: 실험 설계 노트
description: 인수인계의 빈칸, 이어하기 버튼, 설명 충돌 실험의 입력 예시와 비교 방법.
permalink: /portfolio/
---
# 실험 설계 노트

일을 하다 멈칫하는 순간을 하나 고르고, AI가 도움이 되는 조건을 찾아봅니다.
아래는 **기획 단계**의 실험입니다. 예시는 직접 구성한 가상 입력과 기대 결과이며,
실제 모델을 실행해 얻은 출력이나 측정값은 아닙니다.

{% for experiment in site.data.experiments %}
<h2 id="{{ experiment.id }}">{{ experiment.number }}. {{ experiment.title }}</h2>

**{{ experiment.question }}**

{{ experiment.summary }}

### 확인하고 싶은 가설

{{ experiment.hypothesis }}

### 입력 예시 · 가상

> {{ experiment.input }}

### 기대하는 결과의 모양 · 실행 전

{{ experiment.expected }}

### 첫 실험의 범위

{{ experiment.scope }}

### 비교하는 방법

{{ experiment.method }}

### 실패로 기록할 장면

{{ experiment.failure }}

**만들 결과물:** {{ experiment.artifact }}

**바로 다음 행동:** {{ experiment.next }}

{% endfor %}
## 실험이 끝나면 남길 것

입력 원본, 수정 전 출력, 사람이 고친 부분을 함께 놓습니다.
좋아 보이는 답이 나온 사례뿐 아니라, 다시 맡기기 어려웠던 사례도 적습니다.
시간을 비교할 때는 입력 준비와 검토·수정에 걸린 시간까지 포함합니다.

[실험 기록 양식](https://github.com/hkkoo/ax-study/blob/main/docs/project-template.md) · [작업실 홈]({{ '/' | relative_url }})
