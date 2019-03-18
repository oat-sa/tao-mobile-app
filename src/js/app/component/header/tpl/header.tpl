<header class="menu-bar">
    <h1>{{title}}</h1>
    {{#if user}}

    <span class="icon-user"></span>
    <p class="profile">
        {{#if user.lastname}}
            {{user.firstname}} {{user.lastname}}
        {{else}}
            {{user.login}}
        {{/if}}
    </p>
    {{/if}}
    <nav>
    {{#each actions}}
        <a href="#" title="{{title}}" data-route="{{route}}"><span class="icon-{{icon}}"></span></a>

    {{/each}}
    </nav>
</header>
