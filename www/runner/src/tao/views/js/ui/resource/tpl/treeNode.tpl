{{#equal type 'class'}}
<li data-uri="{{uri}}" class="class {{state}}" data-count="{{count}}" {{#if accessMode}}data-access="{{accessMode}}"{{/if}}>
    <a href="#" title="{{label}}"><span class="icon-folder"></span> {{label}}</a>
    <span class="class-toggler" tabindex="0"></span>
    <ul>
    {{#if childList}}
        {{{childList}}}
    {{/if}}
    </ul>
    <div class="more hidden">
        <a href="#" class="btn-info small"><span class="icon-download"></span> {{__ 'Load more'}}</a>
    </div>
</li>
{{/equal}}

{{#equal type 'instance'}}
<li data-uri="{{uri}}" class="instance {{state}}"  {{#if accessMode}}data-access="{{accessMode}}"{{/if}}>
    <a href="#" title="{{label}}"><span class="icon-{{icon}}"></span>{{label}}</a>
</li>
{{/equal}}


