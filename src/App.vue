<template>
  <div id="app">
    <el-container>
      <el-header>图片标注平台
        <el-dropdown class="person" @command="handleCommand" v-if="show">
           <span class="el-dropdown-link">
           <i class="el-icon-s-custom"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="logout">退出</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-header>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </div>
</template>

<script>
export default {
  name: 'App',
  components:{
  },
  computed:{
    show(){
      if(this.$route.path==='/user'||this.$route.path==='/user/login'||this.$route.path==='/user/register'){
        return false;
      }
        return true;
    },
  },
  methods:{
    handleCommand(command) {
      switch (command) {
        case "logout": {
          this.$router.back();
          break;
        }
      }
    },

  }
}
</script>

<style lang="scss" scoped>
/deep/ .el-container{
  height:100vh;
}

.person{
  float: right;
  color:black;
  border-color:transparent;
  font-size:4.0vh;
  background-color: #B3C0D1;
}

/deep/ .el-header, .el-footer {
  background-color: #B3C0D1;
  color: #333;
  text-align: left;
  line-height: 60px;
  font-size:30px;
  height: auto;
}

/deep/ .el-main {
  background-color: #E9EEF3;
  color: #333;
  text-align: center;
  height: inherit;
  display:flex;
  justify-content: center;
  align-items:center;
  padding:0;
  margin:0;
}

/deep/ body > .el-container {
  margin-bottom: 100px;
}
.person{
  float: right;
  color:black;
  border-color:transparent;
  font-size:4.0vh;
  background-color: #B3C0D1;
  line-height:2;
}
</style>
