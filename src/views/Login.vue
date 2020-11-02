<template>
  <div class="login">
    <form>
      <div class="label">
        <label for="username">用户名</label>
        <label for="password">密码</label>
      </div>
      <div class="input">
        <el-input
            class="userInput"
            placeholder="请输入用户名"
            v-model="username"
            id="username"
            clearable>
        </el-input>
        <el-input
            class="userInput"
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
    toHomePage(){
      this.$router.push('/home');
    }
  }
}
</script>

<style scoped>
.login{
  width:25vw;
  height:28vh;
}
.login form{
  width:25vw;
  height:70%;
  display:flex;
  margin:2vh 0vw;
}
.label{
  width:10vw;
  height:100%;
  display:flex;
  align-items:center;
  flex-flow: column wrap;
  justify-content: center;
  font-size:15px;
}
.label :first-child{
  position:relative;
  top:-3.5vh;
  left:3vw;
}
.label :nth-child(2) {
  position:relative;
  top:3vh;
  left:3vw;
}

.input{
  margin:0vh 5vw 0 2vw;
  width:15vw;
  height:100%;
  display:flex;
  align-items:center;
  flex-flow: row wrap;
  justify-content: center;
}

</style>