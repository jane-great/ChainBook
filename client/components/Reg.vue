<template>
    <div class="container">
        <p class="alert alert-danger" v-for="item in errors">{{item.msg}}</p>

        <form class="form-signin">
            <h2 class="form-signin-heading">
                注册
                <small><router-link class="pull-right" to="/login">登录</router-link></small>
            </h2>
            <label class="sr-only">邮箱</label>
            <input type="email" class="form-control" v-model="email" placeholder="Email address" />
            <label class="sr-only">密码</label>
            <input type="password" class="form-control noradius" v-model="password" placeholder="Password" />
            <label class="sr-only">重复密码</label>
            <input type="password" class="form-control" v-model="comfirmPassword" placeholder="comfirm password" />
            <a class="btn btn-lg btn-primary btn-block"  @click="reg(email, password, comfirmPassword)">注册</a>
        </form>

    </div> <!-- /container -->
</template>

<script>
export default{
    data(){
        return{
            email:'',
            password:'',
            comfirmPassword:'',

            errors:{}
        }
    },

    methods:{
        reg(email, password, comfirmPassword){
            this.$http.post('/ChainBook/register',{
                email: this.email,
                password: this.password,
                comfirmPassword: this.comfirmPassword
            }).then(function(res){
                if(res.status==200){
                    console.log('注册成功');
                    this.$router.push('/login');
                }else{
                    console.log('注册失败')
                }
            },function(res){
                console.log('注册失败，未通过服务端校验'+ res.status);
                this.errors=res.body;
            });
        }
    }
}
</script>

<style scoped src="../css/signin.css">
</style>
