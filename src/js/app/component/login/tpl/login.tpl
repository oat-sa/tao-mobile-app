<section class="login">
    <header>
        <h1><img src="./img/logo.svg"  alt="TAO" /></h1>
    </header>
    <form>
        <span class="placeholder-input username">
            <input type="text" name="username" placeholder="{{__ 'Username'}}" required autocomplete="false" />
            <label for="username">{{__ 'Username'}}</label>
        </span>
        <span class="placeholder-input password">
            <input type="password" name="password" placeholder="{{__ 'Password'}}" required autocomplete="false" />
            <label for="password">{{__ 'Password'}}</label>
        </span>
        <div class="options">
            <label><input type="checkbox" name="asadmin" />Login as admin</label>
        </div>
        <!--input class="btn-info" type="submit" value="{{__ 'Login'}}" /> -->
        <div class="actions"></div>
    </form>
</section>
