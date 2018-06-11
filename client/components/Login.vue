<template>
    <div class="container">
        <p class="alert alert-danger" v-for="item in errors">{{item.msg}}</p>

        <form class="form-signin">
            <h2 class="form-signin-heading">
                登录
                <small><router-link class="pull-right" to="/reg">注册</router-link></small>
            </h2>
            <label class="sr-only">用户名</label>
            <input type="text" class="form-control" v-model="userName" placeholder="用户名" />
            <label class="sr-only">密码</label>
            <input type="password" class="form-control" v-model="pwd" placeholder="Password" />
            <div class="checkbox">
                <label>
                    <input type="checkbox" value="remember-me"> 记住我
                </label>
            </div>
            <a class="btn btn-lg btn-primary btn-block" @click="login(userName, password)">登录</a>
        </form>

    </div> <!-- /container -->
</template>

<script>
export default{
    data(){
        return{
            userName:'',
            password:'',
            errors:{}
        }
    },
    methods:{
        login(userName, password){
            this.$http.post('/ChainBook/user/localLogin',{
                userName:userName,
                pwd: password,
            }).then(function(res){
                if(res.status==200){
                    console.log('登录成功');
                    this.$router.push('/');
                }else{
                    console.log('登录失败')
                }
            },function(res){
                console.log('登录失败，未通过服务端校验'+ res.status);
                this.errors=res.body;
            });
        }
    }
}
</script>

<style scoped src="../css/signin.css">
</style>
