---
layout: default
group: Writings
---

<ul class="posts">
  {% for post in site.categories['writings'] limit 10 %}
    <li>
      {% assign read_time = post.content | number_of_words | divided_by: site.words_per_minute %}
      <a class="title" href="{{ BASE_PATH }}{{ post.url }}">{{ post.title }}</a>
      <span class="date">{{ post.date | date: "%Y %b %d" }}</span>
      <span class="read-time">
        {% if read_time == 0 %}
          1 minute
        {% else %}
         {{ read_time }} minutes
        {% endif %}
      </span>
    </li>
    {{ post.content | strip_html | truncatewords: 75, '' }}<a href="{{ post.url }}">...Read more</a><br><br>
  {% endfor %}
</ul>
