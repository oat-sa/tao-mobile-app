<header class="menu-bar">
    <h1>{{title}}</h1>
    {{#if user}}
    <div class="profile">
        <span class="icon-user"></span>
        {{#if user.lastname}}
        <p>{{user.firstname}} {{user.lastname}}</p>
        {{else}}
        <p>{{user.login}}</p>
        {{/if}}
    </div>
    {{/if}}
    <nav>
    {{#each actions}}
        <a href="#" title="{{title}}" data-route="{{route}}"><span class="icon-{{icon}}"></span></a>
    {{/each}}
    </nav>
</header>
