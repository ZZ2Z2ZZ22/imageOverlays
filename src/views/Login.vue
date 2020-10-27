<template>

  <div class="login">
    <form>
      <div class="label">
        <label for="username">用户名</label>
        <br/>
        <label for="password">密码</label>
      </div>
      <div class="input">
        <el-input
            placeholder="请输入用户名"
            v-model="username"
            id="username"
            clearable>
        </el-input>
        <br/>

        <el-input
            placeholder="请输入密码"
            v-model="password"
            id="password"
            show-password>
        </el-input>
      </div>
    </form>
    <el-button @click="toHomePage">登录</el-button>
  </div>
</template>

<script>
export default {
  name: "Login",
  data(){
    return {
      username:'',
      password:'',
    }
  },
  methods:{
    toRegister(){
      this.$router.push('/register');
    },
    toHomePage(){
      this.$router.push('/home');
    }
  }
}
</script>

<style scoped>
.login{
  width:50vh;
  margin:2vh 2vh;
}
.label{
  display:inline-block;
  text-align: center;
}
.label :first-child{
  position:relative;
  top:-6.5vh;
}
.input{
  display:inline-block;
}

/deep/ .el-input{
  margin:2vh 2vh;
  width:30vh;
}

/deep/ .el-button{
  margin:2vh 2vh;
}

</style>