<section class="login">
    <header>
        <h1><img src="{{baseUrl}}img/logo.svg"  alt="TAO" /></h1>
    </header>
    <form>
        <span class="placeholder-input username">
            <input type="text" name="username" placeholder="{{__ 'Username'}}" required autocomplete="off" />
            <label for="username">{{__ 'Username'}}</label>
            <span class="txt-error">{{__ 'Invalid username or password'}}</span>
        </span>
        <span class="placeholder-input password">
            <input type="password" name="password" placeholder="{{__ 'Password'}}" required autocomplete="off" />
            <label for="password">{{__ 'Password'}}</label>
            <span class="txt-error">{{__ 'Invalid username or password'}}</span>
        </span>
        <div class="actions">
            <input type="submit" class="hidden-submiter" />
        </div>
    </form>
</section>
