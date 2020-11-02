<template>
  <div class="user">
    <div class="panel">
      <router-link to="/user/login" class="menu" default>登录</router-link>
      <router-link to="/user/register" class="menu">注册</router-link>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
name: "User"
}
</script>

<style scoped>
.user{
  font-family: "Arial";
  width:25vw;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
  height:38vh;
}
.panel{
  width:100%;
  height:8vh;
  line-height:8vh;
  box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
}
.panel a {
  text-decoration: none;
}
.menu{
  display:inline-block;
  box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
  font-size:25px;
  text-align: center;
  width:50%;
  height:100%;
}
.router-link-exact-active{
  background:#67C23A;
}
/*.router-link-active {*/
/*  text-decoration: none;*/
/*}*/
</style>