<template>
  <div class="about">
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
    <el-button>注册</el-button>
  </div>
</template>

<script>
export default {
  name: "Register",
  data(){
    return {
      username:'',
      password:'',
    }
  },
  methods:{
    toLogin(){
      this.$router.push('/login');
    }
  }
}
</script>

<style scoped>
.register{
  width:50vh;
  /*border-radius: 4px;*/
  margin:2vh 2vh;
  /*box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);*/
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