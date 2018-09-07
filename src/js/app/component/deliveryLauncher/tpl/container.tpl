<section class="delivery-launcher">
    <header>
        <h2>{{title}}</h2>
    </header>

{{#if deliveries}}
    {{#each deliveries}}
        <article>
            <a href="#" data-id="{{id}}">
                <span class="label">{{label}}</span>
                <span class="icon-play"></span>
            </a>
        </article>
    {{/each}}
{{/if}}

{{#unless deliveries}}
    <p>{{emptyText}}</p>
{{/unless}}
</section>
